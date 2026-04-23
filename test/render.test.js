import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "../src/render.js";

describe("renderMarkdown", () => {
  describe("基本仕様", () => {
    test("見出しが <h1> に変換される", () => {
      const html = renderMarkdown("# Hello");
      assert.match(html, /<h1[^>]*>Hello<\/h1>/);
    });

    test("段落が <p> に変換される", () => {
      const html = renderMarkdown("just a line");
      assert.match(html, /<p>just a line<\/p>/);
    });

    test("インラインコードが <code> に変換される", () => {
      const html = renderMarkdown("use `npm` here");
      assert.match(html, /<code>npm<\/code>/);
    });

    test("GFMのテーブルがレンダリングされる", () => {
      const md = ["| a | b |", "|---|---|", "| 1 | 2 |"].join("\n");
      const html = renderMarkdown(md);
      assert.match(html, /<table/);
      assert.match(html, /<th>a<\/th>/);
      assert.match(html, /<td>1<\/td>/);
    });

    test("GFMのチェックボックスがレンダリングされる", () => {
      const html = renderMarkdown("- [x] done\n- [ ] todo");
      assert.match(html, /type="checkbox"/);
      assert.match(html, /checked/);
    });
  });

  describe("Mermaid 記法", () => {
    test("```mermaid ブロックは <pre class=\"mermaid\"> にラップされ、コード本文は生のまま残る", () => {
      const md = "```mermaid\ngraph TD\nA-->B\n```";
      const html = renderMarkdown(md);
      assert.match(html, /<pre class="mermaid">/);
      assert.match(html, /graph TD/);
      assert.match(html, /A--&gt;B|A-->B/); // mermaid.js側で解釈させるため最低限本文が残る
    });

    test("mermaid 以外の言語指定コードブロックは通常の <pre><code> になる", () => {
      const md = "```js\nconst x = 1;\n```";
      const html = renderMarkdown(md);
      assert.match(html, /<pre><code[^>]*class="[^"]*language-js/);
      assert.doesNotMatch(html, /<pre class="mermaid">/);
    });

    test("mermaid ブロック内の HTML タグは実行されないようエスケープされる", () => {
      const md = "```mermaid\n<script>alert(1)</script>\n```";
      const html = renderMarkdown(md);
      // 生タグのまま出力されていないこと
      assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
      // エスケープ形で保持されていること
      assert.match(html, /&lt;script&gt;/);
    });
  });

  describe("画像", () => {
    test("相対パスの画像は src がそのまま維持される (サーバ側で静的配信する前提)", () => {
      const html = renderMarkdown("![alt](./img/logo.png)");
      assert.match(html, /<img[^>]*src="\.\/img\/logo\.png"[^>]*alt="alt"/);
    });

    test("絶対URLの画像はそのまま維持される", () => {
      const html = renderMarkdown("![cat](https://example.com/cat.png)");
      assert.match(html, /<img[^>]*src="https:\/\/example\.com\/cat\.png"/);
    });
  });

  describe("セキュリティ (最低限)", () => {
    test("本文中の <script> タグはそのまま埋め込まれない(エスケープされる)", () => {
      const html = renderMarkdown("hello <script>alert(1)</script> world");
      assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
    });
  });
});
