import { Marked } from "marked";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtmlTags(s) {
  return String(s).replace(/<[^>]*>/g, "");
}

function slugify(rawText) {
  const text = stripHtmlTags(rawText);
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug) return slug;
  // 英数を含まない見出し (日本語のみ等) は encodeURIComponent fallback。
  // URL hash として参照できれば十分。
  const trimmed = text.trim();
  return trimmed ? encodeURIComponent(trimmed) : "section";
}

function createMarked() {
  const instance = new Marked({
    gfm: true,
    breaks: false,
  });

  // 見出し id は同一ドキュメント内で重複しないよう連番付与する。
  // marked instance ごとにカウンタを持ち、parse 呼び出し境界で reset する。
  const slugCounts = new Map();

  const originalParse = instance.parse.bind(instance);
  instance.parse = (...args) => {
    slugCounts.clear();
    return originalParse(...args);
  };

  instance.use({
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const base = slugify(inner);
        const count = slugCounts.get(base) ?? 0;
        slugCounts.set(base, count + 1);
        const id = count === 0 ? base : `${base}-${count + 1}`;
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
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
