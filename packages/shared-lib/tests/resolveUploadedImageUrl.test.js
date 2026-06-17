import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeUploadUrlForStorage,
  resolveUploadedImageUrlForBrowser,
} from "@izibuy/shared-lib";

describe("resolveUploadedImageUrlForBrowser", () => {
  it("CDN URL не подменяется на origin SPA", () => {
    assert.equal(
      resolveUploadedImageUrlForBrowser(
        "https://cdn.izibuy.ru/uploads/photo.webp",
        "https://izibuy.ru",
      ),
      "https://cdn.izibuy.ru/uploads/photo.webp",
    );
  });

  it("same-origin absolute → path на origin", () => {
    assert.equal(
      resolveUploadedImageUrlForBrowser(
        "https://izibuy.ru/uploads/legacy.jpg",
        "https://izibuy.ru",
      ),
      "https://izibuy.ru/uploads/legacy.jpg",
    );
  });

  it("relative /uploads", () => {
    assert.equal(
      resolveUploadedImageUrlForBrowser("/uploads/x.png", "https://izibuy.ru"),
      "https://izibuy.ru/uploads/x.png",
    );
  });

  it("legacy dev LAN IP → текущий origin", () => {
    assert.equal(
      resolveUploadedImageUrlForBrowser(
        "http://192.168.1.222:5173/uploads/photo.jpeg",
        "http://127.0.0.1:5173",
      ),
      "http://127.0.0.1:5173/uploads/photo.jpeg",
    );
  });
});

describe("normalizeUploadUrlForStorage", () => {
  it("absolute LAN → relative path", () => {
    assert.equal(
      normalizeUploadUrlForStorage("http://192.168.1.222:5173/uploads/photo.jpeg"),
      "/uploads/photo.jpeg",
    );
  });

  it("relative path unchanged", () => {
    assert.equal(normalizeUploadUrlForStorage("/uploads/x.png"), "/uploads/x.png");
  });
});
