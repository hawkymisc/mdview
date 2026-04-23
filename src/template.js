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

#theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--code-bg);
  color: var(--fg);
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
#theme-toggle:hover { border-color: var(--accent); }

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

  function prefers() {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  function apply(theme) {
    root.setAttribute("data-theme", theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = theme === "dark" ? "☀" : "☽";
    if (window.mermaid) {
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
  }

  const initial = localStorage.getItem(KEY) || prefers();
  apply(initial);

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.textContent = (root.getAttribute("data-theme") === "dark") ? "☀" : "☽";
      btn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        localStorage.setItem(KEY, next);
        apply(next);
      });
    }
    if (window.mermaid) apply(root.getAttribute("data-theme") || "light");
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
<button id="theme-toggle" aria-label="Toggle color theme" title="Toggle theme">☽</button>
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
