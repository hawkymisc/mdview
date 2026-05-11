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
main.markdown-body input.mdview-task-checkbox {
  cursor: pointer;
}
main.markdown-body input.mdview-task-checkbox:disabled {
  /* JS が disabled を外す前の一瞬でもクリックできるように透明度だけ落とす */
  opacity: 0.7;
}

.mdview-comment-mark {
  background: rgba(255, 213, 79, 0.28);
  border-bottom: 1px dashed rgba(176, 130, 0, 0.85);
  border-radius: 2px;
  padding: 0 1px;
  position: relative;
  cursor: help;
}
:root[data-theme="dark"] .mdview-comment-mark {
  background: rgba(255, 213, 79, 0.18);
  border-bottom-color: rgba(255, 213, 79, 0.7);
}
.mdview-comment-icon {
  display: inline-block;
  margin-left: 0.15em;
  font-size: 0.78em;
  vertical-align: super;
  line-height: 1;
  user-select: none;
  cursor: help;
  filter: saturate(0.85);
}
.mdview-comment-mark:hover::after {
  content: attr(data-mdview-comment-text);
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  background: var(--fg);
  color: var(--bg);
  padding: 0.45em 0.7em;
  border-radius: 6px;
  font-size: 0.82rem;
  line-height: 1.45;
  white-space: pre-wrap;
  max-width: 360px;
  min-width: 6rem;
  z-index: 50;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
  pointer-events: none;
  font-weight: normal;
}

#mdview-context-menu {
  position: absolute;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.25em 0;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  z-index: 200;
  min-width: 12rem;
  font-size: 0.9rem;
}
#mdview-context-menu[hidden] { display: none; }
#mdview-context-menu button {
  display: block;
  width: 100%;
  background: transparent;
  border: 0;
  padding: 0.5em 1em;
  text-align: left;
  color: var(--fg);
  font: inherit;
  cursor: pointer;
}
#mdview-context-menu button:hover,
#mdview-context-menu button:focus-visible {
  background: var(--code-bg);
  outline: none;
}

#mdview-comment-dialog {
  position: fixed;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  z-index: 250;
}
#mdview-comment-dialog[data-open="true"] { display: flex; }
#mdview-comment-dialog .mdview-dialog-card {
  background: var(--bg);
  color: var(--fg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.2rem 1.3rem;
  width: min(440px, 92vw);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}
