import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("ProfileMobileNavSheet respects top and bottom safe area", () => {
  const source = readMobileFile("features/profile-tab/ui/ProfileMobileNavSheet.tsx");

  assert.match(source, /useSafeAreaInsets/);
  assert.match(source, /paddingTop: insets\.top/);
  assert.match(source, /paddingBottom: Math\.max\(insets\.bottom, 16\)/);
});
