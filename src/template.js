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

/* --- Sidebar Navigation --- */
:root {
  --sidebar-width: 280px;
  --sidebar-bg: #f6f8fa;
  --sidebar-fg: #1f2328;
}
:root[data-theme="dark"] {
  --sidebar-bg: #0d1117;
  --sidebar-fg: #e6edf3;
}
.mdview-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: 100vh;
  transition: grid-template-columns 0.18s ease;
}
.mdview-layout[data-sidebar="closed"] {
  grid-template-columns: 0 1fr;
}
.mdview-sidebar {
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
  overflow: hidden;
  background: var(--sidebar-bg);
  color: var(--sidebar-fg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: transform 0.18s ease;
}
.mdview-layout[data-sidebar="closed"] .mdview-sidebar {
  transform: translateX(-100%);
  visibility: hidden;
}
.mdview-sidebar-toggle {
  position: fixed;
  top: 0.9rem;
  left: 0.9rem;
  z-index: 110;
  appearance: none;
  border: 1px solid var(--border);
  background: var(--code-bg);
  color: var(--fg);
  border-radius: 8px;
  width: 2.1rem;
  height: 2.1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-family: inherit;
}
.mdview-sidebar-toggle:hover { border-color: var(--accent); }
.mdview-sidebar-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.mdview-sidebar-toggle .mdview-toggle-icon {
  display: inline-block;
  width: 1em;
  text-align: center;
  line-height: 1;
}
.mdview-sidebar-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 3.5rem 1rem 1rem;
}
.mdview-sidebar-section {
  margin-bottom: 1.5rem;
}
.mdview-sidebar-heading {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin: 0 0 0.5em;
  padding: 0 0.4em;
}
.mdview-toc-list,
.mdview-files-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.mdview-toc-list ul,
.mdview-files-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.mdview-toc-list li,
.mdview-files-list li {
  margin: 0;
}
.mdview-toc-list a,
.mdview-files-list a {
  display: block;
  padding: 0.25em 0.6em;
  border-radius: 4px;
  color: var(--fg);
  text-decoration: none;
  font-size: 0.88rem;
  line-height: 1.4;
  word-break: break-word;
  transition: background 0.1s ease, color 0.1s ease;
}
.mdview-toc-list a:hover,
.mdview-files-list a:hover {
  background: var(--code-bg);
  color: var(--accent);
}
.mdview-toc-list a:focus-visible,
.mdview-files-list a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
.mdview-toc-list a[data-active="true"] {
  color: var(--accent);
  font-weight: 600;
}
.mdview-toc-list a[data-active="true"]::before {
  content: "";
  display: inline-block;
  width: 3px;
  height: 0.9em;
  background: var(--accent);
  margin-right: 0.4em;
  vertical-align: middle;
  border-radius: 2px;
}
/* デフォルトは h2 のみ可視。h3-h6 は隠す。
   読んでいる (active な) h2 セクション内のみ h3 / h4 を展開表示する。
   h5 / h6 は常に hidden (busy 回避)。 */
