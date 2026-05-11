import { Marked } from "marked";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// mdview の独自構文:
//   * 範囲マーク: <span class="mdview-comment-mark" data-mdview-comment-id="N">range</span>
//   * 本体:      <!--mdview-comment[N]: comment body-->
// raw HTML は html() レンダラで一律 escape されるため、自前で pre-process / post-process し
// 我々の専用構文のみ「実 HTML」として復元する。preprocess 後の中間表現には実行時生成の
// nonce 入りセンチネル (§MDVCS<nonce>_<id>§) を使うことで、ユーザ本文との衝突を避ける。

const COMMENT_BODY_RE = /<!--\s*mdview-comment\[(\d+)\]:\s*([\s\S]*?)-->/g;
const COMMENT_SPAN_PAIR_RE =
  /<span\s+class="mdview-comment-mark"\s+data-mdview-comment-id="(\d+)"\s*>([\s\S]*?)<\/span>/g;
// mdview-comment 以外の HTML コメントもテキスト表示しないよう一律で除去する
// (デフォルトの marked + html escape では <!-- foo --> が「<!-- foo -->」というテキストとして
// 可視表示されてしまうため。)
const ANY_HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;

function makeNonce() {
  return (
    Math.random().toString(36).slice(2, 8) + Date.now().toString(36)
  ).toLowerCase();
}

function preprocess(source) {
  const comments = new Map();
  let text = source;
  text = text.replace(COMMENT_BODY_RE, (_m, id, body) => {
    comments.set(String(id), body.trim());
    return "";
  });
  text = text.replace(ANY_HTML_COMMENT_RE, "");
  const nonce = makeNonce();
  text = text.replace(
    COMMENT_SPAN_PAIR_RE,
    (_m, id, content) =>
      `§MDVCS${nonce}_${id}§${content}§MDVCE${nonce}_${id}§`,
  );
  return { text, comments, nonce };
}

function postprocess(html, comments, nonce) {
  const open = new RegExp(`§MDVCS${nonce}_(\\d+)§`, "g");
  const close = new RegExp(`§MDVCE${nonce}_(\\d+)§`, "g");
  return html
    .replace(open, (_m, id) => {
      const body = comments.get(String(id)) ?? "";
      return `<span class="mdview-comment-mark" data-mdview-comment-id="${escapeHtml(id)}" data-mdview-comment-text="${escapeHtml(body)}">`;
    })
    .replace(close, (_m, id) => {
      const body = comments.get(String(id)) ?? "";
      return `<span class="mdview-comment-icon" role="img" aria-label="comment" title="${escapeHtml(body)}">💬</span></span>`;
    });
}

// GFM のタスクリストチェックボックスを編集可能にする:
//   - disabled 属性を外す
//   - 連番 data-mdview-task-index を付与 (サーバ側で N 番目を更新するキー)
//   - class を統一して JS / CSS から拾えるようにする
function indexCheckboxes(html) {
  let i = 0;
  return html.replace(/<input\b([^>]*)>/g, (m, attrs) => {
    if (!/type="checkbox"/.test(attrs)) return m;
    const idx = i++;
    const cleaned = attrs
      .replace(/\s*disabled(="[^"]*")?/g, "")
      .replace(/\s*class="[^"]*"/g, "");
    return `<input${cleaned} class="mdview-task-checkbox" data-mdview-task-index="${idx}">`;
  });
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
  const { text, comments, nonce } = preprocess(source ?? "");
  const html = defaultMarked.parse(text);
  return indexCheckboxes(postprocess(html, comments, nonce));
}
