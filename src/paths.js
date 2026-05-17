// パス取扱の pure utility。
// サーバ (server.js) とクライアント (template.js 内の埋め込み JS) の両方で
// 同じ規約を共有するため、依存ゼロの形で書く。

export function normalizeMdPath(input) {
  if (input == null) return null;
  const s = String(input);
  if (s === "") return null;

  let decoded;
  try {
    decoded = decodeURIComponent(s);
  } catch {
    // 不正な % エスケープは reject
    return null;
  }

  // Windows 区切り文字を / に統一
  decoded = decoded.replace(/\\/g, "/");
  // 先頭の / は除去
  if (decoded.startsWith("/")) decoded = decoded.slice(1);

  // 親ディレクトリ参照 / カレント明示は拒否
  const parts = decoded.split("/");
  if (parts.some((p) => p === ".." || p === ".")) return null;
  // null byte 等の制御文字も拒否
  if (/[\x00-\x1f]/.test(decoded)) return null;

  return decoded;
}

export function isInScannedScope(input) {
  if (input == null) return false;
  const s = String(input);
  if (s === "") return false;
  if (!s.toLowerCase().endsWith(".md")) return false;
  const parts = s.split("/");
  if (parts.length > 2) return false;
  // 隠しディレクトリ / 隠しファイルは除外
  if (parts.some((p) => p.startsWith("."))) return false;
  return true;
}

export function mdUrlFor(relativePath) {
  if (relativePath == null) return "/";
  let s = String(relativePath);
  if (s.startsWith("/")) s = s.slice(1);
  // encodeURI はパス区切り / を保つ
  return "/" + encodeURI(s);
}
