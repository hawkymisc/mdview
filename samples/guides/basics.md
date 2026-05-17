# 基本ガイド

mdview の基本的な使い方を説明します。

## インストール

```bash
git clone https://github.com/hawkymisc/mdview.git
cd mdview
npm install
npm link
```

## 起動

任意の Markdown ファイルを引数に渡して起動します。

```bash
mdview README.md
```

### よく使うオプション

- `--port <num>` でポート固定
- `--no-open` でブラウザ自動起動を抑止
- `--host 0.0.0.0` で LAN 公開 (信頼ネットワーク内のみ)

## 関連ページ

- [上級ガイド](./advanced.md)
- [API リファレンス](../reference/api.md)
- [トップに戻る](../demo.md)
