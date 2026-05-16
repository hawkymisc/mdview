const STYLES = `
:root {
  --bg: #ffffff;
  --fg: #1f2328;
  --muted: #656d76;
  --border: #d0d7de;
  --code-bg: #f6f8fa;
  --code-fg: #1f2328;
  --link: #0969da;
  --accent: #0969da;
  --blockquote-bar: #d0d7de;
  --table-alt: #f6f8fa;
  color-scheme: light;
}
:root[data-theme="dark"] {
  --bg: #0d1117;
  --fg: #e6edf3;
  --muted: #8b949e;
  --border: #30363d;
  --code-bg: #161b22;
  --code-fg: #e6edf3;
  --link: #4493f8;
  --accent: #58a6ff;
  --blockquote-bar: #30363d;
  --table-alt: #161b22;
  color-scheme: dark;
}
* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue",
    "Hiragino Kaku Gothic ProN", "Noto Sans JP", Meiryo, sans-serif;
  line-height: 1.6;
  transition: background 0.15s ease, color 0.15s ease;
}
main.markdown-body {
  max-width: 860px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 6rem;
  font-size: 16px;
}
main.markdown-body h1,
main.markdown-body h2 {
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.3em;
  margin-top: 1.8em;
}
main.markdown-body h1:first-child { margin-top: 0; }
main.markdown-body a { color: var(--link); text-decoration: none; }
main.markdown-body a:hover { text-decoration: underline; }
main.markdown-body code {
  background: var(--code-bg);
  color: var(--code-fg);
  padding: 0.15em 0.35em;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
main.markdown-body pre {
  background: var(--code-bg);
  color: var(--code-fg);
  padding: 1rem;
  border-radius: 6px;
  overflow: auto;
  border: 1px solid var(--border);
}
main.markdown-body pre code {
  background: transparent;
  padding: 0;
  font-size: 0.9em;
}
main.markdown-body pre.mermaid {
  background: var(--bg);
  border: 1px solid var(--border);
  text-align: center;
}
main.markdown-body blockquote {
  border-left: 4px solid var(--blockquote-bar);
  color: var(--muted);
  padding: 0 1em;
  margin: 0 0 1em 0;
}
main.markdown-body table {
  border-collapse: collapse;
  margin: 1em 0;
}
main.markdown-body table th,
main.markdown-body table td {
  border: 1px solid var(--border);
  padding: 0.4em 0.8em;
}
main.markdown-body table tr:nth-child(2n) { background: var(--table-alt); }
main.markdown-body img { max-width: 100%; height: auto; }
main.markdown-body hr { border: 0; border-top: 1px solid var(--border); margin: 2em 0; }
main.markdown-body ul, main.markdown-body ol { padding-left: 1.8em; }
main.markdown-body input[type="checkbox"] { margin-right: 0.3em; }

.theme-switcher {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  font-family: inherit;
}
#theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  padding: 0.4em 0.85em;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--code-bg);
  color: var(--fg);
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
#theme-toggle:hover { border-color: var(--accent); }
#theme-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
#theme-toggle .theme-prefix {
  color: var(--muted);
  font-size: 0.8em;
}
#theme-toggle .theme-chevron {
  font-size: 0.7em;
  opacity: 0.7;
  transition: transform 0.12s ease;
}
.theme-switcher[data-state="open"] #theme-toggle .theme-chevron {
  transform: rotate(180deg);
}
#theme-menu {
  list-style: none;
  margin: 0.4em 0 0 0;
  padding: 0.3em 0;
  position: absolute;
  right: 0;
  top: 100%;
  min-width: 9rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
#theme-menu[hidden] { display: none; }
#theme-menu [data-theme-choice] {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.4em 0.9em;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--fg);
  outline: none;
  user-select: none;
}
#theme-menu [data-theme-choice]:hover,
#theme-menu [data-theme-choice]:focus-visible {
  background: var(--code-bg);
}
#theme-menu .theme-mark {
  display: inline-block;
  width: 1em;
  text-align: center;
  color: var(--accent);
}
#theme-menu [aria-checked="true"] .theme-mark::before { content: "✓"; }

.mdview-meta {
  font-size: 0.85em;
  color: var(--muted);
  border-top: 1px solid var(--border);
  margin-top: 3rem;
  padding-top: 1rem;
}

.mdview-html-block {
  margin: 1em 0;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg);
}
.mdview-html-toolbar {
  display: flex;
  gap: 0;
  background: var(--code-bg);
  border-bottom: 1px solid var(--border);
  padding: 0.25rem 0.4rem;
}
.mdview-html-tab {
  appearance: none;
  background: transparent;
  border: 1px solid transparent;
  color: var(--muted);
  font-family: inherit;
  font-size: 0.85rem;
  padding: 0.3em 0.9em;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
}
.mdview-html-tab:hover {
  color: var(--fg);
}
.mdview-html-tab[aria-selected="true"] {
  background: var(--bg);
  color: var(--fg);
  border-color: var(--border);
}
.mdview-html-tab:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.mdview-html-preview {
  background: #ffffff;
  padding: 0;
}
:root[data-theme="dark"] .mdview-html-preview {
  background: #ffffff;
}
.mdview-html-frame {
  display: block;
  width: 100%;
  min-height: 4rem;
  border: 0;
  background: #ffffff;
}
.mdview-html-block[data-mdview-mode="source"] .mdview-html-preview { display: none; }
.mdview-html-block[data-mdview-mode="preview"] .mdview-html-source { display: none; }
.mdview-html-source[hidden] { display: none; }
main.markdown-body .mdview-html-source {
  margin: 0;
  border: 0;
  border-radius: 0;
  background: var(--code-bg);
}
`;

