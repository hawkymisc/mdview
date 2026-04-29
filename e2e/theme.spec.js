import { test, expect } from "./fixtures/index.js";

test.describe("テーマ切替", () => {
  test.use({ colorScheme: "light" });

  test("colorScheme=light で開くと初期は light テーマ", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("ボタンクリックでメニューが開閉する", async ({ page, mdview }) => {
    await page.goto(mdview.baseUrl);
    const toggle = page.locator("#theme-toggle");
    const menu = page.locator("#theme-menu");

    await expect(menu).toBeHidden();
    await toggle.click();
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  test("メニュー外クリックで閉じる", async ({ page, mdview }) => {
    await page.goto(mdview.baseUrl);
    await page.locator("#theme-toggle").click();
    await expect(page.locator("#theme-menu")).toBeVisible();

    // メニュー外の要素 (本文の h1) をクリック
    await page.locator("main.markdown-body h1").click();
    await expect(page.locator("#theme-menu")).toBeHidden();
  });

  test("Escape キーでメニューが閉じる", async ({ page, mdview }) => {
    await page.goto(mdview.baseUrl);
    await page.locator("#theme-toggle").click();
    await expect(page.locator("#theme-menu")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator("#theme-menu")).toBeHidden();
  });

  test("ArrowDown でメニュー内をフォーカス移動できる", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);
    await page.locator("#theme-toggle").click();

    // メニューが開くと現在テーマ (light) の項目にフォーカスが当たる
    await expect(
      page.locator('[data-theme-choice="light"]'),
    ).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(
      page.locator('[data-theme-choice="dark"]'),
    ).toBeFocused();
  });

  test("ダーク選択で data-theme=dark に切り替わる", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);
    await page.locator("#theme-toggle").click();
    await page.locator('[data-theme-choice="dark"]').click();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("#theme-menu")).toBeHidden();
  });

  test("ダーク選択後リロードしてもダークのまま (localStorage 永続化)", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);
    await page.locator("#theme-toggle").click();
    await page.locator('[data-theme-choice="dark"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});

test.describe("テーマ切替 — prefers-color-scheme: dark", () => {
  test.use({ colorScheme: "dark" });

  test("colorScheme=dark で開くと初期は dark テーマ", async ({
    page,
    mdview,
  }) => {
    await page.goto(mdview.baseUrl);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
