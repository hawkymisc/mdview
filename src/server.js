import http from "node:http";
import { createReadStream, watch as fsWatch } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { renderMarkdown } from "./render.js";
import { renderPage } from "./template.js";

const SSE_PATH = "/__mdview/events";
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
