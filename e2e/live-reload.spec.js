import { test, expect } from "./fixtures/index.js";

test.describe("自動リロード (SSE)", () => {
  test.use({ colorScheme: "light" });

  test("ファイルを書き換えると新しい内容に自動リロードされる", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);
    await expect(page.locator("h1").first()).toHaveText("E2E Test Document");

    // EventSource の接続が確立するまで待つ。サーバ側で 75ms デバウンスがあるので
    // それより十分長い猶予を取る。
    await page.waitForTimeout(300);

    mdview.rewrite("# Reloaded Title\n\nNew content.\n");

    // h1 が新しいタイトルに変わるまで待つ (リロード後の DOM)
    await expect(page.locator("h1").first()).toHaveText("Reloaded Title", {
      timeout: 5_000,
    });
  });

  test("リロード後もスクロール位置が維持される", async ({ page, mdview }) => {
    // スクロール可能になるよう長めの本文を書き込む
    const longBody = Array.from({ length: 60 }, (_, i) => `Line ${i + 1}.`).join(
      "\n\n",
    );
    mdview.rewrite(`# Long\n\n${longBody}\n\n## Tail\n\nBottom marker.\n`);

    await page.goto(mdview.baseUrl);
    await page.waitForTimeout(300);

    // 任意の位置までスクロール
    const targetY = 1500;
    await page.evaluate((y) => window.scrollTo(0, y), targetY);
    const beforeY = await page.evaluate(() => window.scrollY);
    expect(beforeY).toBeGreaterThan(0);

    // 内容を書き換えてリロードを発火 (本文は維持してスクロール領域を保つ)
    mdview.rewrite(
      `# Long Updated\n\n${longBody}\n\n## Tail\n\nBottom marker.\n`,
    );
    await expect(page.locator("h1").first()).toHaveText("Long Updated", {
      timeout: 5_000,
    });

    // sessionStorage 経由でスクロール位置が復元される (±50px の許容)。
    // restoreScroll → applyMermaid (SVG 化) → applyHljs の順で DOMContentLoaded
    // 内が走るため、レイアウト確定までは scrollY が一時的にぶれる可能性がある。
    // expect(...).toPass で安定するまでリトライする。
    await expect(async () => {
      const afterY = await page.evaluate(() => window.scrollY);
      expect(Math.abs(afterY - beforeY)).toBeLessThan(50);
    }).toPass({ timeout: 2000 });
  });

  test("リロード後もテーマ (dark) が維持される", async ({ page, mdview }) => {
    await page.goto(mdview.baseUrl);
    await page.locator("#theme-toggle").click();
    await page.locator('[data-theme-choice="dark"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.waitForTimeout(300);
    mdview.rewrite("# Theme Persist\n\nSurvive reload.\n");

    await expect(page.locator("h1").first()).toHaveText("Theme Persist", {
      timeout: 5_000,
    });
    // localStorage 経由でテーマが維持される
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
