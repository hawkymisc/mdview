import { test, expect } from "./fixtures/index.js";

test.describe("HTML プレビューブロック", () => {
  test("初期表示でプレビュー (iframe) が見え、ソース pre は hidden", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);
    const block = page.locator(".mdview-html-block").first();
    await expect(block).toBeVisible();
    await expect(block).toHaveAttribute("data-mdview-mode", "preview");

    const frame = block.locator("iframe.mdview-html-frame");
    await expect(frame).toBeVisible();
    await expect(frame).toHaveAttribute("sandbox", "allow-same-origin");

    const source = block.locator(".mdview-html-source");
    await expect(source).toBeHidden();
  });

  test("iframe 内に元 HTML が描画されている", async ({ page, mdview }) => {
    await page.goto(mdview.baseUrl);
    const frame = page
      .locator(".mdview-html-block iframe.mdview-html-frame")
      .first();
    await expect(frame).toBeVisible();
    const innerLocator = frame.contentFrame().locator(
      '[data-testid="html-preview-paragraph"]',
    );
    await expect(innerLocator).toHaveText(
      "This is rendered inside the iframe.",
    );
  });

  test("ソースタブをクリックすると pre が表示される", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);
    const block = page.locator(".mdview-html-block").first();
    const sourceTab = block.locator('[data-mdview-target="source"]');
    await sourceTab.click();

    await expect(block).toHaveAttribute("data-mdview-mode", "source");
    await expect(sourceTab).toHaveAttribute("aria-selected", "true");
    await expect(block.locator(".mdview-html-source")).toBeVisible();
    await expect(block.locator("iframe.mdview-html-frame")).toBeHidden();
  });

  test("プレビュータブで元に戻せる (冪等)", async ({ page, mdview }) => {
    await page.goto(mdview.baseUrl);
    const block = page.locator(".mdview-html-block").first();
    await block.locator('[data-mdview-target="source"]').click();
    await block.locator('[data-mdview-target="preview"]').click();
    await expect(block).toHaveAttribute("data-mdview-mode", "preview");
    await expect(block.locator("iframe.mdview-html-frame")).toBeVisible();
  });

  test("iframe 内の script は sandbox により実行されない", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);
    // fixture には script を入れていないが、構造的に sandbox 属性に allow-scripts が無いことを担保する
    const sandbox = await page
      .locator(".mdview-html-block iframe.mdview-html-frame")
      .first()
      .getAttribute("sandbox");
    expect(sandbox).toBe("allow-same-origin");
    expect(sandbox).not.toMatch(/allow-scripts/);
  });
});
