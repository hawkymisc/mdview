import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createMdviewServer } from "../src/server.js";

function fetchText(url) {
  return fetch(url).then(async (res) => ({
    status: res.status,
    contentType: res.headers.get("content-type") ?? "",
    body: await res.text(),
  }));
}

async function readUntil(reader, predicate, timeoutMs) {
  const decoder = new TextDecoder();
  const deadline = Date.now() + timeoutMs;
  let buf = "";
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now();
    const { value, done } = await Promise.race([
      reader.read(),
      delay(remaining, "__timeout__").then((v) => ({ value: v })),
    ]);
    if (value === "__timeout__") break;
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    if (predicate(buf)) return buf;
  }
  return buf;
}

describe("createMdviewServer", () => {
  let dir;
  let mdPath;
  let server;
  let baseUrl;

  before(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "mdview-test-"));
    mdPath = path.join(dir, "doc.md");
    writeFileSync(
      mdPath,
      [
        "# Title",
        "",
        "Hello from **mdview**.",
        "",
        "![logo](./assets/logo.png)",
        "",
        "```mermaid",
        "graph LR",
        "A-->B",
        "```",
      ].join("\n"),
    );
    mkdirSync(path.join(dir, "assets"));
    writeFileSync(path.join(dir, "assets", "logo.png"), "PNGBYTES");

    server = await createMdviewServer({ filePath: mdPath, port: 0 });
    baseUrl = `http://127.0.0.1:${server.port}`;
  });

  after(async () => {
    await server.close();
  });

  test("GET / は HTML を 200 で返す", async () => {
    const res = await fetchText(`${baseUrl}/`);
    assert.equal(res.status, 200);
    assert.match(res.contentType, /text\/html/);
    assert.match(res.body, /<h1[^>]*>Title<\/h1>/);
  });

  test("HTML 本体にテーマ切替のトリガーボタンが含まれる", async () => {
    const res = await fetchText(`${baseUrl}/`);
    assert.match(res.body, /id="theme-toggle"/);
    // ARIA 属性: メニューを持つボタンであることを示す
    assert.match(res.body, /aria-haspopup="menu"/);
    assert.match(res.body, /aria-expanded="(true|false)"/);
  });

  test("HTML 本体にテーマ選択メニューが含まれる", async () => {
    const res = await fetchText(`${baseUrl}/`);
    // メニューコンテナ
    assert.match(res.body, /id="theme-menu"/);
    assert.match(res.body, /role="menu"/);
    // ライト・ダークの両選択肢が存在
    assert.match(res.body, /data-theme-choice="light"/);
    assert.match(res.body, /data-theme-choice="dark"/);
    // 各選択肢が menuitemradio として宣言されている (ラジオ的に1つだけ選択中)
    assert.match(res.body, /role="menuitemradio"/);
  });

  test("HTML 本体に mermaid.js のスクリプトが含まれる", async () => {
    const res = await fetchText(`${baseUrl}/`);
    assert.match(res.body, /mermaid/i);
  });

  test("GET /assets/logo.png は画像をそのまま返す", async () => {
    const res = await fetchText(`${baseUrl}/assets/logo.png`);
    assert.equal(res.status, 200);
    assert.equal(res.body, "PNGBYTES");
  });

  test("親ディレクトリに抜けるパスは 403 を返す (パストラバーサル防御)", async () => {
    // fetch() は URL を自動正規化するため、パストラバーサルを試す
    // エンコード済みパス (%2e%2e) でサーバー側のデコード後検査を確認する
    const res = await fetchText(`${baseUrl}/%2e%2e/%2e%2e/etc/passwd`);
    assert.ok(
      res.status === 403 || res.status === 404,
      `expected 403 or 404, got ${res.status}`,
    );
  });

  test("存在しないパスは 404 を返す", async () => {
    const res = await fetchText(`${baseUrl}/nope.bin`);
    assert.equal(res.status, 404);
  });

  test("HTML 本体に SSE 購読クライアントが埋め込まれている", async () => {
    const res = await fetchText(`${baseUrl}/`);
    assert.match(res.body, /new EventSource\(['"]\/__mdview\/events['"]\)/);
    // reload イベントを購読していることを示す痕跡
    assert.match(res.body, /addEventListener\(['"]reload['"]/);
  });

  test("GET /__mdview/events は text/event-stream を 200 で返す", async () => {
    const ac = new AbortController();
    try {
      const res = await fetch(`${baseUrl}/__mdview/events`, {
        signal: ac.signal,
      });
      assert.equal(res.status, 200);
      assert.match(
        res.headers.get("content-type") ?? "",
        /text\/event-stream/,
      );
      // SSE は long-lived。初期コメント/retry を受け取ったら一旦切断する
      const reader = res.body.getReader();
      const initial = await readUntil(reader, (b) => b.length > 0, 1000);
      assert.ok(initial.length > 0, "expected some initial SSE bytes");
    } finally {
      ac.abort();
    }
  });

  test("ファイル変更時に SSE クライアントへ reload イベントが配信される", async () => {
    const ac = new AbortController();
    try {
      const res = await fetch(`${baseUrl}/__mdview/events`, {
        signal: ac.signal,
      });
      assert.equal(res.status, 200);
      const reader = res.body.getReader();

      // 接続セットアップを待ってからファイルを書き換える
      await delay(150);
      writeFileSync(mdPath, "# Updated\n\nreload me\n");

      const buf = await readUntil(
        reader,
        (b) => /event:\s*reload/.test(b),
        3000,
      );
      assert.match(buf, /event:\s*reload/);
    } finally {
      ac.abort();
    }
  });
});

describe("createMdviewServer — close cleanup", () => {
  test("オープン中の SSE 接続があっても close() が hang しない", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "mdview-close-"));
    const mdPath = path.join(dir, "doc.md");
    writeFileSync(mdPath, "# Close test\n");
    const server = await createMdviewServer({ filePath: mdPath, port: 0 });

    const ac = new AbortController();
    const sseRes = await fetch(`http://127.0.0.1:${server.port}/__mdview/events`, {
      signal: ac.signal,
    });
    assert.equal(sseRes.status, 200);

    // SSE を開いたまま close を呼んでも 2 秒以内に解決すること
    const closed = await Promise.race([
      server.close().then(() => "closed"),
      delay(2000, "timeout"),
    ]);

    // fetch 側のリーダーは close で切断される。abort で握っている readable をキャンセル
    ac.abort();
    // body リーダーが残っていると Node がプロセスを保持するので破棄
    try {
      await sseRes.body?.cancel();
    } catch {
      /* already aborted */
    }

    assert.equal(closed, "closed");
  });

  test("複数の SSE 接続がオープン中でも close() が 500ms 以内に解決する", async () => {
    // ブラウザの EventSource では FIN を送っても TCP keep-alive が残り
    // server.close(callback) のコールバックが解決しないリグレッションがあった。
    // 修正: SSE レスポンス毎に socket.destroy() を呼んで強制 TCP teardown する。
    const dir = mkdtempSync(path.join(tmpdir(), "mdview-multi-sse-"));
    const mdPath = path.join(dir, "doc.md");
    writeFileSync(mdPath, "# Multi SSE\n");
    const server = await createMdviewServer({ filePath: mdPath, port: 0 });

    const acs = [];
    const responses = [];
    for (let i = 0; i < 3; i++) {
      const ac = new AbortController();
      acs.push(ac);
      const r = await fetch(
        `http://127.0.0.1:${server.port}/__mdview/events`,
        { signal: ac.signal },
      );
      assert.equal(r.status, 200);
      responses.push(r);
    }

    const t0 = Date.now();
    const result = await Promise.race([
      server.close().then(() => "closed"),
      delay(500, "timeout"),
    ]);
    const elapsed = Date.now() - t0;

    for (const ac of acs) ac.abort();
    for (const r of responses) {
      try {
        await r.body?.cancel();
      } catch {
        /* already aborted */
      }
    }

    assert.equal(result, "closed", `close timed out after ${elapsed}ms`);
    assert.ok(elapsed < 500, `close should be fast, took ${elapsed}ms`);
  });
});
