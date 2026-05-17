import { test, expect } from "./fixtures/index.js";

test.describe("サイドバー: デスクトップ初期表示", () => {
  test("デスクトップ幅で初期はサイドバーが open", async ({ page, mdview }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(mdview.baseUrl);
    const layout = page.locator(".mdview-layout");
    await expect(layout).toHaveAttribute("data-sidebar", "open");
    await expect(page.locator(".mdview-sidebar")).toBeVisible();
  });

  test("TOC は default で h2 のみ可視 (active-section なしのとき h3 は隠れる)", async ({
    page,
    mdview,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // basics.md は h2 (First section, Second section) + h3 (Detail one, Detail two)
    await page.goto(`${mdview.baseUrl}/guides/basics.md`);
    // IntersectionObserver が付ける active-section をいったん外し、
    // CSS の「default 表示状態」を直接検証する。
    await page.evaluate(() => {
      document
        .querySelectorAll(".mdview-toc-list li[data-active-section]")
        .forEach((li) => li.removeAttribute("data-active-section"));
    });
    const toc = page.locator(".mdview-toc-list");
    await expect(toc).toBeVisible();
    await expect(
      toc.locator('li[data-toc-level="2"]', { hasText: "First section" }),
    ).toBeVisible();
    await expect(
      toc.locator('li[data-toc-level="2"]', { hasText: "Second section" }),
    ).toBeVisible();
    await expect(
      toc.locator('li[data-toc-level="3"]', { hasText: "Detail one" }),
    ).toBeHidden();
  });

  test("active な h2 セクション配下の h3 / h4 は展開される", async ({
    page,
    mdview,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${mdview.baseUrl}/guides/basics.md`);
    // h2 li に直接 active-section を立てて CSS を検証 (IntersectionObserver の
    // タイミング依存を避けるため、CSS ルール自体の正しさを確認する)
    await page.evaluate(() => {
      const h2 = document.querySelector(
        '.mdview-toc-list li[data-toc-level="2"]',
      );
      if (h2) h2.setAttribute("data-active-section", "true");
    });
    const detailLi = page.locator('li[data-toc-level="3"]', {
      hasText: "Detail one",
    });
    await expect(detailLi).toBeVisible();
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
    await page
      .locator('.mdview-files-list a[href="/guides/basics.md"]')
      .click();
    // pushState 完了を URL 変更で同期 (これを待たずに goBack すると
    // playwright が直前の about:blank までキャンセルしてしまう)
    await expect(page).toHaveURL(/\/guides\/basics\.md$/);
    await page.goBack();
    // baseUrl は末尾 / の有無があり得る ("http://127.0.0.1:PORT" or 同 "/")
    await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/?$/);
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
