import { test as base } from "@playwright/test";
import {
  mkdtempSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMdviewServer } from "../../src/server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_MD = path.join(__dirname, "document.md");

// 各テストごとに独立した tmp dir + mdview サーバを立ち上げる Playwright fixture。
// テスト間の状態汚染 (localStorage / sessionStorage は context が分かれるので OK だが、
// ファイル変更検知のテストはサーバ単位で隔離が必要) を防ぐ。
export const test = base.extend({
  mdview: async ({}, use) => {
    const dir = mkdtempSync(path.join(tmpdir(), "mdview-e2e-"));
    const mdPath = path.join(dir, "doc.md");
    copyFileSync(FIXTURE_MD, mdPath);

    // 画像参照のために assets ディレクトリも用意 (1×1 PNG ダミー)
    mkdirSync(path.join(dir, "assets"));
    writeFileSync(path.join(dir, "assets", "logo.png"), "PNG_DUMMY");

    // サイドバーのファイル一覧 / SPA 遷移テスト用に、追加 .md とサブディレクトリも置く。
    // 単体 md を見るテスト (mermaid / theme / live-reload 等) からは無視される。
    writeFileSync(
      path.join(dir, "sibling.md"),
      "# Sibling\n\n## Sibling section\n\nbody from sibling.\n",
    );
    mkdirSync(path.join(dir, "guides"));
    writeFileSync(
      path.join(dir, "guides", "basics.md"),
      [
        "# Basics",
        "",
        "## First section",
        "",
        "intro text.",
        "",
        "### Detail one",
        "",
        "detail body.",
        "",
        "### Detail two",
        "",
        "more detail.",
        "",
        "## Second section",
        "",
        "second body.",
      ].join("\n"),
    );
    writeFileSync(
      path.join(dir, "guides", "advanced.md"),
      "# Advanced\n\n## Topic\n\nadvanced body.\n",
    );
    // 日本語ファイル名のサンプル
    writeFileSync(
      path.join(dir, "guides", "概要.md"),
      "# 概要\n\n## 詳細\n\njapanese body.\n",
    );
    // 走査範囲外 (2 階層目) — サイドバーに出ないことを検証するため
    mkdirSync(path.join(dir, "guides", "nested"));
    writeFileSync(
      path.join(dir, "guides", "nested", "deep.md"),
      "# Deep\n",
    );

    const server = await createMdviewServer({ filePath: mdPath, port: 0 });
    try {
      await use({
        baseUrl: server.url,
        mdPath,
        dir,
        rewrite: (newContent) => writeFileSync(mdPath, newContent),
      });
    } finally {
      await server.close();
    }
  },
});

export { expect } from "@playwright/test";
