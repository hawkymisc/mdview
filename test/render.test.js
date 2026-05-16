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

  describe("HTML プレビューブロック", () => {
    test("```html ブロックは mdview-html-block でラップされる", () => {
      const md = "```html\n<p>hi</p>\n```";
      const html = renderMarkdown(md);
      assert.match(html, /<div class="mdview-html-block"[^>]*data-mdview-mode="preview"/);
    });

    test("プレビュー / ソース の 2 タブが出力される", () => {
      const md = "```html\n<p>hi</p>\n```";
      const html = renderMarkdown(md);
      assert.match(html, /data-mdview-target="preview"[^>]*aria-selected="true"/);
      assert.match(html, /data-mdview-target="source"[^>]*aria-selected="false"/);
    });

    test("iframe は sandbox=\"allow-same-origin\" で srcdoc に元 HTML を保持する", () => {
      const md = "```html\n<p>hi</p>\n```";
      const html = renderMarkdown(md);
      assert.match(html, /<iframe[^>]*sandbox="allow-same-origin"/);
      // srcdoc 属性は HTML エスケープされた形で本文を含む
      assert.match(html, /srcdoc="[^"]*&lt;p&gt;hi&lt;\/p&gt;[^"]*"/);
    });

    test("iframe sandbox は allow-scripts を含まない (XSS 防御)", () => {
      const md = "```html\n<script>alert(1)</script>\n```";
      const html = renderMarkdown(md);
      assert.doesNotMatch(html, /sandbox="[^"]*allow-scripts/);
    });

    test("ソース表示用の <pre><code class=\"language-html\"> が併置される", () => {
      const md = "```html\n<p>hi</p>\n```";
      const html = renderMarkdown(md);
      assert.match(
        html,
        /<pre class="mdview-html-source"[^>]*hidden><code class="language-html">/,
      );
    });

    test("ソース pre 内の HTML はテキストとしてエスケープされる", () => {
      const md = "```html\n<p>hi</p>\n```";
      const html = renderMarkdown(md);
      // ソース表示部に live なタグが残らない
      assert.match(html, /<code class="language-html">&lt;p&gt;hi&lt;\/p&gt;/);
    });

    test("srcdoc 内に \" を含む属性値があっても属性値がエスケープされている", () => {
      const md = '```html\n<a href="x">y</a>\n```';
      const html = renderMarkdown(md);
      // srcdoc=" ... " の中に裸の " が現れないこと (= 属性が割れない)
      const m = html.match(/srcdoc="([^"]*)"/);
      assert.ok(m, "srcdoc 属性が抽出できる");
      assert.doesNotMatch(m[1], /"/);
      assert.match(m[1], /&quot;x&quot;/);
    });

    test("大文字 HTML 言語指定でも認識される", () => {
      const md = "```HTML\n<p>x</p>\n```";
      const html = renderMarkdown(md);
      assert.match(html, /<div class="mdview-html-block"/);
    });

    test("html 以外の言語指定 (例: htm, xhtml) は通常コードブロックとして扱う", () => {
      const md = "```htm\n<p>x</p>\n```";
      const html = renderMarkdown(md);
      assert.doesNotMatch(html, /mdview-html-block/);
      assert.match(html, /<pre><code/);
    });

    test("mermaid ブロックと html ブロックが両方ある場合、それぞれ独立に処理される", () => {
      const md = [
        "```mermaid",
        "graph TD",
        "A-->B",
        "```",
        "",
        "```html",
        "<p>x</p>",
        "```",
      ].join("\n");
      const html = renderMarkdown(md);
      assert.match(html, /<pre class="mermaid">/);
      assert.match(html, /<div class="mdview-html-block"/);
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

    test("<script> タグはエスケープされ、テキストとして表示される (strip ではなく escape)", () => {
      const html = renderMarkdown("hello <script>alert(1)</script> world");
      // <script> 自体が消えず、エスケープされた形で残る (defense-in-depth、表示明示)
      assert.match(html, /&lt;script&gt;/);
      assert.match(html, /&lt;\/script&gt;/);
      // 元のテキストが完全に保持されている
      assert.match(html, /hello/);
      assert.match(html, /world/);
    });

    test("<iframe> タグもエスケープされる", () => {
      const html = renderMarkdown(
        'hello <iframe src="evil.html"></iframe> world',
      );
      assert.doesNotMatch(html, /<iframe[^>]*>/i);
      assert.match(html, /&lt;iframe/);
    });

    test("ネストしたタグ (<scr<script>ipt>...) でもバイパスできない", () => {
      // 旧 regex 実装は内側の <script>...</script> を消すと
      // 外側に <script>...</script> が再構成される脆弱性があった
      const html = renderMarkdown("<scr<script>ipt>alert(1)</script></script>");
      assert.doesNotMatch(html, /<script[^>]*>alert/i);
      // 完全な <script> タグ単独で残らないこと
      assert.doesNotMatch(html, /<script>[^<]*<\/script>/i);
    });

    test("on*= イベントハンドラ属性もエスケープされる", () => {
      const html = renderMarkdown('<a href="#" onclick="alert(1)">click</a>');
      // 生のイベントハンドラが live で残らない
      assert.doesNotMatch(html, /onclick=["']alert/);
      // エスケープ形で保持されている
      assert.match(html, /&lt;a/);
    });

    test("大文字混在の <SCRIPT> もエスケープされる", () => {
      const html = renderMarkdown("<SCRIPT>alert(1)</SCRIPT>");
      assert.doesNotMatch(html, /<SCRIPT[^>]*>alert/);
      assert.match(html, /&lt;SCRIPT&gt;|&lt;script&gt;/i);
    });
  });
});