#mdview-comment-dialog h2 {
  margin: 0 0 0.6em;
  font-size: 1rem;
}
#mdview-comment-dialog .mdview-dialog-target {
  display: block;
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.4em 0.6em;
  margin-bottom: 0.8em;
  font-size: 0.85rem;
  max-height: 4.5em;
  overflow: auto;
  white-space: pre-wrap;
}
#mdview-comment-dialog textarea {
  width: 100%;
  min-height: 5.5em;
  resize: vertical;
  background: var(--bg);
  color: var(--fg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.5em 0.6em;
  font: inherit;
  font-size: 0.92rem;
}
#mdview-comment-dialog textarea:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
#mdview-comment-dialog .mdview-dialog-actions {
  margin-top: 0.9em;
  display: flex;
  justify-content: flex-end;
  gap: 0.5em;
}
#mdview-comment-dialog button {
  padding: 0.4em 1em;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--code-bg);
  color: var(--fg);
  cursor: pointer;
  font: inherit;
  font-size: 0.9rem;
}
#mdview-comment-dialog button[data-action="submit"] {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
#mdview-comment-dialog button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

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
  // 自分自身が POST した編集による reload は、楽観的 DOM 更新で既に反映済みなので
  // suppressReloadUntil まで無視する。他のクライアント発の編集はそのままリロードされる。
  let suppressReloadUntil = 0;
  function suppressNextReload(ms) {
    suppressReloadUntil = Date.now() + ms;
  }

  function startLiveReload() {
    if (typeof EventSource === "undefined") return;
    const es = new EventSource("/__mdview/events");
    es.addEventListener("reload", () => {
      if (Date.now() < suppressReloadUntil) return;
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

  // ---- インタラクティブ編集: タスクリストチェックボックス ----
  function setupCheckboxEditing() {
    const main = document.querySelector("main.markdown-body");
    if (!main) return;
    main.querySelectorAll("input.mdview-task-checkbox").forEach((cb) => {
      cb.disabled = false;
    });
    main.addEventListener("change", async (e) => {
      const cb = e.target.closest("input.mdview-task-checkbox");
      if (!cb) return;
      const idx = Number(cb.dataset.mdviewTaskIndex);
      if (!Number.isFinite(idx)) return;
      const checked = cb.checked;
      // 楽観的更新: ファイル変更による reload はスキップ
      suppressNextReload(2500);
      try {
        const r = await fetch("/__mdview/edit/checkbox", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ index: idx, checked }),
        });
        if (!r.ok) {
          cb.checked = !checked;
          suppressReloadUntil = 0;
          const data = await r.json().catch(() => ({}));
          window.alert(
            "チェックの保存に失敗しました: " + (data.error || r.status),
          );
        }
      } catch (err) {
        cb.checked = !checked;
        suppressReloadUntil = 0;
        window.alert("チェック保存中にエラー: " + err.message);
      }
    });
  }

  // ---- インタラクティブ編集: コメント挿入 (右クリックで追加) ----
  function getCommonAncestorElement(range) {
    let n = range.commonAncestorContainer;
    if (n && n.nodeType !== 1) n = n.parentElement;
    return n;
  }

  function selectionWithinMain(range, main) {
    return (
      main &&
      main.contains(range.startContainer) &&
      main.contains(range.endContainer)
    );
  }

  function selectionTextOffsetIn(root, node, offset) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let total = 0;
    let cur;
    while ((cur = walker.nextNode())) {
      if (cur === node) return total + offset;
      total += cur.nodeValue.length;
    }
    // node 自体がテキストノードでなかった場合 (要素境界): その要素直前までの長さ
    return total;
  }

  function captureSelectionContext(range, main) {
    const fullText = main.textContent;
    const startOffset = selectionTextOffsetIn(
      main,
      range.startContainer,
      range.startOffset,
    );
    const selectedText = range.toString();
    const N = 40;
    const before = fullText.slice(Math.max(0, startOffset - N), startOffset);
    const after = fullText.slice(
      startOffset + selectedText.length,
      startOffset + selectedText.length + N,
    );
    return { selectedText, before, after };
  }

  function buildContextMenu() {
    const menu = document.createElement("div");
    menu.id = "mdview-context-menu";
    menu.hidden = true;
    menu.setAttribute("role", "menu");
    menu.innerHTML =
      '<button type="button" data-action="add-comment" role="menuitem">💬 コメントを追加</button>';
    document.body.appendChild(menu);
    return menu;
  }

  function buildCommentDialog() {
    const wrap = document.createElement("div");
    wrap.id = "mdview-comment-dialog";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-labelledby", "mdview-comment-dialog-title");
    wrap.innerHTML =
      '<form class="mdview-dialog-card" autocomplete="off">' +
      '<h2 id="mdview-comment-dialog-title">コメントを追加</h2>' +
      '<span class="mdview-dialog-target"></span>' +
      '<textarea required placeholder="コメント内容を入力 (Cmd/Ctrl+Enter で送信)"></textarea>' +
      '<div class="mdview-dialog-actions">' +
      '<button type="button" data-action="cancel">キャンセル</button>' +
      '<button type="submit" data-action="submit">追加</button>' +
      "</div>" +
      "</form>";
    document.body.appendChild(wrap);
    return wrap;
  }

  function setupCommentEditing() {
    const main = document.querySelector("main.markdown-body");
    if (!main) return;
    const menu = buildContextMenu();
    const dialog = buildCommentDialog();
    const dialogTarget = dialog.querySelector(".mdview-dialog-target");
    const textarea = dialog.querySelector("textarea");
    const form = dialog.querySelector("form");

    let pending = null;

    function hideMenu() {
      if (!menu.hidden) menu.hidden = true;
    }
    function openDialog(selection) {
      pending = selection;
      dialogTarget.textContent = selection.selectedText;
      textarea.value = "";
      dialog.setAttribute("data-open", "true");
      // フォーカスは次フレームで (display:flex 反映後)
      requestAnimationFrame(() => textarea.focus());
    }
    function closeDialog() {
      dialog.removeAttribute("data-open");
      pending = null;
    }

    main.addEventListener("contextmenu", (e) => {
      // コメントマーカ自体への contextmenu はネイティブメニュー優先
      if (e.target.closest(".mdview-comment-mark")) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      if (!selectionWithinMain(range, main)) return;
      const text = sel.toString();
      if (!text || !text.trim()) return;
      e.preventDefault();
      pending = captureSelectionContext(range, main);
      menu.style.left = e.pageX + "px";
      menu.style.top = e.pageY + "px";
      menu.hidden = false;
      // フォーカスはボタンへ
      menu.querySelector("button")?.focus();
    });

    document.addEventListener("click", (e) => {
      if (menu.hidden) return;
      if (!menu.contains(e.target)) hideMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        hideMenu();
        if (dialog.getAttribute("data-open") === "true") closeDialog();
      }
    });

    menu.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      if (btn.dataset.action === "add-comment") {
        hideMenu();
        if (pending) openDialog(pending);
      }
    });

    dialog.addEventListener("click", (e) => {
      // 背景クリックで閉じる
      if (e.target === dialog) {
        closeDialog();
        return;
      }
      const btn = e.target.closest("button[data-action]");
      if (btn?.dataset.action === "cancel") {
        e.preventDefault();
        closeDialog();
      }
    });

    textarea.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!pending) {
        closeDialog();
        return;
      }
      const comment = textarea.value.trim();
      if (!comment) return;
      const submission = { ...pending, comment };
      const submitBtn = form.querySelector("button[data-action='submit']");
      submitBtn.disabled = true;
      try {
        const r = await fetch("/__mdview/edit/comment", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(submission),
        });
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          const reason =
            data.code === "selection-not-found"
              ? "選択範囲をソースに対応付けできませんでした (整形済みテキストが原因の可能性)"
              : data.code === "selection-ambiguous"
                ? "選択範囲が複数箇所と一致したため挿入できません。前後をもう少し含めて選択してください"
                : data.error || ("HTTP " + r.status);
          window.alert("コメント追加に失敗: " + reason);
          submitBtn.disabled = false;
          return;
        }
        // 成功: 自分のリロードは抑止しつつ、サーバの reload で comment マークを反映
        // ただし suppress すると自分は何もリロードしないので、ここでは suppress しない。
        closeDialog();
        submitBtn.disabled = false;
      } catch (err) {
        submitBtn.disabled = false;
        window.alert("コメント追加中にエラー: " + err.message);
      }
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
    setupCheckboxEditing();
    setupCommentEditing();
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
