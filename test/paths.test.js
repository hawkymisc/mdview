import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeMdPath,
  isInScannedScope,
  mdUrlFor,
} from "../src/paths.js";

describe("normalizeMdPath", () => {
  test("先頭の / を除去する", () => {
    assert.equal(normalizeMdPath("/foo.md"), "foo.md");
    assert.equal(normalizeMdPath("/guides/basics.md"), "guides/basics.md");
  });

  test("URL エンコードされたパスをデコードする", () => {
    assert.equal(normalizeMdPath("/%E6%A6%82%E8%A6%81.md"), "概要.md");
    assert.equal(normalizeMdPath("foo%20bar.md"), "foo bar.md");
  });

  test("Windows 区切り文字 \\ を / に統一する", () => {
    assert.equal(normalizeMdPath("guides\\basics.md"), "guides/basics.md");
  });

  test("親ディレクトリ参照 (.. / .) を含むパスは null を返す", () => {
    assert.equal(normalizeMdPath("../etc/passwd"), null);
    assert.equal(normalizeMdPath("/foo/../bar.md"), null);
    assert.equal(normalizeMdPath("./foo.md"), null);
  });

  test("空文字列や null は null を返す", () => {
    assert.equal(normalizeMdPath(""), null);
    assert.equal(normalizeMdPath(null), null);
    assert.equal(normalizeMdPath(undefined), null);
  });

  test("不正なエンコードは null を返す (例外を投げない)", () => {
    assert.equal(normalizeMdPath("%E0%A4%A"), null);
  });
});

describe("isInScannedScope", () => {
  test("ルート直下のファイル (深さ 0) は true", () => {
    assert.equal(isInScannedScope("README.md"), true);
    assert.equal(isInScannedScope("demo.md"), true);
  });

  test("直下サブディレクトリのファイル (深さ 1) は true", () => {
    assert.equal(isInScannedScope("guides/basics.md"), true);
    assert.equal(isInScannedScope("reference/api.md"), true);
  });

  test("深さ 2 以上のサブディレクトリは false", () => {
    assert.equal(isInScannedScope("a/b/c.md"), false);
    assert.equal(isInScannedScope("guides/nested/deep.md"), false);
  });

  test("拡張子が .md でないファイルは false", () => {
    assert.equal(isInScannedScope("README.txt"), false);
    assert.equal(isInScannedScope("guides/foo.json"), false);
  });

  test("null / undefined / 空文字は false", () => {
    assert.equal(isInScannedScope(null), false);
    assert.equal(isInScannedScope(undefined), false);
    assert.equal(isInScannedScope(""), false);
  });

  test("隠しディレクトリ (. 始まり) は false", () => {
    assert.equal(isInScannedScope(".hidden/foo.md"), false);
  });
});

describe("mdUrlFor", () => {
  test("通常パスは先頭 / 付与で返す", () => {
    assert.equal(mdUrlFor("foo.md"), "/foo.md");
    assert.equal(mdUrlFor("guides/basics.md"), "/guides/basics.md");
  });

  test("日本語ファイル名は encodeURI される (パス区切りはそのまま)", () => {
    assert.equal(mdUrlFor("概要.md"), "/" + encodeURI("概要.md"));
    assert.equal(
      mdUrlFor("guides/概要.md"),
      "/guides/" + encodeURI("概要.md"),
    );
  });

  test("スペースは %20 に encode される", () => {
    assert.equal(mdUrlFor("foo bar.md"), "/foo%20bar.md");
  });

  test("既に / 始まりのパスでも二重にならない", () => {
    assert.equal(mdUrlFor("/foo.md"), "/foo.md");
  });
});
