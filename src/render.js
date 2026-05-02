import { Marked } from "marked";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createMarked() {
  const instance = new Marked({
    gfm: true,
    breaks: false,
  });

  instance.use({
    renderer: {
      code({ text, lang }) {
        if ((lang ?? "").trim().toLowerCase() === "mermaid") {
          return `<pre class="mermaid">${escapeHtml(text)}</pre>\n`;
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
