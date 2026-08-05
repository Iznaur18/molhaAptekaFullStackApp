import assert from "node:assert/strict";
import { test } from "node:test";

import { izColors, izColorsCustom } from "../src/colors.ts";
import { isDimColorScheme, resolveIzTheme } from "../src/index.ts";

test("custom palette maps photo brand colors", () => {
  assert.equal(izColorsCustom.bg, "#DEDEDE");
  assert.equal(izColorsCustom.text, "#171717");
  assert.equal(izColorsCustom.textMuted, "#4D4D4D");
  assert.equal(izColorsCustom.action, "#F25623");
  assert.equal(izColorsCustom.primary, "#F25623");
  assert.equal(izColorsCustom.link, "#F25623");
  assert.equal(izColorsCustom.surface, "#ffffff");
});

test("custom keeps light status colors", () => {
  assert.equal(izColorsCustom.success, izColors.success);
  assert.equal(izColorsCustom.warning, izColors.warning);
  assert.equal(izColorsCustom.danger, izColors.danger);
  assert.equal(izColorsCustom.info, izColors.info);
});

test("custom is not dim and resolves dedicated theme", () => {
  assert.equal(isDimColorScheme("custom"), false);
  assert.equal(resolveIzTheme("custom").colors.action, "#F25623");
  assert.notEqual(resolveIzTheme("custom").colors.bg, resolveIzTheme("light").colors.bg);
});
