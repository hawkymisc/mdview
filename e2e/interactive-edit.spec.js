import { test, expect } from "./fixtures/index.js";
import { readFileSync, writeFileSync } from "node:fs";

test.describe("インタラクティブ編集", () => {
  test("タスクリストの checkbox が編集可能 (disabled が外れている)", async ({
    page,
    mdview,
  }) => {
    writeFileSync(
      mdview.mdPath,
      ["# Tasks", "", "- [ ] todo1", "- [x] todo2", ""].join("\n"),
    );
    await page.goto(mdview.baseUrl);
    const cbs = page.locator("input.mdview-task-checkbox");
    await expect(cbs).toHaveCount(2);
    await expect(cbs.nth(0)).not.toBeDisabled();
    await expect(cbs.nth(1)).toBeChecked();
  });

  test("checkbox をクリックするとソースファイルが更新される", async ({
    page,
    mdview,
  }) => {
    writeFileSync(
      mdview.mdPath,
      ["# Tasks", "", "- [ ] todo1", "- [ ] todo2", ""].join("\n"),
    );
    await page.goto(mdview.baseUrl);
    const first = page.locator("input.mdview-task-checkbox").nth(0);
    await first.check();
    // POST 完了 (file write) を待つ
    await expect
      .poll(() => readFileSync(mdview.mdPath, "utf8"))
      .toMatch(/- \[x\] todo1/);
    const src = readFileSync(mdview.mdPath, "utf8");
    expect(src).toMatch(/- \[ \] todo2/);
  });

  test("既存コメントのマーカが表示され、tooltip 用属性が付与される", async ({
    page,
    mdview,
  }) => {
    writeFileSync(
      mdview.mdPath,
      [
        "# Comment",
        "",
        'これは<span class="mdview-comment-mark" data-mdview-comment-id="1">注目</span>です。',
        "",
        "<!--mdview-comment[1]: 注目すべき点はここです-->",
        "",
      ].join("\n"),
    );
    await page.goto(mdview.baseUrl);
    const mark = page.locator(".mdview-comment-mark");
    await expect(mark).toBeVisible();
    await expect(mark).toHaveAttribute(
      "data-mdview-comment-text",
      "注目すべき点はここです",
    );
    await expect(mark.locator(".mdview-comment-icon")).toBeVisible();
  });

  test("マーカに hover するとコメントが tooltip 表示される", async ({
    page,
    mdview,
  }) => {
    writeFileSync(
      mdview.mdPath,
      [
        "# Comment",
        "",
        'これは<span class="mdview-comment-mark" data-mdview-comment-id="1">注目</span>です。',
        "",
        "<!--mdview-comment[1]: ヒントテキスト-->",
        "",
      ].join("\n"),
    );
    await page.goto(mdview.baseUrl);
    const mark = page.locator(".mdview-comment-mark");
    await mark.hover();
    // CSS の ::after に content として表示される。computed style から content を読む
    const content = await mark.evaluate((el) =>
      getComputedStyle(el, "::after").getPropertyValue("content"),
    );
    expect(content).toContain("ヒントテキスト");
  });
});
