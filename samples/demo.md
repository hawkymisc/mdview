# mdview demo

これは **mdview** のサンプルドキュメントです。

## 特徴

- ターミナルから起動、ブラウザで閲覧
- ライト / ダーク テーマ切替 (右上ボタン)
- Mermaid 図のレンダリング
- シンタックスハイライト (highlight.js)
- ファイル変更時の自動リロード
- ローカル画像の表示

## リスト

- [x] Markdown レンダリング
- [x] Mermaid
- [x] 自動リロード
- [x] シンタックスハイライト

## 表

| 項目 | 値 |
|------|-----|
| Node | v18+ |
| 依存 | marked のみ |

## コード

JavaScript:

```js
function hello(name) {
  return `Hello, ${name}!`;
}
const greet = hello("mdview");
console.log(greet);
```

Python:

```python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fibonacci(10)))
```

Bash:

```bash
#!/usr/bin/env bash
set -euo pipefail

for f in *.md; do
  echo "Processing $f"
  mdview "$f" --no-open
done
```

JSON:

```json
{
  "name": "mdview",
  "version": "0.2.0",
  "engines": {
    "node": ">=18"
  }
}
```

YAML:

```yaml
name: mdview
runtime: node
features:
  - syntax-highlight
  - live-reload
  - mermaid
```

## HTML プレビュー

`` ```html `` で囲んだコードブロックは **プレビュー / ソース** をタブで切替できます。プレビューは sandbox iframe で隔離されるため JavaScript は実行されません (HTML / CSS のみ)。

```html
<div style="padding:16px;border-radius:8px;background:linear-gradient(135deg,#0969da,#58a6ff);color:#fff;font-family:sans-serif;">
  <h3 style="margin:0 0 8px;">Hello from preview!</h3>
  <p style="margin:0;opacity:0.9;">この領域は iframe で描画されています。</p>
  <ul style="margin:8px 0 0;padding-left:20px;">
    <li>HTML / CSS はそのまま反映</li>
    <li>JavaScript は sandbox により無効</li>
  </ul>
</div>
```

## Mermaid 図

```mermaid
graph TD
  A[ターミナル] -->|mdview demo.md| B(ローカルHTTPサーバ)
  B --> C{ブラウザ}
  C -->|テーマ切替| C
  C -->|Mermaid レンダリング| D[SVG]
```

```mermaid
sequenceDiagram
  User->>mdview: mdview doc.md
  mdview->>Browser: open http://127.0.0.1:PORT
  Browser->>mdview: GET /
  mdview-->>Browser: rendered HTML
```

## 引用

> 「シンプルなツールが一番長く使われる」

---

## 画像

ローカル相対パスの画像も `./samples/...` からそのまま参照できます。
