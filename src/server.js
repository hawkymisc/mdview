import http from "node:http";
import { createReadStream, watch as fsWatch } from "node:fs";
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { renderMarkdown } from "./render.js";
import { renderPage } from "./template.js";

const SSE_PATH = "/__mdview/events";
const EDIT_CHECKBOX_PATH = "/__mdview/edit/checkbox";
const EDIT_COMMENT_PATH = "/__mdview/edit/comment";
const WATCH_DEBOUNCE_MS = 75;
const SSE_KEEPALIVE_MS = 25_000;
const MAX_EDIT_BODY_BYTES = 64 * 1024;

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

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
}

function safeResolve(rootDir, urlPath) {
  const decoded = decodeURIComponent(urlPath);
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

async function serveMarkdown(res, filePath) {
  const raw = await readFile(filePath, "utf8");
  const body = renderMarkdown(raw);
  const html = renderPage({
    title: path.basename(filePath),
    bodyHtml: body,
    sourcePath: filePath,
  });
  send(res, 200, html, { "content-type": "text/html; charset=utf-8" });
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

function attachSseClient(res, clients) {
  res.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    "connection": "keep-alive",
    "x-accel-buffering": "no",
  });
  res.write("retry: 3000\n");
  res.write(": connected\n\n");
  clients.add(res);
  res.on("close", () => clients.delete(res));
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

function readJsonBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    let aborted = false;
    req.on("data", (c) => {
      if (aborted) return;
      total += c.length;
      if (total > maxBytes) {
        aborted = true;
        const err = new Error("payload too large");
        err.code = "payload-too-large";
        reject(err);
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      if (aborted) return;
      try {
        const buf = Buffer.concat(chunks);
        const txt = buf.toString("utf8");
        resolve(txt ? JSON.parse(txt) : {});
      } catch (e) {
        const err = new Error("invalid JSON");
        err.code = "invalid-json";
        err.cause = e;
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

// Markdown 内の N 番目のタスクリストチェックボックスを toggle する。
// `[ ]`, `[x]`, `[X]` のいずれもマッチさせ、checked パラメータに従って差し替える。
export async function applyCheckboxEdit(filePath, index, checked) {
  if (!Number.isInteger(index) || index < 0) {
    const e = new Error("invalid index");
    e.code = "invalid-index";
    throw e;
  }
  const raw = await readFile(filePath, "utf8");
  const re = /^([ \t]*[-*+][ \t]+\[)([ xX])(\])/gm;
  let i = 0;
  let changed = false;
  const updated = raw.replace(re, (m, p1, _p2, p3) => {
    const cur = i;
    i++;
    if (cur !== index) return m;
    changed = true;
    return `${p1}${checked ? "x" : " "}${p3}`;
  });
  if (!changed) {
    const e = new Error("checkbox not found");
    e.code = "checkbox-not-found";
    throw e;
  }
  await writeFile(filePath, updated, "utf8");
}

// 範囲選択された text を <span class="mdview-comment-mark" ...> でラップし、
// ファイル末尾に <!--mdview-comment[id]: body--> を追記する。
// before / after は DOM 上の前後コンテキストで、ソース内での一意特定に使う。
export async function applyCommentInsert(
  filePath,
  { selectedText, before = "", after = "", comment },
) {
  if (typeof selectedText !== "string" || selectedText.length === 0) {
    const e = new Error("selectedText required");
    e.code = "selected-text-required";
    throw e;
  }
  if (typeof comment !== "string" || comment.trim() === "") {
    const e = new Error("comment required");
    e.code = "comment-required";
    throw e;
  }
  const raw = await readFile(filePath, "utf8");
  const search = before + selectedText + after;
  const idx = raw.indexOf(search);
  if (idx < 0) {
    const e = new Error("selection not found in source");
    e.code = "selection-not-found";
    throw e;
  }
  const dup = raw.indexOf(search, idx + 1);
  if (dup >= 0) {
    const e = new Error("selection is ambiguous");
    e.code = "selection-ambiguous";
    throw e;
  }
  const ids = [...raw.matchAll(/<!--\s*mdview-comment\[(\d+)\]:/g)].map((m) =>
    Number(m[1]),
  );
  const newId = (ids.length ? Math.max(...ids) : 0) + 1;
  const start = idx + before.length;
  const end = start + selectedText.length;
  const head = raw.slice(0, start);
  const middle = raw.slice(start, end);
  const tail = raw.slice(end);
  const wrapped = `<span class="mdview-comment-mark" data-mdview-comment-id="${newId}">${middle}</span>`;
  let next = head + wrapped + tail;
  if (!next.endsWith("\n")) next += "\n";
  // コメント本体内の `-->` は別文字に置換しないと HTML コメントが早期終了する
  // 改行は 1 行コメント前提で空白に正規化
  const safeBody = comment
    .replace(/-->/g, "—>")
    .replace(/[\r\n]+/g, " ")
    .trim();
  next += `<!--mdview-comment[${newId}]: ${safeBody}-->\n`;
  await writeFile(filePath, next, "utf8");
  return newId;
}

export function createMdviewServer({ filePath, port = 0, host = "127.0.0.1" }) {
  const absFile = path.resolve(filePath);
  const rootDir = path.dirname(absFile);
  const targetBase = path.basename(absFile);

  const sseClients = new Set();
  const watcher = startWatcher(rootDir, targetBase, () =>
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

      if (pathname === "/" || pathname === "/index.html") {
        await serveMarkdown(res, absFile);
        return;
      }

      if (pathname === "/raw") {
        const raw = await readFile(absFile, "utf8");
        send(res, 200, raw, { "content-type": "text/markdown; charset=utf-8" });
        return;
      }

      if (pathname === SSE_PATH) {
        attachSseClient(res, sseClients);
        return;
      }

      if (pathname === EDIT_CHECKBOX_PATH) {
        if (req.method !== "POST") {
          sendJson(res, 405, { ok: false, error: "method not allowed" });
          return;
        }
        try {
          const body = await readJsonBody(req, MAX_EDIT_BODY_BYTES);
          await applyCheckboxEdit(absFile, body.index, !!body.checked);
          sendJson(res, 200, { ok: true });
        } catch (e) {
          const status = e.code === "checkbox-not-found" ? 404 : 400;
          sendJson(res, status, {
            ok: false,
            error: e.message,
            code: e.code,
          });
        }
        return;
      }

      if (pathname === EDIT_COMMENT_PATH) {
        if (req.method !== "POST") {
          sendJson(res, 405, { ok: false, error: "method not allowed" });
          return;
        }
        try {
          const body = await readJsonBody(req, MAX_EDIT_BODY_BYTES);
          const id = await applyCommentInsert(absFile, body);
          sendJson(res, 200, { ok: true, id });
        } catch (e) {
          const status =
            e.code === "selection-not-found" || e.code === "selection-ambiguous"
              ? 422
              : 400;
          sendJson(res, status, {
            ok: false,
            error: e.message,
            code: e.code,
          });
        }
        return;
      }

      const resolved = safeResolve(rootDir, pathname);
      if (!resolved) {
        send(res, 403, "forbidden");
        return;
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
            watcher.close();
            for (const sseRes of sseClients) {
              try {
                sseRes.end();
                // res.end() で HTTP レスポンスを終了させても keep-alive で
                // TCP ソケットは生存し続けるため、明示的に破棄する。
                // これがないと server.close() のコールバックが解決せず
                // bin/mdview.js の SIGINT ハンドラが await で hang する。
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
