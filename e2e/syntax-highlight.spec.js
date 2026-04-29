import { test, expect } from "./fixtures/index.js";

test.describe("シンタックスハイライト", () => {
  test.use({ colorScheme: "light" });

  test("JS / Python のコードブロックに hljs クラスが付与される", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);

    // hljs.highlightElement は data-highlighted="yes" を立てる
    const jsBlock = page.locator("code.language-js");
    await expect(jsBlock).toHaveClass(/hljs/);
    await expect(jsBlock).toHaveAttribute("data-highlighted", "yes");

    const pyBlock = page.locator("code.language-python");
    await expect(pyBlock).toHaveClass(/hljs/);
    await expect(pyBlock).toHaveAttribute("data-highlighted", "yes");
  });

  test("light テーマでは light スタイルシートが有効、dark は無効", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);

    const lightDisabled = await page
      .locator("#hljs-theme-light")
      .evaluate((el) => el.disabled);
    const darkDisabled = await page
      .locator("#hljs-theme-dark")
      .evaluate((el) => el.disabled);

    expect(lightDisabled).toBe(false);
    expect(darkDisabled).toBe(true);
  });

  test("テーマをダークに切り替えると hljs テーマシートも反転する", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);
    await page.locator("#theme-toggle").click();
    await page.locator('[data-theme-choice="dark"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    const lightDisabled = await page
      .locator("#hljs-theme-light")
      .evaluate((el) => el.disabled);
    const darkDisabled = await page
      .locator("#hljs-theme-dark")
      .evaluate((el) => el.disabled);

    expect(lightDisabled).toBe(true);
    expect(darkDisabled).toBe(false);
  });

  test("Mermaid ブロックは hljs ハイライトの対象外", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);
    // pre.mermaid は <code> を持たないので hljs は触らない
    const mermaid = page.locator("pre.mermaid");
    await expect(mermaid).toBeVisible();
    // mermaid 配下に data-highlighted が立った要素は無いこと
    const highlighted = await mermaid
      .locator("[data-highlighted]")
      .count();
    expect(highlighted).toBe(0);
  });
});
