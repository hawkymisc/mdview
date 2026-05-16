import { Marked } from "marked";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtmlPreviewBlock(text) {
  const source = String(text ?? "");
  // iframe srcdoc は HTML 属性として埋め込むため、属性値のエスケープを行う。
  // srcdoc 内は別ドキュメントとして parse されるため、source 自体の構造は壊さない。
  const attrEscaped = source
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const sourceEscaped = escapeHtml(source);
  return (
    `<div class="mdview-html-block" data-mdview-mode="preview">` +
    `<div class="mdview-html-toolbar" role="tablist" aria-label="HTML 表示モード">` +
    `<button type="button" class="mdview-html-tab" role="tab" data-mdview-target="preview" aria-selected="true" tabindex="0">プレビュー</button>` +
    `<button type="button" class="mdview-html-tab" role="tab" data-mdview-target="source" aria-selected="false" tabindex="-1">ソース</button>` +
    `</div>` +
    // sandbox="allow-same-origin" 単独: JS 不可 / form 不可 / popup 不可。
    // allow-scripts と allow-same-origin の同時指定は sandbox escape を許すため禁止。
    // same-origin を残す目的は、親フレームから contentDocument.documentElement.scrollHeight を読んで
    // iframe の高さをコンテンツに合わせるため。
    `<div class="mdview-html-preview" role="tabpanel">` +
    `<iframe class="mdview-html-frame" sandbox="allow-same-origin" loading="lazy" title="HTML プレビュー" srcdoc="${attrEscaped}"></iframe>` +
    `</div>` +
    `<pre class="mdview-html-source" role="tabpanel" hidden><code class="language-html">${sourceEscaped}</code></pre>` +
    `</div>\n`
  );
}

function createMarked() {
  const instance = new Marked({
    gfm: true,
    breaks: false,
  });

  instance.use({
    renderer: {
      code({ text, lang }) {
        const normalized = (lang ?? "").trim().toLowerCase();
        if (normalized === "mermaid") {
          return `<pre class="mermaid">${escapeHtml(text)}</pre>\n`;
        }
        if (normalized === "html") {
          return renderHtmlPreviewBlock(text);
        }
        return false;
      },
      // Markdown 中の生 HTML はすべてエスケープしてテキスト扱いにする。
      // 旧実装は <script>/<iframe>/on*= を regex で strip していたが、
      // 入れ子・部分マッチ等でバイパス可能な構造的問題があり CodeQL に
      // 指摘されていた (js/bad-tag-filter, js/incomplete-multi-character-sanitization)。
      // 「strip ではなく escape」に倒すことで、そもそも危険タグが
      // ライブ HTML として出力されない不変条件が成立する。
      html({ text }) {
        return escapeHtml(text);
      },
    },
  });

  return instance;
}

const defaultMarked = createMarked();

export function renderMarkdown(source) {
  return defaultMarked.parse(source ?? "");
}
