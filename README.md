# mdview

[![test](https://github.com/hawkymisc/mdview/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/hawkymisc/mdview/actions/workflows/test.yml)

ターミナルから起動して、ブラウザで Markdown を閲覧する軽量ビューアです。
macOS 専用の [`mo`](https://github.com/hisaac/mo) / [`arto`](https://github.com/sindresorhus/arto) の Linux 代替として作りました。

- 🌗 ライト / ダーク テーマ切替 (`prefers-color-scheme` に追従、`localStorage` で記憶)
- 🧜 [Mermaid](https://mermaid.js.org/) 図のレンダリング (`` ```mermaid `` ブロック)
- 🔄 ファイル変更を検知して**ブラウザを自動リロード** (Server-Sent Events、依存追加なし)
- 🎨 [highlight.js](https://highlightjs.org/) によるコードブロックのシンタックスハイライト (テーマ連動)
- 🖼  Markdown と同ディレクトリ配下の画像・アセットを自動配信
- 📦 サーバー側依存は `marked` のみ。シンプルでポータブル

## Requirements

- Node.js **>= 18** (内蔵 `node:test` を利用するため。動作確認は 22.x)
- Linux / macOS / WSL

## Install

```bash
git clone https://github.com/hawkymisc/mdview.git
cd mdview
npm install
npm link        # `mdview` をグローバルコマンドとして使えるようにする
```

> `npm link` を使わない場合は `node /path/to/mdview/bin/mdview.js <file.md>` で直接起動できます。

## Usage

```bash
mdview path/to/document.md
```

ローカルポートに HTTP サーバーが立ち上がり、デフォルトブラウザが自動で開きます。
`Ctrl+C` で停止します。

### Options

| Option | Default | 説明 |
|---|---|---|
| `-p, --port <num>` | `0` (ランダムな空きポート) | リッスンするポート番号 |
| `-H, --host <host>` | `127.0.0.1` | バインドするホスト |
| `--no-open` | (無指定で自動オープン) | ブラウザを自動で開かない |
| `-h, --help` | — | ヘルプを表示 |

### Examples

```bash
# 固定ポートで起動
mdview README.md --port 4000

# ブラウザを開かない (curl/別端末確認用)
mdview docs/spec.md --no-open

# LAN 内の別マシンから見たい場合 (信頼できるネットワークでのみ)
mdview slides.md --host 0.0.0.0 --port 4000
```

## How it works

```
ターミナル
  └─ mdview file.md
       └─ Node.js HTTP server (127.0.0.1:PORT)
            ├─ GET  /                  → Markdown を HTML にレンダリングして返す
            ├─ GET  /raw               → 生 Markdown テキスト
            ├─ GET  /__mdview/events   → Server-Sent Events (ファイル変更通知)
            └─ GET  /<asset>           → file.md と同じディレクトリから静的配信
                                         (パストラバーサル防御あり)
ブラウザ
  ├─ HTML を表示 (CSS 変数でテーマ切替)
  ├─ Mermaid.js (CDN) が `<pre class="mermaid">` ブロックを SVG に変換
  └─ EventSource("/__mdview/events") を購読し、`reload` 受信時に
     スクロール位置を退避 → location.reload() を実行
```

ファイル監視は Node 標準の `fs.watch` をディレクトリ単位で行い (atomic save によるエディタの「rename 保存」にも追従できるように)、連続イベントは 75ms にデバウンスして 1 つの reload としてブロードキャストします。テーマ設定は `localStorage`、スクロール位置は `sessionStorage` に保持されるため、リロード後も状態が復元されます。

## Sample

リポジトリに `samples/demo.md` を同梱しています。テーマ切替や Mermaid 図、表、タスクリストなどの動作確認に利用できます。

```bash
mdview samples/demo.md
```

## Development

```bash
npm test         # ユニット (node --test、ブラウザ不要)
npm run test:e2e # E2E (Playwright + Chromium、初回は npx playwright install chromium が必要)
```

テストは 2 層構成です。

**ユニット (`test/`)** — `node --test` で実行、ブラウザ不要
- `test/render.test.js` — Markdown → HTML 変換、Mermaid ブロック処理、XSS エスケープ
- `test/server.test.js` — HTTP エンドポイント、SSE 配信、close クリーンアップ、パストラバーサル防御

**E2E (`e2e/`)** — Playwright + Chromium で実ブラウザ検証
- `e2e/render.spec.js` — 基本レンダリング (h1、テーマボタン、メタフッター)
- `e2e/theme.spec.js` — テーマ切替 (メニュー開閉、キーボード操作、`prefers-color-scheme` 連動、localStorage 永続化)
- `e2e/syntax-highlight.spec.js` — hljs クラス付与、テーマ連動でスタイルシート切替、Mermaid 非干渉
- `e2e/mermaid.spec.js` — `pre.mermaid` 内に `<svg>` が描画されること
- `e2e/live-reload.spec.js` — ファイル変更で自動リロード、スクロール / テーマの維持

各 E2E テストは `createMdviewServer` を使って tmp ディレクトリに独立した mdview サーバを立ち上げるため、テスト間で状態が干渉しません。

### CI

`main` への push と全 PR で GitHub Actions により自動実行されます (`.github/workflows/test.yml`):

- **unit ジョブ**: Ubuntu / Node 22 / `npm test`
- **e2e ジョブ**: Ubuntu / Node 22 / Chromium / `npm run test:e2e` (Playwright ブラウザはバージョン連動でキャッシュ、失敗時に `playwright-report/` をアーティファクト化)

両ジョブは並列実行。同 ref で push が連続した場合は `concurrency: cancel-in-progress` で古い run を自動キャンセルします。

### Project layout

```
mdview/
├── bin/mdview.js     CLI エントリ (parseArgs + ブラウザ起動)
├── src/
│   ├── render.js     Markdown → HTML (marked + カスタムレンダラ)
│   ├── server.js     HTTP サーバー (静的配信 + パストラバーサル防御)
│   └── template.js   HTML シェル / CSS (テーマ) / クライアント側スクリプト
├── samples/demo.md   動作確認用サンプル
├── test/             ユニット (node --test)
└── e2e/              E2E (Playwright)
    └── fixtures/     共通フィクスチャ + サンプル Markdown
```

## Security notes

- ローカル閲覧用ツールとして設計されています。デフォルトのバインドは `127.0.0.1` で、外部公開は想定していません。
- Markdown 内の `<script>` / `<iframe>` タグおよび `on*=` 属性はサーバー側で除去されます (defense-in-depth)。
- `` ```mermaid `` ブロックの本文は HTML エスケープされた状態で出力されます (本文中の `<script>` 等で XSS が発生しないように)。
- `--host 0.0.0.0` で外部にバインドする場合は **信頼できるネットワーク内** でのみ使用してください。

## Limitations / Roadmap

- 複数ファイル / ファイルツリーは未対応
- Mermaid / highlight.js CDN の SRI ハッシュ未付与 (バージョンピンのみ)
- ファイル監視は **Markdown 本体と同ディレクトリ** のみ (画像差し替え時のリロードは対象外。次バージョンで検討)
- highlight.js のテーマは GitHub light/dark 固定 (`@highlightjs/cdn-assets` の `styles/` から差し替え可能だが、現状は CLI フラグなし)

## License

MIT
