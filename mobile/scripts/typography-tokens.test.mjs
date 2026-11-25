import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = join(MOBILE_ROOT, "..", "packages/design-tokens/src");
const read = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");
const readPkg = (relativePath) => readFileSync(join(PKG, relativePath), "utf8");

test("design-tokens typography ladder matches web --iz-font-*", () => {
  const typo = readPkg("typography.ts");
  const css = readFileSync(
    join(MOBILE_ROOT, "..", "client/src/shared/styles/designTokens.css"),
    "utf8",
  );
  const pairs = [
    ["font2xs", "11"],
    ["fontXs", "12"],
    ["fontSm", "13"],
    ["fontBase", "14"],
    ["fontMd", "15"],
    ["fontLg", "16"],
    ["fontXl", "17"],
    ["font2xl", "18"],
    ["font3xl", "20"],
    ["font4xl", "22"],
    ["font5xl", "24"],
    ["font6xl", "26"],
    ["font7xl", "28"],
  ];
  for (const [key, px] of pairs) {
    assert.match(typo, new RegExp(`${key}:\\s*${px}\\b`), key);
  }
  assert.match(css, /--iz-font-base:\s*14px/);
  assert.match(css, /--iz-font-md:\s*15px/);
  assert.match(css, /--iz-font-lg:\s*16px/);
});

test("AppText variant uses resolveTypeScale", () => {
  assert.match(read("shared/ui/AppText.tsx"), /resolveTypeScale/);
  assert.match(read("shared/theme/typeScale.ts"), /TypeScaleRole/);
  assert.match(read("shared/ui/AppButton.tsx"), /theme\.typography\.fontMd/);
  assert.match(read("shared/ui/ScreenStates.tsx"), /theme\.typography\.fontMd/);
  assert.match(
    read("shared/ui/StaffModerationActions.tsx"),
    /theme\.typography\.fontBase/,
  );
});

test("shared/theme integer ladder prefers theme.typography (sample)", () => {
  const samples = [
    "shared/theme/formChromeStyles.ts",
    "shared/theme/profileChromeStyles.ts",
    "shared/theme/myOrdersPageStyles.ts",
    "shared/theme/usersPageStyles.ts",
  ];
  for (const file of samples) {
    const src = read(file);
    assert.match(src, /theme\.typography\.font/, file);
    // Целые ступени лестницы — только через токен (дробные rem leftover ок).
    assert.doesNotMatch(src, /fontSize:\s*14(?!\.)\b/, file);
    assert.doesNotMatch(src, /fontSize:\s*15(?!\.)\b/, file);
    assert.doesNotMatch(src, /fontSize:\s*16(?!\.)\b/, file);
  }
});

test("createThemedStyles documents typography rule", () => {
  assert.match(
    read("shared/theme/createThemedStyles.ts"),
    /theme\.typography\.\*/,
  );
});
