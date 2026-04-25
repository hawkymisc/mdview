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

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    const menu = document.getElementById("theme-menu");

    syncUI(currentTheme());
    applyMermaid(currentTheme());

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
<style>${STYLES}</style>
</head>
<body>
${THEME_SWITCHER_HTML}
<main class="markdown-body">
${bodyHtml}
${metaFooter}
</main>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.3/dist/mermaid.min.js" crossorigin="anonymous"></script>
<script>${SCRIPT}</script>
</body>
</html>
`;
}
