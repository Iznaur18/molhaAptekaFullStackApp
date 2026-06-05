import assert from "node:assert/strict";
import test from "node:test";

import { resolveUploadedImageUrlForBrowser } from "../../client/src/shared/lib/resolveUploadedImageUrl.js";

test("resolveUploadedImageUrlForBrowser: CDN URL не подменяется на origin SPA", () => {
  assert.equal(
    resolveUploadedImageUrlForBrowser(
      "https://cdn.izibuy.ru/uploads/photo.webp",
      "https://izibuy.ru",
    ),
    "https://cdn.izibuy.ru/uploads/photo.webp",
  );
});

test("resolveUploadedImageUrlForBrowser: same-origin absolute → path на origin", () => {
  assert.equal(
    resolveUploadedImageUrlForBrowser(
      "https://izibuy.ru/uploads/legacy.jpg",
      "https://izibuy.ru",
    ),
    "https://izibuy.ru/uploads/legacy.jpg",
  );
});

test("resolveUploadedImageUrlForBrowser: relative /uploads", () => {
  assert.equal(
    resolveUploadedImageUrlForBrowser("/uploads/x.png", "https://izibuy.ru"),
    "https://izibuy.ru/uploads/x.png",
  );
});
