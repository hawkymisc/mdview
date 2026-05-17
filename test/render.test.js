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

  describe("見出し ID 付与 (TOC / アンカー用)", () => {
    test("h1-h6 に id 属性が付く", () => {
      const md = "# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6";
      const html = renderMarkdown(md);
      assert.match(html, /<h1[^>]*id="h1"[^>]*>H1<\/h1>/);
      assert.match(html, /<h2[^>]*id="h2"[^>]*>H2<\/h2>/);
      assert.match(html, /<h3[^>]*id="h3"[^>]*>H3<\/h3>/);
      assert.match(html, /<h4[^>]*id="h4"[^>]*>H4<\/h4>/);
      assert.match(html, /<h5[^>]*id="h5"[^>]*>H5<\/h5>/);
      assert.match(html, /<h6[^>]*id="h6"[^>]*>H6<\/h6>/);
    });

    test("英数のみの slug は小文字 + ハイフン化される", () => {
      const html = renderMarkdown("## Hello World");
      assert.match(html, /<h2[^>]*id="hello-world"[^>]*>Hello World<\/h2>/);
    });

    test("記号や連続空白は単一ハイフンに圧縮される", () => {
      const html = renderMarkdown("## Foo!!  Bar -- Baz");
      assert.match(html, /<h2[^>]*id="foo-bar-baz"[^>]*>/);
    });

    test("先頭末尾のハイフンは trim される", () => {
      const html = renderMarkdown("## !!! Hello !!!");
      assert.match(html, /<h2[^>]*id="hello"[^>]*>/);
    });

    test("同じテキストの見出しは連番サフィックスが付く", () => {
      const md = "## API\n## API\n## API";
      const html = renderMarkdown(md);
      assert.match(html, /<h2[^>]*id="api"[^>]*>API<\/h2>/);
      assert.match(html, /<h2[^>]*id="api-2"[^>]*>API<\/h2>/);
      assert.match(html, /<h2[^>]*id="api-3"[^>]*>API<\/h2>/);
    });

    test("日本語見出しは encodeURIComponent fallback が使われる", () => {
      const html = renderMarkdown("## 概要");
      // encodeURIComponent("概要") = "%E6%A6%82%E8%A6%81"
      assert.match(
        html,
        /<h2[^>]*id="%E6%A6%82%E8%A6%81"[^>]*>概要<\/h2>/,
      );
    });

    test("英数 + 日本語の混在見出しは英数部分が slug 化される", () => {
      const html = renderMarkdown("## API 概要");
      // 英数 "api" が拾えるので "api" になる
      assert.match(html, /<h2[^>]*id="api"[^>]*>API 概要<\/h2>/);
    });

    test("インラインコードを含む見出しでも id が付く", () => {
      const html = renderMarkdown("## Use `npm` here");
      assert.match(html, /<h2[^>]*id="use-npm-here"[^>]*>/);
    });

    test("renderMarkdown を複数回呼んでも slug counter は独立 (グローバル汚染なし)", () => {
      const h1 = renderMarkdown("## API");
      const h2 = renderMarkdown("## API");
      assert.match(h1, /id="api"/);
      assert.match(h2, /id="api"/);
      assert.doesNotMatch(h1, /id="api-2"/);
      assert.doesNotMatch(h2, /id="api-2"/);
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
