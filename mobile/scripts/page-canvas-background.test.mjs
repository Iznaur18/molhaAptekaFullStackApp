import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = join(MOBILE_ROOT, "..", "packages/design-tokens/src");
const read = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");
const readPkg = (relativePath) => readFileSync(join(PKG, relativePath), "utf8");

test("page canvas: package resolvePageBackground + izPageBgCustom", () => {
  const index = readPkg("index.ts");
  const pageBg = readPkg("pageBg.ts");
  assert.match(index, /resolvePageBackground/);
  assert.match(index, /izPageBgCustom/);
  assert.match(pageBg, /#fafafc/);
});

test("PageCanvas + usePageBackground wire resolvePageBackground", () => {
  assert.match(
    read("shared/ui/PageCanvas.tsx"),
    /backgroundColor:\s*layout\.pageBackground/,
  );
  assert.match(
    read("shared/theme/usePageBackground.ts"),
    /resolvePageBackground/,
  );
  assert.match(
    read("shared/theme/createThemedStyles.ts"),
    /pageBackground:\s*string/,
  );
  assert.match(
    read("shared/ui/ScreenWithBack.tsx"),
    /PageCanvas/,
  );
});

test("nav stacks use page canvas, not colors.bg", () => {
  for (const file of [
    "app/(auth)/_layout.tsx",
    "app/profile/_layout.tsx",
    "app/(tabs)/_layout.tsx",
  ]) {
    const src = read(file);
    assert.match(src, /usePageBackground|pageBackground/, file);
    assert.doesNotMatch(src, /theme\.colors\.bg/, file);
  }
});

test("screen page styles prefer layout.pageBackground on roots", () => {
  for (const file of [
    "shared/theme/myOrdersPageStyles.ts",
    "shared/theme/wishlistPageStyles.ts",
    "shared/theme/usersPageStyles.ts",
    "shared/theme/catalogProductStyles.ts",
  ]) {
    const src = read(file);
    assert.match(src, /layout\.pageBackground/, file);
  }
  assert.match(
    read("shared/theme/catalogProductStyles.ts"),
    /useCartScreenStyles[\s\S]*layout\.pageBackground/,
  );
});
