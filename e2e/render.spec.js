import { test, expect } from "./fixtures/index.js";

test.describe("基本レンダリング", () => {
  test("ページが開いて h1 が表示される", async ({ page, mdview }) => {
    await page.goto(mdview.baseUrl);
    await expect(page.locator("h1").first()).toHaveText("E2E Test Document");
  });

  test("テーマ切替ボタンと markdown-body コンテナが表示される", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);
    await expect(page.locator("#theme-toggle")).toBeVisible();
    await expect(page.locator("main.markdown-body")).toBeVisible();
  });

  test("メタフッターに source パスが表示される", async ({ page, mdview }) => {
    await page.goto(mdview.baseUrl);
    const meta = page.locator(".mdview-meta");
    await expect(meta).toBeVisible();
    await expect(meta).toContainText(mdview.mdPath);
  });
});