.mdview-toc-list li[data-toc-level="3"],
.mdview-toc-list li[data-toc-level="4"],
.mdview-toc-list li[data-toc-level="5"],
.mdview-toc-list li[data-toc-level="6"] {
  display: none;
}
.mdview-toc-list li[data-active-section="true"] li[data-toc-level="3"],
.mdview-toc-list li[data-active-section="true"] li[data-toc-level="4"] {
  display: block;
}
.mdview-toc-level-3 a { padding-left: 1.4em; font-size: 0.84rem; }
.mdview-toc-level-4 a { padding-left: 2.2em; font-size: 0.82rem; }
.mdview-toc-level-5 a { padding-left: 3.0em; font-size: 0.80rem; }
.mdview-toc-level-6 a { padding-left: 3.8em; font-size: 0.78rem; }
.mdview-files-list a[aria-current="page"] {
  background: var(--code-bg);
  color: var(--accent);
  font-weight: 600;
}
.mdview-files-directory > .mdview-files-dirname {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
  padding: 0.5em 0.6em 0.25em;
}
.mdview-toc-empty,
.mdview-files-empty {
  font-size: 0.85rem;
  color: var(--muted);
  padding: 0.25em 0.6em;
  font-style: italic;
}
.mdview-sidebar-overlay-backdrop {
  display: none;
}
@media (max-width: 768px) {
  .mdview-layout {
    grid-template-columns: 0 1fr;
  }
  .mdview-layout[data-sidebar="open"] {
    grid-template-columns: 0 1fr; /* overlay (本文を押し下げない) */
  }
  .mdview-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 86vw;
    max-width: 320px;
    height: 100vh;
    z-index: 105;
    border-right: 1px solid var(--border);
    box-shadow: 4px 0 16px rgba(0,0,0,0.18);
    transform: translateX(-100%);
    visibility: hidden;
  }
  .mdview-layout[data-sidebar="open"] .mdview-sidebar {
    transform: translateX(0);
    visibility: visible;
  }
  .mdview-layout[data-sidebar="open"] .mdview-sidebar-overlay-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.32);
    z-index: 104;
  }
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
  // 現在表示中のファイル path (rootDir 相対)。
  // SPA 遷移時に EventSource を path クエリ付きで張り直す。
  function currentRelativePath() {
    const p = decodeURIComponent(location.pathname.replace(/^\\//, ""));
    return p && p.toLowerCase().endsWith(".md") ? p : "";
  }
  let _liveReloadEs = null;
  function startLiveReload() {
    if (typeof EventSource === "undefined") return;
    if (_liveReloadEs) {
      try { _liveReloadEs.close(); } catch (e) { /* ignore */ }
      _liveReloadEs = null;
    }
    const rel = currentRelativePath();
    const url = rel
      ? "/__mdview/events?path=" + encodeURIComponent(rel)
      : "/__mdview/events";
    const es = new EventSource(url);
    _liveReloadEs = es;
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

  // --- Sidebar Navigation ---

  function isInScope(path) {
    if (!path || typeof path !== "string") return false;
    if (!path.toLowerCase().endsWith(".md")) return false;
    const parts = path.split("/");
    if (parts.length > 2) return false;
    if (parts.some((p) => p.startsWith("."))) return false;
    return true;
  }

  function isMobileViewport() {
    return window.matchMedia &&
      window.matchMedia("(max-width: 768px)").matches;
  }

  function sidebarStorageKey() {
    return isMobileViewport() ? "mdview:sidebar:mobile" : "mdview:sidebar:desktop";
  }

  function setSidebarState(open, persist) {
    const layout = document.querySelector(".mdview-layout");
    const toggle = document.querySelector(".mdview-sidebar-toggle");
    if (!layout || !toggle) return;
    const wasOpen = layout.getAttribute("data-sidebar") === "open";
    if (wasOpen === open) return;
    layout.setAttribute("data-sidebar", open ? "open" : "closed");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (persist) {
      try {
        localStorage.setItem(sidebarStorageKey(), open ? "open" : "closed");
      } catch { /* private mode */ }
    }
    // モバイル overlay の focus 制御
    if (isMobileViewport()) {
      if (open) {
        const first = document.querySelector(
          ".mdview-sidebar a, .mdview-sidebar button",
        );
        first?.focus();
      } else {
        toggle.focus();
      }
    }
  }

  function setupSidebarToggle() {
    const layout = document.querySelector(".mdview-layout");
    const toggle = document.querySelector(".mdview-sidebar-toggle");
    if (!layout || !toggle) return;
    // 初期状態の反映 (pre-script の data-mdview-sidebar-initial を見る)
    const initial = root.getAttribute("data-mdview-sidebar-initial");
    if (initial === "closed") setSidebarState(false, false);
    root.removeAttribute("data-mdview-sidebar-initial");

    toggle.addEventListener("click", () => {
      const isOpen = layout.getAttribute("data-sidebar") === "open";
      setSidebarState(!isOpen, true);
    });

    // モバイル: 背景クリック / Escape で閉じる
    document.addEventListener("click", (e) => {
      if (!isMobileViewport()) return;
      const isOpen = layout.getAttribute("data-sidebar") === "open";
      if (!isOpen) return;
      const target = e.target;
      if (target.closest(".mdview-sidebar")) return;
      if (target.closest(".mdview-sidebar-toggle")) return;
      setSidebarState(false, true);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMobileViewport()) {
        const isOpen = layout.getAttribute("data-sidebar") === "open";
        if (isOpen) setSidebarState(false, true);
      }
    });

    // viewport 変化で precedence を再評価
    if (window.matchMedia) {
      const mql = window.matchMedia("(max-width: 768px)");
      const onChange = () => {
        let stored = null;
        try { stored = localStorage.getItem(sidebarStorageKey()); } catch { /* */ }
        const open = stored === "open"
          ? true
          : stored === "closed"
          ? false
          : !isMobileViewport();
        setSidebarState(open, false);
      };
      mql.addEventListener?.("change", onChange);
    }
  }

  function escapeHtmlClient(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function mdUrlFor(p) {
    if (!p) return "/";
    let s = p.startsWith("/") ? p.slice(1) : p;
    return "/" + encodeURI(s);
  }

  let _filesRoot = null;
  async function loadFileList() {
    const list = document.querySelector(".mdview-files-list");
    if (!list) return;
    let data;
    try {
      const res = await fetch("/__mdview/files", { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error("status " + res.status);
      data = await res.json();
    } catch (e) {
      console.warn("[mdview] file list load failed", e);
      list.innerHTML = '<li class="mdview-files-empty">(ファイル一覧を取得できませんでした)</li>';
      return;
    }
    _filesRoot = data.root || null;
    const currentPath = currentRelativePath() || _filesRoot || "";
    const parts = [];
    for (const f of (data.files || [])) {
      const url = mdUrlFor(f.path);
      const isActive = f.path === currentPath;
      parts.push(
        '<li><a href="' + escapeHtmlClient(url) + '"' +
        (isActive ? ' aria-current="page"' : "") +
        '>' + escapeHtmlClient(f.name) + '</a></li>'
      );
    }
    for (const d of (data.directories || [])) {
      parts.push('<li class="mdview-files-directory">');
      parts.push('<span class="mdview-files-dirname">' + escapeHtmlClient(d.name) + '/</span>');
      parts.push('<ul>');
      for (const f of (d.files || [])) {
        const url = mdUrlFor(f.path);
        const isActive = f.path === currentPath;
        parts.push(
          '<li><a href="' + escapeHtmlClient(url) + '"' +
          (isActive ? ' aria-current="page"' : "") +
          '>' + escapeHtmlClient(f.name) + '</a></li>'
        );
      }
      parts.push('</ul></li>');
    }
    if (parts.length === 0) {
      list.innerHTML = '<li class="mdview-files-empty">(他のファイルはありません)</li>';
    } else {
      list.innerHTML = parts.join("");
    }
  }

  function refreshFileListActive() {
    const currentPath = currentRelativePath() || _filesRoot || "";
    document.querySelectorAll(".mdview-files-list a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const p = decodeURIComponent(href.replace(/^\\//, ""));
      if (p === currentPath) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function renderToc() {
    const list = document.querySelector(".mdview-toc-list");
    if (!list) return;
    const main = document.querySelector("main.markdown-body");
    if (!main) return;
    const headings = Array.from(main.querySelectorAll("h2, h3, h4, h5, h6"));
    if (headings.length === 0) {
      list.innerHTML = '<li class="mdview-toc-empty">(見出しがありません)</li>';
      return;
    }
    // ネスト UL を組み立てる。h2/h3 は常時、h4-h6 は deep フラグ付き。
    const stack = [{ level: 1, ul: list }];
    list.innerHTML = "";
    headings.forEach((h) => {
      const level = parseInt(h.tagName.slice(1), 10);
      // 親 UL を見つける (level - 1 以下まで stack を巻き戻す)
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      const parent = stack[stack.length - 1].ul;
      const li = document.createElement("li");
      li.className = "mdview-toc-level-" + level;
      li.dataset.tocLevel = String(level);
      const a = document.createElement("a");
      const id = h.id;
      a.href = "#" + (id || "");
      a.textContent = h.textContent || "";
      a.dataset.tocTarget = id || "";
      li.appendChild(a);
      parent.appendChild(li);
      const childUl = document.createElement("ul");
      li.appendChild(childUl);
      stack.push({ level, ul: childUl });
    });
  }

  let _activeObserver = null;
  let _lastActiveId = null;
  function setupActiveSection() {
    const main = document.querySelector("main.markdown-body");
    if (!main) return;
    const targets = Array.from(main.querySelectorAll("h2, h3, h4, h5, h6"));
    if (_activeObserver) {
      try { _activeObserver.disconnect(); } catch (e) { /* */ }
      _activeObserver = null;
    }
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") return;
    const visible = new Set();
    _activeObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        let activeId = null;
        if (visible.size > 0) {
          const ordered = targets.filter((t) => visible.has(t));
          activeId = ordered[0]?.id || null;
        }
        if (!activeId) {
          // 全 off の場合は直前の active を維持
          activeId = _lastActiveId;
        }
        if (activeId !== _lastActiveId) {
          _lastActiveId = activeId;
          applyActiveToc(activeId);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    targets.forEach((t) => _activeObserver.observe(t));
  }

  function applyActiveToc(activeId) {
    const list = document.querySelector(".mdview-toc-list");
    if (!list) return;
    list.querySelectorAll("a[data-toc-target]").forEach((a) => {
      a.removeAttribute("data-active");
    });
    list.querySelectorAll("li[data-active-section]").forEach((li) => {
      li.removeAttribute("data-active-section");
    });
    if (!activeId) return;
    const link = list.querySelector(
      'a[data-toc-target="' + cssEscape(activeId) + '"]',
    );
    if (!link) return;
    link.setAttribute("data-active", "true");
    // active link を含む最近接の h2 (data-toc-level="2") 祖先 li に
    // active-section を立て、その配下の h3 / h4 だけ CSS で展開する。
    let li = link.closest("li");
    while (li) {
      if (li.dataset.tocLevel === "2") {
        li.setAttribute("data-active-section", "true");
        break;
      }
      li = li.parentElement?.closest("li") || null;
    }
  }

  function cssEscape(s) {
    if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(s);
    return String(s).replace(/[^a-zA-Z0-9_-]/g, (c) =>
      "\\\\" + c.charCodeAt(0).toString(16) + " ",
    );
  }

  function shouldInterceptLink(a, e) {
    if (e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== "_self") return false;
    if (a.hasAttribute("download")) return false;
    const href = a.getAttribute("href");
    if (!href) return false;
    // hash-only リンク
    if (href.startsWith("#")) return false;
    let url;
    try {
      url = new URL(href, location.href);
    } catch {
      return false;
    }
    if (url.origin !== location.origin) return false;
    if (!url.pathname.toLowerCase().endsWith(".md")) return false;
    const rel = decodeURIComponent(url.pathname.replace(/^\\//, ""));
    if (!isInScope(rel)) return false;
    return true;
  }

  async function navigateTo(path, hash, pushHistory) {
    const main = document.querySelector("main.markdown-body");
    if (!main) return;
    let res;
    try {
      res = await fetch(
        "/__mdview/fragment?path=" + encodeURIComponent(path),
        { headers: { accept: "text/html" } },
      );
    } catch (e) {
      console.warn("[mdview] navigation fetch failed", e);
      return;
    }
    if (!res.ok) {
      console.warn("[mdview] navigation status", res.status);
      return;
    }
    const html = await res.text();
    const title = decodeURIComponent(res.headers.get("x-mdview-title") || path);
    main.innerHTML = html;
    document.title = title;

    const newUrl = mdUrlFor(path) + (hash || "");
    if (pushHistory) {
      // 旧 state に現スクロール位置を退避
      try {
        history.replaceState(
          { ...(history.state || {}), scrollY: window.scrollY },
          "",
          location.href,
        );
      } catch (e) { /* ignore */ }
      history.pushState({ path, scrollY: 0 }, "", newUrl);
    }

    reinitContent();
    refreshFileListActive();
    startLiveReload();
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      if (el) el.scrollIntoView();
      else window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }

  function setupSpaNavigation() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      if (!shouldInterceptLink(a, e)) return;
      const url = new URL(a.getAttribute("href"), location.href);
      const rel = decodeURIComponent(url.pathname.replace(/^\\//, ""));
      e.preventDefault();
      navigateTo(rel, url.hash, true);
      // モバイル overlay なら閉じる
      if (isMobileViewport()) setSidebarState(false, true);
    });
  }

  function setupHistoryHandlers() {
    window.addEventListener("popstate", (e) => {
      const state = e.state || {};
      const path = state.path || currentRelativePath();
      if (!path) {
        location.reload();
        return;
      }
      navigateTo(path, location.hash, false).then(() => {
        const y = state.scrollY;
        if (typeof y === "number") window.scrollTo(0, y);
      });
    });
  }

  // SPA 遷移後に既存の hljs / Mermaid / HTML プレビュー初期化を呼び直す。
  // 各 helper は data-* フラグで二重初期化を防ぐため冪等に呼べる前提。
  function reinitContent() {
    try { applyHljs(); } catch (e) { console.warn(e); }
    try { applyMermaid(currentTheme()); } catch (e) { console.warn(e); }
    if (typeof window.__mdviewSetupHtmlBlocks === "function") {
      try { window.__mdviewSetupHtmlBlocks(); } catch (e) { console.warn(e); }
    }
    renderToc();
    setupActiveSection();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    const menu = document.getElementById("theme-menu");

    restoreScroll();
    syncUI(currentTheme());
    applyHljsTheme(currentTheme());
    applyHljs();
    applyMermaid(currentTheme());
    setupSidebarToggle();
    renderToc();
    setupActiveSection();
    loadFileList();
    setupSpaNavigation();
    setupHistoryHandlers();
    startLiveReload();
    // 初期 history.state にも path を持たせ、popstate 復元の信頼性を上げる
    try {
      if (!history.state || !history.state.path) {
        history.replaceState(
          { path: currentRelativePath(), scrollY: 0 },
          "",
          location.href,
        );
      }
    } catch (e) { /* ignore */ }

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

const SIDEBAR_HTML = `<aside class="mdview-sidebar" aria-label="ドキュメントナビゲーション">
  <div id="mdview-sidebar-body" class="mdview-sidebar-body">
    <section class="mdview-sidebar-section" aria-labelledby="mdview-toc-heading">
      <h2 id="mdview-toc-heading" class="mdview-sidebar-heading">目次</h2>
      <nav class="mdview-toc" aria-label="目次">
        <ul class="mdview-toc-list" data-empty-text="(見出しがありません)"></ul>
      </nav>
    </section>
    <section class="mdview-sidebar-section" aria-labelledby="mdview-files-heading">
      <h2 id="mdview-files-heading" class="mdview-sidebar-heading">ファイル</h2>
      <nav class="mdview-files" aria-label="ファイル一覧">
        <ul class="mdview-files-list"></ul>
      </nav>
    </section>
  </div>
</aside>
<button type="button"
        class="mdview-sidebar-toggle"
        aria-label="サイドバーを切り替える"
        aria-expanded="true"
        aria-controls="mdview-sidebar-body">
  <span class="mdview-toggle-icon" aria-hidden="true">☰</span>
</button>
<div class="mdview-sidebar-overlay-backdrop" data-mdview-backdrop hidden></div>`;

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

// FOUC 防止: DOMContentLoaded 前にサイドバー開閉状態を data-sidebar に
// 立てるための pre-script。viewport 幅と localStorage を見て決定する。
const SIDEBAR_PRESCRIPT = `(function(){
  try {
    var isMobile = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
    var KEY = isMobile ? "mdview:sidebar:mobile" : "mdview:sidebar:desktop";
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
    var open;
    if (stored === "open" || stored === "closed") {
      open = stored === "open";
    } else {
      open = !isMobile;
    }
    document.documentElement.setAttribute("data-mdview-sidebar-initial", open ? "open" : "closed");
  } catch (e) { /* swallow */ }
})();`;

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
<script>${SIDEBAR_PRESCRIPT}</script>
</head>
<body>
${THEME_SWITCHER_HTML}
<div class="mdview-layout" data-sidebar="open">
${SIDEBAR_HTML}
<main class="markdown-body">
${bodyHtml}
${metaFooter}
</main>
</div>
<script src="${MERMAID_CDN}" integrity="${SRI.mermaid}" crossorigin="anonymous"></script>
<script src="${HLJS_CDN}/highlight.min.js" integrity="${SRI.hljsScript}" crossorigin="anonymous"></script>
<script>${SCRIPT}</script>
</body>
</html>
`;
}
