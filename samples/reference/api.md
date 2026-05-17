# API リファレンス

mdview の HTTP エンドポイント一覧です。

## GET /

起動 Markdown ファイルを HTML としてレンダリングして返します。

## GET /raw

起動 Markdown ファイルの生テキストを `text/markdown` で返します。

## GET /__mdview/files

同階層と直下サブディレクトリ (1 階層のみ) の `.md` ファイル一覧を JSON で返します。

### レスポンス形式

```json
{
  "root": "demo.md",
  "files": [{ "name": "README.md", "path": "README.md" }],
  "directories": [
    { "name": "guides", "files": [{ "name": "basics.md", "path": "guides/basics.md" }] }
  ]
}
```

## GET /__mdview/fragment?path=...

指定 `.md` を HTML にレンダリングし、`<main>` の innerHTML のみを返します (SPA 遷移用)。

### セキュリティ

- `path` は走査範囲 (深さ 0 or 1) 内である必要があります
- 拡張子 `.md` のみ許可
- 範囲外 / 不正パスは 400 / 403

## GET /__mdview/events?path=...

SSE で reload イベントを購読します。`path` クエリを指定すると、その `.md` ファイルの変更だけを watch します。

## GET /\<path\>.md

任意の `.md` ファイルを返します。`Accept` ヘッダで挙動が分岐します。

| Accept | 挙動 |
|---|---|
| `text/html` を含む | レンダリング済み HTML を返す |
| それ以外 (`*/*` 等) | raw markdown を返す (後方互換) |
| `?raw=1` | Accept に関わらず強制 raw |

## 関連ページ

- [基本ガイド](../guides/basics.md)
- [上級ガイド](../guides/advanced.md)
