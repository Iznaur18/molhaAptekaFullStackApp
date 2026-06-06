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

test("resolveUploadedImageUrlForBrowser: legacy dev LAN IP → текущий origin", () => {
  assert.equal(
    resolveUploadedImageUrlForBrowser(
      "http://192.168.1.222:5173/uploads/photo.jpeg",
      "http://127.0.0.1:5173",
    ),
    "http://127.0.0.1:5173/uploads/photo.jpeg",
  );
});
