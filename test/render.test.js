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

  describe("インタラクティブチェックボックス", () => {
    test("タスクリスト checkbox は disabled が外され、連番 data-mdview-task-index が付く", () => {
      const html = renderMarkdown("- [ ] todo\n- [x] done\n- [ ] another");
      // disabled は外れている
      assert.doesNotMatch(html, /<input[^>]*disabled/);
      // 連番 index が付与されている
      assert.match(html, /data-mdview-task-index="0"/);
      assert.match(html, /data-mdview-task-index="1"/);
      assert.match(html, /data-mdview-task-index="2"/);
      // クラスが付与されている
      assert.match(html, /class="mdview-task-checkbox"/);
    });

    test("チェック済み (checked) も保たれる", () => {
      const html = renderMarkdown("- [x] done");
      assert.match(html, /type="checkbox"[^>]*checked|checked[^>]*type="checkbox"/);
    });
  });

  describe("mdview コメント拡張", () => {
    test("<!--mdview-comment[N]: body--> と data-mdview-comment-id span が結合される", () => {
      const md =
        'これは<span class="mdview-comment-mark" data-mdview-comment-id="1">対象</span>です。\n' +
        "\n" +
        "<!--mdview-comment[1]: これはコメント本文-->\n";
      const html = renderMarkdown(md);
      // span が出力される
      assert.match(
        html,
        /<span class="mdview-comment-mark" data-mdview-comment-id="1" data-mdview-comment-text="これはコメント本文">/,
      );
      // インラインの内容は保持
      assert.match(html, />対象</);
      // コメントアイコンが付く
      assert.match(html, /class="mdview-comment-icon"[^>]*title="これはコメント本文"/);
      // 元の HTML コメント本体はソースに出力されない
      assert.doesNotMatch(html, /mdview-comment\[1\]/);
    });

    test("HTML コメントは画面に表示されない (escape されない)", () => {
      const html = renderMarkdown("foo<!-- secret -->bar");
      assert.doesNotMatch(html, /&lt;!--/);
      assert.doesNotMatch(html, /secret/);
      assert.match(html, /foobar/);
    });

    test("コメント本体が見つからない span でも安全に出力される", () => {
      const md = '<span class="mdview-comment-mark" data-mdview-comment-id="99">x</span>';
      const html = renderMarkdown(md);
      assert.match(html, /data-mdview-comment-text=""/);
    });

    test("コメント本体内の HTML タグは title 属性で escape される (XSS 防御)", () => {
      const md =
        '<span class="mdview-comment-mark" data-mdview-comment-id="1">t</span>\n' +
        '<!--mdview-comment[1]: <script>alert(1)</script>-->\n';
      const html = renderMarkdown(md);
      assert.doesNotMatch(html, /<script>alert/);
      assert.match(html, /&lt;script&gt;/);
    });
  });
});
