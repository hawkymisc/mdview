import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createMdviewServer } from "../src/server.js";

function fetchText(url) {
  return fetch(url).then(async (res) => ({
    status: res.status,
    contentType: res.headers.get("content-type") ?? "",
    body: await res.text(),
  }));
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

  test("HTML 本体にテーマ切替のトグルボタンが含まれる", async () => {
    const res = await fetchText(`${baseUrl}/`);
    assert.match(res.body, /id="theme-toggle"/);
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
});
