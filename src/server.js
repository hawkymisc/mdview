import http from "node:http";
import { createReadStream, watch as fsWatch } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { renderMarkdown } from "./render.js";
import { renderPage } from "./template.js";
import { isInScannedScope, normalizeMdPath } from "./paths.js";

const SSE_PATH = "/__mdview/events";
const FILES_PATH = "/__mdview/files";
const FRAGMENT_PATH = "/__mdview/fragment";
const WATCH_DEBOUNCE_MS = 75;
const SSE_KEEPALIVE_MS = 25_000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

function mimeFor(file) {
  return MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "content-type": "text/plain; charset=utf-8",
    ...headers,
  });
  res.end(body);
}

function safeResolve(rootDir, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const joined = path.join(rootDir, decoded);
  const normalized = path.resolve(joined);
  const rootResolved = path.resolve(rootDir);
  if (
    normalized !== rootResolved &&
    !normalized.startsWith(rootResolved + path.sep)
  ) {
    return null;
  }
  return normalized;
}

function wantsHtml(req) {
  const accept = String(req.headers["accept"] ?? "");
  return accept.includes("text/html");
}

async function renderMarkdownFile(filePath, sourcePath) {
  const raw = await readFile(filePath, "utf8");
  const body = renderMarkdown(raw);
  return renderPage({
    title: path.basename(filePath),
    bodyHtml: body,
    sourcePath: sourcePath ?? filePath,
  });
}

async function serveRenderedMarkdown(res, filePath) {
  const html = await renderMarkdownFile(filePath);
  send(res, 200, html, { "content-type": "text/html; charset=utf-8" });
}

async function serveRawMarkdown(res, filePath) {
  const raw = await readFile(filePath, "utf8");
  send(res, 200, raw, { "content-type": "text/markdown; charset=utf-8" });
}

async function serveFragment(res, filePath) {
  const raw = await readFile(filePath, "utf8");
  const body = renderMarkdown(raw);
  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "x-mdview-title": encodeURIComponent(path.basename(filePath)),
    "cache-control": "no-store",
  });
  res.end(body);
}

async function serveStatic(res, filePath) {
  const info = await stat(filePath);
  if (info.isDirectory()) {
    send(res, 404, "not found");
    return;
  }
  res.writeHead(200, {
    "content-type": mimeFor(filePath),
    "content-length": info.size,
  });
  createReadStream(filePath).pipe(res);
}

async function listMarkdownTree(rootDir) {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const files = [];
  const directories = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push({ name: entry.name, path: entry.name });
    } else if (entry.isDirectory()) {
      const subPath = path.join(rootDir, entry.name);
      let subEntries;
      try {
        subEntries = await readdir(subPath, { withFileTypes: true });
      } catch {
        continue;
      }
      const subFiles = [];
      for (const sub of subEntries) {
        if (sub.name.startsWith(".")) continue;
        if (sub.isFile() && sub.name.toLowerCase().endsWith(".md")) {
          subFiles.push({
            name: sub.name,
            path: `${entry.name}/${sub.name}`,
          });
        }
      }
      if (subFiles.length > 0) {
        const collator = new Intl.Collator(undefined, {
          sensitivity: "base",
          numeric: true,
        });
        subFiles.sort((a, b) => collator.compare(a.name, b.name));
        directories.push({ name: entry.name, files: subFiles });
      }
    }
  }
  const collator = new Intl.Collator(undefined, {
    sensitivity: "base",
    numeric: true,
  });
  files.sort((a, b) => collator.compare(a.name, b.name));
  directories.sort((a, b) => collator.compare(a.name, b.name));
  return { files, directories };
}

function startTargetWatcher(rootDir, relPath, onChange) {
  // SSE 接続単位の watcher。relPath は rootDir からの相対 (深さ 0 or 1)。
  const target = path.join(rootDir, relPath);
  const dirToWatch = path.dirname(target);
  const baseName = path.basename(target);
  let timer = null;
  const fire = () => {
    timer = null;
    onChange();
  };
  let watcher;
  try {
    watcher = fsWatch(dirToWatch, { persistent: false }, (_event, filename) => {
      if (!filename || filename !== baseName) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(fire, WATCH_DEBOUNCE_MS);
    });
  } catch (err) {
    console.warn(`mdview: file watcher disabled (${err.message})`);
    return { close: () => {} };
  }
  watcher.on("error", (err) => {
    console.warn(`mdview: watcher error: ${err.message}`);
  });
  return {
    close: () => {
      if (timer) clearTimeout(timer);
      try {
        watcher.close();
      } catch {
        /* already closed */
      }
    },
  };
}

function attachSseClient(res, clients, perConnectionWatcher) {
  res.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    "connection": "keep-alive",
    "x-accel-buffering": "no",
  });
  res.write("retry: 3000\n");
  res.write(": connected\n\n");
  clients.add(res);
  res.on("close", () => {
    clients.delete(res);
    if (perConnectionWatcher) {
      try {
        perConnectionWatcher.close();
      } catch {
        /* ignore */
      }
    }
  });
}

function broadcastReloadTo(res) {
  const frame = `event: reload\ndata: {"ts":${Date.now()}}\n\n`;
  try {
    res.write(frame);
  } catch {
    /* dropped */
  }
}

function broadcastReload(clients) {
  const frame = `event: reload\ndata: {"ts":${Date.now()}}\n\n`;
  for (const res of clients) {
    try {
      res.write(frame);
    } catch {
      clients.delete(res);
    }
  }
}

