import { test, expect } from "./fixtures/index.js";

test.describe("Mermaid", () => {
  test("pre.mermaid 内に <svg> が描画される", async ({ page, mdview }) => {
    await page.goto(mdview.baseUrl);
    const svg = page.locator("pre.mermaid svg");
    // Mermaid CDN ロード + 描画にやや時間がかかるため expect の自動リトライに任せる
    await expect(svg).toBeVisible({ timeout: 10_000 });
  });
});
