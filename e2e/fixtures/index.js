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