const SCRIPT = `
(function () {
  const root = document.documentElement;
  const KEY = "mdview:theme";
  const THEMES = ["light", "dark"];
  const LABEL = { light: "ライト", dark: "ダーク" };

  function prefers() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  }
  function readStored() {
    const v = localStorage.getItem(KEY);
    return THEMES.includes(v) ? v : null;
  }
  function currentTheme() {
    const t = root.getAttribute("data-theme");
    return THEMES.includes(t) ? t : "light";
  }

  // FOUC 防止: DOMContentLoaded 前に data-theme を立てる
  root.setAttribute("data-theme", readStored() || prefers());

  function applyMermaid(theme) {
    if (!window.mermaid) return;
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: theme === "dark" ? "dark" : "default",
        securityLevel: "strict",
      });
      const nodes = document.querySelectorAll("pre.mermaid");
      nodes.forEach((n) => {
        if (n.dataset.mdviewSource === undefined) {
          n.dataset.mdviewSource = n.textContent;
        } else {
          n.textContent = n.dataset.mdviewSource;
        }
        n.removeAttribute("data-processed");
      });
      window.mermaid.run({ nodes });
    } catch (e) {
      console.warn("mermaid render failed", e);
    }
  }

  function syncUI(theme) {
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      const label = btn.querySelector(".theme-label");
      if (label) label.textContent = LABEL[theme];
      btn.setAttribute("aria-label", "現在のテーマ: " + LABEL[theme] + " (クリックして変更)");
    }
    document.querySelectorAll("[data-theme-choice]").forEach((item) => {
      const isCurrent = item.getAttribute("data-theme-choice") === theme;
      item.setAttribute("aria-checked", isCurrent ? "true" : "false");
      item.setAttribute("tabindex", isCurrent ? "0" : "-1");
    });
  }

  // 同じテーマを再選択しても DOM 操作・Mermaid 再描画は行わない (冪等)
  function setTheme(next) {
    if (!THEMES.includes(next)) return false;
    if (currentTheme() === next) return false;
    root.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
    syncUI(next);
    applyHljsTheme(next);
    applyMermaid(next);
    return true;
  }

  function setMenuOpen(open) {
    const wrapper = document.querySelector(".theme-switcher");
    const btn = document.getElementById("theme-toggle");
    const menu = document.getElementById("theme-menu");
    if (!wrapper || !btn || !menu) return;
    const wasOpen = wrapper.getAttribute("data-state") === "open";
    if (wasOpen === open) return; // 冪等
    wrapper.setAttribute("data-state", open ? "open" : "closed");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      menu.removeAttribute("hidden");
      const checked = menu.querySelector('[aria-checked="true"]');
      (checked || menu.querySelector("[data-theme-choice]"))?.focus();
    } else {
      menu.setAttribute("hidden", "");
    }
  }

  // シンタックスハイライト: pre code 要素 (Mermaid 以外) を hljs で色付けする。
  // hljs.highlightElement は冪等 (data-highlighted="yes" で skip される) なので
  // ライブリロード後の再実行でも安全。
  function applyHljs() {
    if (!window.hljs) return;
    const blocks = document.querySelectorAll(
      "main.markdown-body pre:not(.mermaid) code",
    );
    blocks.forEach((el) => {
      try {
        window.hljs.highlightElement(el);
      } catch (e) {
        console.warn("hljs highlight failed", e);
      }
    });
  }

  // hljs のテーマ用 <link> を有効/無効にトグルする。
  // 両方とも head に置いておき、現在テーマに応じて disabled 属性を切り替える。
  function applyHljsTheme(theme) {
    const light = document.getElementById("hljs-theme-light");
    const dark = document.getElementById("hljs-theme-dark");
    if (light) light.disabled = theme !== "light";
    if (dark) dark.disabled = theme !== "dark";
  }

  // HTML プレビューブロック: プレビュー / ソース 切替 + iframe 高さ自動調整。
  // iframe は sandbox="allow-same-origin" (scripts なし) なので、
  // 親から contentDocument.documentElement.scrollHeight を読んで height をセットできる。
  function setHtmlBlockMode(block, mode) {
    if (!block) return;
    const next = mode === "source" ? "source" : "preview";
    if (block.getAttribute("data-mdview-mode") === next) return;
    block.setAttribute("data-mdview-mode", next);
    const tabs = block.querySelectorAll("[data-mdview-target]");
    tabs.forEach((tab) => {
      const isCurrent = tab.getAttribute("data-mdview-target") === next;
      tab.setAttribute("aria-selected", isCurrent ? "true" : "false");
      tab.setAttribute("tabindex", isCurrent ? "0" : "-1");
    });
    const source = block.querySelector(".mdview-html-source");
    if (source) {
      if (next === "source") source.removeAttribute("hidden");
      else source.setAttribute("hidden", "");
    }
  }

  function adjustHtmlFrameHeight(frame) {
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.documentElement) return;
      const h = Math.max(
        doc.documentElement.scrollHeight,
        doc.body ? doc.body.scrollHeight : 0,
      );
      if (h > 0) frame.style.height = h + "px";
    } catch (e) {
      console.warn("[mdview] iframe height adjust failed", e);
    }
  }

  function setupHtmlBlocks() {
    const blocks = document.querySelectorAll(".mdview-html-block");
    blocks.forEach((block) => {
      if (block.dataset.mdviewHtmlReady === "1") return;
      block.dataset.mdviewHtmlReady = "1";

      block.addEventListener("click", (e) => {
        const tab = e.target.closest("[data-mdview-target]");
        if (!tab || !block.contains(tab)) return;
        setHtmlBlockMode(block, tab.getAttribute("data-mdview-target"));
      });
      block.addEventListener("keydown", (e) => {
        const tab = e.target.closest && e.target.closest("[data-mdview-target]");
        if (!tab) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setHtmlBlockMode(block, tab.getAttribute("data-mdview-target"));
        } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const tabs = Array.from(block.querySelectorAll("[data-mdview-target]"));
          if (tabs.length === 0) return;
          const idx = tabs.indexOf(tab);
          const dir = e.key === "ArrowRight" ? 1 : -1;
          const nextTab = tabs[(idx + dir + tabs.length) % tabs.length];
          setHtmlBlockMode(block, nextTab.getAttribute("data-mdview-target"));
          nextTab.focus();
        }
      });

      const frame = block.querySelector(".mdview-html-frame");
      if (frame) {
        const onLoad = () => adjustHtmlFrameHeight(frame);
        frame.addEventListener("load", onLoad);
        // srcdoc は load が既に完了している場合があるため、即時にも試行する。
        adjustHtmlFrameHeight(frame);
      }
    });

    // ウィンドウ幅変更 (= iframe 内のレイアウト再計算) でも高さを追従させる。
    if (blocks.length > 0 && !window.__mdviewHtmlResizeBound) {
      window.__mdviewHtmlResizeBound = true;
      let raf = 0;
      window.addEventListener("resize", () => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          document
            .querySelectorAll(".mdview-html-frame")
            .forEach((f) => adjustHtmlFrameHeight(f));
        });
      });
    }
  }

  // 自動リロード: ファイル変更をサーバから SSE で受け取り、
  // スクロール位置を sessionStorage に退避してから location.reload() する。
  const SCROLL_KEY = "mdview:scrollY";
  function restoreScroll() {
    try {
      const y = sessionStorage.getItem(SCROLL_KEY);
      if (y === null) return;
      sessionStorage.removeItem(SCROLL_KEY);
      const n = Number(y);
      if (Number.isFinite(n)) window.scrollTo(0, n);
    } catch {
      /* sessionStorage 不可環境では無視 */
    }
  }
  function startLiveReload() {
    if (typeof EventSource === "undefined") return;
    const es = new EventSource("/__mdview/events");
    es.addEventListener("reload", () => {
      try {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      } catch {
        /* 退避失敗時もリロードは続行 */
      }
      location.reload();
    });
    es.addEventListener("error", () => {
      // EventSource はデフォルトで自動再接続するため、ここで何もしないでよい
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    const menu = document.getElementById("theme-menu");

    restoreScroll();
    syncUI(currentTheme());
    applyHljsTheme(currentTheme());
    applyHljs();
    applyMermaid(currentTheme());
    setupHtmlBlocks();
    startLiveReload();

    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const wrapper = document.querySelector(".theme-switcher");
        const isOpen = wrapper?.getAttribute("data-state") === "open";
        setMenuOpen(!isOpen);
      });
    }
    if (menu) {
      menu.addEventListener("click", (e) => {
        const item = e.target.closest("[data-theme-choice]");
        if (!item) return;
        setTheme(item.getAttribute("data-theme-choice"));
        setMenuOpen(false);
        btn?.focus();
      });
      menu.addEventListener("keydown", (e) => {
        const item = e.target.closest && e.target.closest("[data-theme-choice]");
        if (e.key === "Enter" || e.key === " ") {
          if (item) {
            e.preventDefault();
            setTheme(item.getAttribute("data-theme-choice"));
            setMenuOpen(false);
            btn?.focus();
          }
        } else if (e.key === "Escape") {
          setMenuOpen(false);
          btn?.focus();
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const items = Array.from(menu.querySelectorAll("[data-theme-choice]"));
          if (items.length === 0) return;
          const idx = items.indexOf(document.activeElement);
          const dir = e.key === "ArrowDown" ? 1 : -1;
          const nextIdx = (idx + dir + items.length) % items.length;
          items[nextIdx].focus();
        }
      });
    }
    document.addEventListener("click", (e) => {
      const wrapper = document.querySelector(".theme-switcher");
      if (!wrapper) return;
      if (!wrapper.contains(e.target)) setMenuOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    });
  });
})();
`;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const THEME_SWITCHER_HTML = `<div class="theme-switcher" data-state="closed">
  <button id="theme-toggle"
          type="button"
          aria-haspopup="menu"
          aria-controls="theme-menu"
          aria-expanded="false"
          aria-label="現在のテーマ">
    <span class="theme-prefix">テーマ:</span>
    <span class="theme-label">ライト</span>
    <span class="theme-chevron" aria-hidden="true">▾</span>
  </button>
  <ul id="theme-menu" role="menu" aria-labelledby="theme-toggle" hidden>
    <li role="menuitemradio" data-theme-choice="light" tabindex="-1" aria-checked="true">
      <span class="theme-mark" aria-hidden="true"></span><span class="theme-name">ライト</span>
    </li>
    <li role="menuitemradio" data-theme-choice="dark" tabindex="-1" aria-checked="false">
      <span class="theme-mark" aria-hidden="true"></span><span class="theme-name">ダーク</span>
    </li>
  </ul>
</div>`;

