import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("horizontal overflow row avoids RN Web scroll stretch", () => {
  const row = readFile("shared/ui/HorizontalOverflowRow.tsx");
  const profileSection = readFile("entities/user/ui/UserProfileThumbSection.tsx");
  const gallery = readFile("entities/product/ui/ProductMediaGallery.tsx");

  assert.match(row, /flexGrow: 0/);
  assert.match(row, /flexShrink: 0/);
  assert.match(row, /overflowY: "hidden"/);
  assert.match(row, /isReactNativeWeb/);
  assert.match(row, /domTrackBaseStyle/);
  assert.doesNotMatch(row, /FlatList/);
  assert.match(profileSection, /HorizontalOverflowRow/);
  assert.match(profileSection, /USER_PROFILE_THUMB_TRACK_HEIGHT/);
  assert.match(gallery, /HorizontalOverflowRow/);
  assert.match(gallery, /height=\{GRL\.thumbSize\}/);
  assert.doesNotMatch(profileSection, /<ScrollView[\s\S]*horizontal/);
});
