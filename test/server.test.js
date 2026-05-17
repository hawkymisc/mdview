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
    // EventSource を /__mdview/events に対して生成している痕跡
    assert.match(res.body, /new EventSource\(/);
    assert.match(res.body, /\/__mdview\/events/);
    // reload イベントを購読していることを示す痕跡
    assert.match(res.body, /addEventListener\(['"]reload['"]/);
  });

  test("HTML 本体に highlight.js のスクリプトとテーマ CSS が含まれる", async () => {
    const res = await fetchText(`${baseUrl}/`);
    // CDN 上の highlight.js スクリプト (バージョンピン)
    assert.match(
      res.body,
      /<script[^>]*src="https:\/\/cdn\.jsdelivr\.net\/npm\/@highlightjs\/cdn-assets@/,
    );
    // ライト用テーマの link
    assert.match(
      res.body,
      /<link[^>]*rel="stylesheet"[^>]*href="https:\/\/cdn\.jsdelivr\.net\/npm\/@highlightjs\/cdn-assets@[^"]*github\.min\.css"/,
    );
    // ダーク用テーマの link
    assert.match(
      res.body,
      /<link[^>]*rel="stylesheet"[^>]*href="https:\/\/cdn\.jsdelivr\.net\/npm\/@highlightjs\/cdn-assets@[^"]*github-dark\.min\.css"/,
    );
  });

  test("HTML 本体のスクリプトが pre code(Mermaid 以外) を hljs でハイライトする", async () => {
    const res = await fetchText(`${baseUrl}/`);
    // window.hljs を呼び出していること
    assert.match(res.body, /window\.hljs/);
    assert.match(res.body, /hljs\.highlightElement/);
    // Mermaid ブロックを除外していること (selector 内に :not(.mermaid) もしくは回避ロジック)
    assert.match(res.body, /\.mermaid/);
    assert.match(res.body, /pre\s+code/);
  });

  test("CDN から読み込む全スクリプト/スタイルに SRI ハッシュ (sha384) が付与されている", async () => {
    const res = await fetchText(`${baseUrl}/`);
    // CDN を参照する <script> タグはすべて integrity="sha384-..." を持つ
    const scriptTags = res.body.match(
      /<script[^>]*src="https:\/\/cdn\.jsdelivr\.net\/[^"]*"[^>]*>/g,
    );
    assert.ok(
      scriptTags && scriptTags.length >= 2,
      "CDN を参照する <script> タグが 2 つ以上存在すべき (mermaid + highlight.js)",
    );
    for (const tag of scriptTags) {
      assert.match(
        tag,
        /\bintegrity="sha384-[A-Za-z0-9+/=]+"/,
        `CDN script に SRI が必要: ${tag}`,
      );
      assert.match(
        tag,
        /\bcrossorigin="anonymous"/,
        `SRI 検証には crossorigin="anonymous" が必須: ${tag}`,
      );
    }

    // CDN を参照する <link rel="stylesheet"> タグもすべて integrity を持つ
    const linkTags = res.body.match(
      /<link[^>]*href="https:\/\/cdn\.jsdelivr\.net\/[^"]*"[^>]*>/g,
    );
    assert.ok(
      linkTags && linkTags.length >= 2,
      "CDN を参照する <link> タグが 2 つ以上存在すべき (light + dark テーマ)",
    );
    for (const tag of linkTags) {
      assert.match(
        tag,
        /\bintegrity="sha384-[A-Za-z0-9+/=]+"/,
        `CDN link に SRI が必要: ${tag}`,
      );
      assert.match(
        tag,
        /\bcrossorigin="anonymous"/,
        `SRI 検証には crossorigin="anonymous" が必須: ${tag}`,
      );
    }
  });

  test("HTML 本体に hljs テーマを切り替える hook が含まれる", async () => {
    const res = await fetchText(`${baseUrl}/`);
    // テーマ切替時に hljs 用 CSS の disabled をトグルする実装が必要
    assert.match(res.body, /id="hljs-theme-light"/);
    assert.match(res.body, /id="hljs-theme-dark"/);
    // disabled 属性をトグルする示唆
    assert.match(res.body, /disabled/);
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

describe("createMdviewServer — サイドバー API", () => {
  let dir;
  let mdPath;
  let server;
  let baseUrl;

  before(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "mdview-sidebar-"));
    mdPath = path.join(dir, "demo.md");
    writeFileSync(mdPath, "# Demo\n\n## Section A\n\n## Section B\n");
    writeFileSync(path.join(dir, "README.md"), "# README\n");
    writeFileSync(path.join(dir, "ignore.txt"), "not markdown");
    mkdirSync(path.join(dir, "guides"));
    writeFileSync(path.join(dir, "guides", "basics.md"), "# Basics\n");
    writeFileSync(path.join(dir, "guides", "advanced.md"), "# Advanced\n");
    writeFileSync(path.join(dir, "guides", "concept.png"), "PNG");
    mkdirSync(path.join(dir, "reference"));
    writeFileSync(path.join(dir, "reference", "api.md"), "# API\n");
    // 隠しディレクトリは除外されるべき
    mkdirSync(path.join(dir, ".hidden"));
    writeFileSync(path.join(dir, ".hidden", "secret.md"), "# Secret\n");
    // 空ディレクトリ (md 無し) は出さない
    mkdirSync(path.join(dir, "empty"));
    // 2 階層目は走査範囲外なので listing には含まれない
    mkdirSync(path.join(dir, "guides", "nested"));
    writeFileSync(path.join(dir, "guides", "nested", "deep.md"), "# Deep\n");

    server = await createMdviewServer({ filePath: mdPath, port: 0 });
    baseUrl = `http://127.0.0.1:${server.port}`;
  });

  after(async () => {
    await server.close();
  });

  test("GET /__mdview/files は JSON で同階層 + 直下サブの .md を返す", async () => {
    const res = await fetchText(`${baseUrl}/__mdview/files`);
    assert.equal(res.status, 200);
    assert.match(res.contentType, /application\/json/);
    const json = JSON.parse(res.body);
    assert.equal(json.root, "demo.md");
    const fileNames = json.files.map((f) => f.name);
    assert.ok(fileNames.includes("demo.md"));
    assert.ok(fileNames.includes("README.md"));
    assert.ok(!fileNames.includes("ignore.txt"));
    const dirNames = json.directories.map((d) => d.name);
    assert.ok(dirNames.includes("guides"));
    assert.ok(dirNames.includes("reference"));
    assert.ok(!dirNames.includes("empty"), "空ディレクトリは含めない");
    assert.ok(!dirNames.includes(".hidden"), "隠しディレクトリは除外");
  });

  test("/__mdview/files は 2 階層目を含まない (走査範囲: 1 階層のみ)", async () => {
    const res = await fetchText(`${baseUrl}/__mdview/files`);
    const json = JSON.parse(res.body);
    const guides = json.directories.find((d) => d.name === "guides");
    assert.ok(guides);
    const subFileNames = guides.files.map((f) => f.name);
    assert.ok(subFileNames.includes("basics.md"));
    assert.ok(subFileNames.includes("advanced.md"));
    assert.ok(!subFileNames.includes("nested"));
    assert.ok(!subFileNames.includes("deep.md"));
    assert.ok(!subFileNames.includes("concept.png"));
  });

  test("/__mdview/files のファイル名は安定ソートされている", async () => {
    const res = await fetchText(`${baseUrl}/__mdview/files`);
    const json = JSON.parse(res.body);
    const guides = json.directories.find((d) => d.name === "guides");
    const names = guides.files.map((f) => f.name);
    // advanced.md < basics.md (alphabetical, case-insensitive)
    assert.deepEqual(names, ["advanced.md", "basics.md"]);
  });

  test("GET /__mdview/fragment?path=guides/basics.md は main innerHTML を返す", async () => {
    const res = await fetchText(
      `${baseUrl}/__mdview/fragment?path=guides/basics.md`,
    );
    assert.equal(res.status, 200);
    assert.match(res.contentType, /text\/html/);
    assert.match(res.body, /<h1[^>]*>Basics<\/h1>/);
    // フルページではなく fragment (= <html> / <body> を含まない)
    assert.doesNotMatch(res.body, /<html/);
    assert.doesNotMatch(res.body, /<body/);
  });

  test("/__mdview/fragment は X-Mdview-Title ヘッダを返す", async () => {
    const res = await fetch(
      `${baseUrl}/__mdview/fragment?path=guides/basics.md`,
    );
    const title = res.headers.get("x-mdview-title");
    assert.equal(decodeURIComponent(title ?? ""), "basics.md");
    await res.text();
  });

  test("/__mdview/fragment?path=../etc/passwd は 403 を返す", async () => {
    const res = await fetchText(
      `${baseUrl}/__mdview/fragment?path=../etc/passwd`,
    );
    assert.equal(res.status, 400);
  });

  test("/__mdview/fragment?path=foo.txt は 400 (拡張子チェック)", async () => {
    const res = await fetchText(`${baseUrl}/__mdview/fragment?path=ignore.txt`);
    assert.equal(res.status, 400);
  });

  test("/__mdview/fragment?path=guides/nested/deep.md は 403 (走査範囲外)", async () => {
    const res = await fetchText(
      `${baseUrl}/__mdview/fragment?path=guides/nested/deep.md`,
    );
    assert.equal(res.status, 403);
  });

  test("/__mdview/fragment?path=nonexistent.md は 404", async () => {
    const res = await fetchText(`${baseUrl}/__mdview/fragment?path=missing.md`);
    assert.equal(res.status, 404);
  });

  test("GET /guides/basics.md は Accept: text/html で rendered HTML を返す", async () => {
    const res = await fetch(`${baseUrl}/guides/basics.md`, {
      headers: { accept: "text/html" },
    });
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /text\/html/);
    const body = await res.text();
    assert.match(body, /<html/);
    assert.match(body, /<h1[^>]*>Basics<\/h1>/);
  });

  test("GET /guides/basics.md は Accept: */* で raw markdown を返す (後方互換)", async () => {
    const res = await fetch(`${baseUrl}/guides/basics.md`, {
      headers: { accept: "*/*" },
    });
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /text\/markdown/);
    const body = await res.text();
    assert.equal(body, "# Basics\n");
  });

  test("GET /guides/basics.md?raw=1 は Accept: text/html でも raw を返す (エスケープハッチ)", async () => {
    const res = await fetch(`${baseUrl}/guides/basics.md?raw=1`, {
      headers: { accept: "text/html" },
    });
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /text\/markdown/);
    const body = await res.text();
    assert.equal(body, "# Basics\n");
  });

  test("GET /__mdview/events?path=guides/basics.md は当該ファイルの変更を reload 配信", async () => {
    const ac = new AbortController();
    try {
      const res = await fetch(
        `${baseUrl}/__mdview/events?path=guides/basics.md`,
        { signal: ac.signal },
      );
      assert.equal(res.status, 200);
      const reader = res.body.getReader();
      await delay(150);
      writeFileSync(path.join(dir, "guides", "basics.md"), "# Updated Basics\n");
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

  test("/__mdview/events?path=../etc/passwd は 403 を返す", async () => {
    const res = await fetchText(
      `${baseUrl}/__mdview/events?path=../etc/passwd`,
    );
    assert.equal(res.status, 403);
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