const HLJS_VERSION = "11.10.0";
const HLJS_CDN = `https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@${HLJS_VERSION}`;
const MERMAID_VERSION = "10.9.3";
const MERMAID_CDN = `https://cdn.jsdelivr.net/npm/mermaid@${MERMAID_VERSION}/dist/mermaid.min.js`;

// SRI ハッシュ (sha384). バージョンを上げる際は再計算すること:
//   curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A
const SRI = {
  hljsLight:
    "sha384-eFTL69TLRZTkNfYZOLM+G04821K1qZao/4QLJbet1pP4tcF+fdXq/9CdqAbWRl/L",
  hljsDark:
    "sha384-wH75j6z1lH97ZOpMOInqhgKzFkAInZPPSPlZpYKYTOqsaizPvhQZmAtLcPKXpLyH",
  mermaid:
    "sha384-R63zfMfSwJF4xCR11wXii+QUsbiBIdiDzDbtxia72oGWfkT7WHJfmD/I/eeHPJyT",
  hljsScript:
    "sha384-GdEWAbCjn+ghjX0gLx7/N1hyTVmPAjdC2OvoAA0RyNcAOhqwtT8qnbCxWle2+uJX",
};

export function renderPage({ title, bodyHtml, sourcePath }) {
  const safeTitle = escapeHtml(title ?? "mdview");
  const metaFooter = sourcePath
    ? `<div class="mdview-meta">source: ${escapeHtml(sourcePath)}</div>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${safeTitle}</title>
<link id="hljs-theme-light" rel="stylesheet" href="${HLJS_CDN}/styles/github.min.css" integrity="${SRI.hljsLight}" crossorigin="anonymous" />
<link id="hljs-theme-dark" rel="stylesheet" href="${HLJS_CDN}/styles/github-dark.min.css" integrity="${SRI.hljsDark}" crossorigin="anonymous" disabled />
<style>${STYLES}</style>
</head>
<body>
${THEME_SWITCHER_HTML}
<main class="markdown-body">
${bodyHtml}
${metaFooter}
</main>
<script src="${MERMAID_CDN}" integrity="${SRI.mermaid}" crossorigin="anonymous"></script>
<script src="${HLJS_CDN}/highlight.min.js" integrity="${SRI.hljsScript}" crossorigin="anonymous"></script>
<script>${SCRIPT}</script>
</body>
</html>
`;
}
