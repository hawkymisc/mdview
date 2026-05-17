import { test, expect } from "./fixtures/index.js";

test.describe("サイドバー: デスクトップ初期表示", () => {
  test("デスクトップ幅で初期はサイドバーが open", async ({ page, mdview }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(mdview.baseUrl);
    const layout = page.locator(".mdview-layout");
    await expect(layout).toHaveAttribute("data-sidebar", "open");
    await expect(page.locator(".mdview-sidebar")).toBeVisible();
  });

  test("TOC に h2/h3 が表示される (h4-h6 は初期非表示)", async ({
    page,
    mdview,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(mdview.baseUrl);
    const toc = page.locator(".mdview-toc-list");
    // document.md には複数 h2 がある
    await expect(toc).toBeVisible();
    await expect(
      toc.locator("a", { hasText: "Code blocks" }),
    ).toBeVisible();
  });

  test("ファイル一覧が描画される (同階層 + 直下サブ)", async ({
    page,
    mdview,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(mdview.baseUrl);
    const files = page.locator(".mdview-files-list");
    await expect(files).toBeVisible();
    await expect(files.locator('a[href="/sibling.md"]')).toBeVisible();
    await expect(
      files.locator('a[href="/guides/basics.md"]'),
    ).toBeVisible();
    await expect(
      files.locator('a[href="/guides/advanced.md"]'),
    ).toBeVisible();
  });

  test("2 階層目 (guides/nested/deep.md) はファイル一覧に出ない", async ({
    page,
    mdview,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(mdview.baseUrl);
    const files = page.locator(".mdview-files-list");
    await expect(files.getByText("deep.md")).toHaveCount(0);
    await expect(files.getByText("nested")).toHaveCount(0);
  });

  test("起動ファイル (doc.md) が aria-current=page でハイライトされる", async ({
    page,
    mdview,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(mdview.baseUrl);
    const docLink = page.locator('.mdview-files-list a[href="/doc.md"]');
    await expect(docLink).toHaveAttribute("aria-current", "page");
  });
});

test.describe("サイドバー: 折りたたみ + localStorage 永続化", () => {
  test("トグルボタンで折りたたまれる + リロード後も維持", async ({
    page,
    mdview,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(mdview.baseUrl);
    const layout = page.locator(".mdview-layout");
    const toggle = page.locator(".mdview-sidebar-toggle");

    await expect(layout).toHaveAttribute("data-sidebar", "open");
    await toggle.click();
    await expect(layout).toHaveAttribute("data-sidebar", "closed");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    // リロード後も closed のまま
    await page.reload();
    await expect(page.locator(".mdview-layout")).toHaveAttribute(
      "data-sidebar",
      "closed",
    );
  });

  test("再度開いて localStorage が open に戻る", async ({ page, mdview }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(mdview.baseUrl);
    const toggle = page.locator(".mdview-sidebar-toggle");
    await toggle.click();
    await toggle.click();
    await expect(page.locator(".mdview-layout")).toHaveAttribute(
      "data-sidebar",
      "open",
    );
    await page.reload();
    await expect(page.locator(".mdview-layout")).toHaveAttribute(
      "data-sidebar",
      "open",
    );
  });
});

test.describe("サイドバー: モバイル overlay", () => {
  test("モバイル幅では初期 closed", async ({ page, mdview }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(mdview.baseUrl);
    await expect(page.locator(".mdview-layout")).toHaveAttribute(
      "data-sidebar",
      "closed",
    );
  });

  test("モバイル幅でトグルすると open になり、Escape で閉じる", async ({
    page,
    mdview,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(mdview.baseUrl);
    const layout = page.locator(".mdview-layout");
    await page.locator(".mdview-sidebar-toggle").click();
    await expect(layout).toHaveAttribute("data-sidebar", "open");
    await page.keyboard.press("Escape");
    await expect(layout).toHaveAttribute("data-sidebar", "closed");
  });
});

test.describe("SPA ファイル遷移", () => {
  test("ファイルクリックで main 差替 + URL 変更", async ({ page, mdview }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(mdview.baseUrl);
    await page.locator('.mdview-files-list a[href="/guides/basics.md"]').click();
    await expect(page).toHaveURL(/\/guides\/basics\.md$/);
    await expect(
      page.locator("main.markdown-body h1", { hasText: "Basics" }),
    ).toBeVisible();
    // active highlight が basics.md に移っている
    await expect(
      page.locator('.mdview-files-list a[href="/guides/basics.md"]'),
    ).toHaveAttribute("aria-current", "page");
  });

  test("ブラウザの戻るで元のページに復帰", async ({ page, mdview }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(mdview.baseUrl);
    await page.locator('.mdview-files-list a[href="/guides/basics.md"]').click();
    await page.goBack();
    await expect(page).toHaveURL(mdview.baseUrl + "/");
    await expect(
      page.locator("main.markdown-body h1").first(),
    ).toHaveText(/E2E Test Document/);
  });

  test("連続 SPA 遷移で hljs / Mermaid が二重初期化しない", async ({
    page,
    mdview,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(mdview.baseUrl);
    await page.locator('.mdview-files-list a[href="/guides/basics.md"]').click();
    await page.locator('.mdview-files-list a[href="/guides/advanced.md"]').click();
    await page.locator('.mdview-files-list a[href="/sibling.md"]').click();
    await page.locator('.mdview-files-list a[href="/doc.md"]').click();
    // 元の document に戻ったとき Mermaid が描画され続けていること
    const svg = page.locator("pre.mermaid svg");
    await expect(svg).toBeVisible({ timeout: 10_000 });
    await expect(svg).toHaveCount(1);
  });

  test("直接 deep URL ロードで該当ファイルが描画される", async ({
    page,
    mdview,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${mdview.baseUrl}/guides/basics.md`);
    await expect(
      page.locator("main.markdown-body h1", { hasText: "Basics" }),
    ).toBeVisible();
    // サイドバーも構築される
    await expect(
      page.locator('.mdview-files-list a[href="/guides/basics.md"]'),
    ).toHaveAttribute("aria-current", "page");
  });

  test("日本語ファイル名のリンクが正しく動く", async ({ page, mdview }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(mdview.baseUrl);
    const link = page.locator(".mdview-files-list a", { hasText: "概要.md" });
    await link.click();
    await expect(page).toHaveURL(/%E6%A6%82%E8%A6%81\.md$/);
    await expect(
      page.locator("main.markdown-body h1", { hasText: "概要" }),
    ).toBeVisible();
  });
});

test.describe("TOC アンカー / active section", () => {
  test("見出しに id が付与される", async ({ page, mdview }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${mdview.baseUrl}/guides/basics.md`);
    await expect(
      page.locator('main h2[id="first-section"]'),
    ).toBeVisible();
    await expect(
      page.locator('main h3[id="detail-one"]'),
    ).toBeVisible();
  });

  test("TOC リンクで該当見出しにスクロール", async ({ page, mdview }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${mdview.baseUrl}/guides/basics.md`);
    await page.locator('.mdview-toc-list a[href="#second-section"]').click();
    await expect(page).toHaveURL(/#second-section$/);
  });
});