function startWatcher(rootDir, targetBase, onChange) {
  let timer = null;
  const fire = () => {
    timer = null;
    onChange();
  };
  let watcher;
  try {
    watcher = fsWatch(rootDir, { persistent: false }, (_event, filename) => {
      if (!filename || filename !== targetBase) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(fire, WATCH_DEBOUNCE_MS);
    });
  } catch (err) {
    console.warn(`mdview: file watcher disabled (${err.message})`);
    return { close: () => {} };
  }
  watcher.on("error", (err) => {
    console.warn(`mdview: watcher error: ${err.message}`);
  });
  return {
    close: () => {
      if (timer) clearTimeout(timer);
      try {
        watcher.close();
      } catch {
        /* already closed */
      }
    },
  };
}

export function createMdviewServer({ filePath, port = 0, host = "127.0.0.1" }) {
  const absFile = path.resolve(filePath);
  const rootDir = path.dirname(absFile);
  const targetBase = path.basename(absFile);

  const sseClients = new Set();
  // 起動 md (デフォルトクエリ無し SSE 用) の watcher。
  // クエリ ?path= 付き SSE は別途 per-connection watcher を持つ。
  const defaultWatcher = startWatcher(rootDir, targetBase, () =>
    broadcastReload(sseClients),
  );
  const keepAlive = setInterval(() => {
    for (const res of sseClients) {
      try {
        res.write(": keepalive\n\n");
      } catch {
        sseClients.delete(res);
      }
    }
  }, SSE_KEEPALIVE_MS);
  keepAlive.unref?.();

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
      const pathname = url.pathname;

      // ファイル一覧 API
      if (pathname === FILES_PATH) {
        const tree = await listMarkdownTree(rootDir);
        const body = JSON.stringify({
          root: targetBase,
          ...tree,
        });
        send(res, 200, body, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        });
        return;
      }

      // フラグメント API (SPA 遷移用、main innerHTML のみ返す)
      if (pathname === FRAGMENT_PATH) {
        const rawPath = url.searchParams.get("path");
        const normalized = normalizeMdPath(rawPath);
        if (!normalized || !normalized.toLowerCase().endsWith(".md")) {
          send(res, 400, "invalid path");
          return;
        }
        if (!isInScannedScope(normalized)) {
          send(res, 403, "out of scope");
          return;
        }
        const resolved = safeResolve(rootDir, normalized);
        if (!resolved) {
          send(res, 403, "forbidden");
          return;
        }
        try {
          await serveFragment(res, resolved);
        } catch (err) {
          if (err && (err.code === "ENOENT" || err.code === "ENOTDIR")) {
            send(res, 404, "not found");
            return;
          }
          throw err;
        }
        return;
      }

      // SSE エンドポイント (クエリ path で per-connection watcher 切替)
      if (pathname === SSE_PATH) {
        const rawPath = url.searchParams.get("path");
        if (rawPath != null) {
          const normalized = normalizeMdPath(rawPath);
          if (
            !normalized ||
            !isInScannedScope(normalized) ||
            !safeResolve(rootDir, normalized)
          ) {
            send(res, 403, "forbidden");
            return;
          }
          const watcher = startTargetWatcher(rootDir, normalized, () =>
            broadcastReloadTo(res),
          );
          attachSseClient(res, sseClients, watcher);
          return;
        }
        attachSseClient(res, sseClients);
        return;
      }

      // ルート: 起動 md をレンダリング
      if (pathname === "/" || pathname === "/index.html") {
        await serveRenderedMarkdown(res, absFile);
        return;
      }

      // /raw: 起動 md の生 markdown (後方互換)
      if (pathname === "/raw") {
        await serveRawMarkdown(res, absFile);
        return;
      }

      const resolved = safeResolve(rootDir, pathname);
      if (!resolved) {
        send(res, 403, "forbidden");
        return;
      }

      // .md 拡張子は Accept ヘッダ / ?raw=1 で分岐
      // - ?raw=1               → raw markdown (明示エスケープハッチ)
      // - Accept: text/html    → rendered HTML (ブラウザ直接アクセス想定)
      // - それ以外 (curl 等)   → raw markdown (後方互換)
      if (resolved.toLowerCase().endsWith(".md")) {
        try {
          const isRawForced = url.searchParams.get("raw") === "1";
          if (!isRawForced && wantsHtml(req)) {
            await serveRenderedMarkdown(res, resolved);
          } else {
            await serveRawMarkdown(res, resolved);
          }
          return;
        } catch (err) {
          if (err && (err.code === "ENOENT" || err.code === "ENOTDIR")) {
            send(res, 404, "not found");
            return;
          }
          throw err;
        }
      }

      try {
        await serveStatic(res, resolved);
      } catch (err) {
        if (err && (err.code === "ENOENT" || err.code === "ENOTDIR")) {
          send(res, 404, "not found");
          return;
        }
        throw err;
      }
    } catch (err) {
      console.error("mdview server error:", err);
      if (!res.headersSent) send(res, 500, "internal server error");
      else res.end();
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const addr = server.address();
      resolve({
        port: addr.port,
        host,
        url: `http://${host}:${addr.port}`,
        close: () =>
          new Promise((res) => {
            clearInterval(keepAlive);
            defaultWatcher.close();
            for (const sseRes of sseClients) {
              try {
                sseRes.end();
                sseRes.socket?.destroy();
              } catch {
                /* ignore */
              }
            }
            sseClients.clear();
            server.closeAllConnections?.();
            server.close(() => res());
          }),
      });
    });
  });
}
