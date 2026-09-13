import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  UPLOAD_IMAGE_THUMBNAIL_MAX_DIM,
  buildUploadImageThumbnailFilename,
  isUploadImageThumbnailFilename,
  toUploadImageThumbnailUrl,
} from "@izibuy/shared-lib";

describe("buildUploadImageThumbnailFilename", () => {
  it("растровые форматы → <имя>-w600.webp", () => {
    assert.equal(UPLOAD_IMAGE_THUMBNAIL_MAX_DIM, 600);
    assert.equal(
      buildUploadImageThumbnailFilename("1789204265477-2308fa51.webp"),
      "1789204265477-2308fa51-w600.webp",
    );
    assert.equal(buildUploadImageThumbnailFilename("photo.JPG"), "photo-w600.webp");
    assert.equal(buildUploadImageThumbnailFilename("photo.jpeg"), "photo-w600.webp");
    assert.equal(buildUploadImageThumbnailFilename("photo.png"), "photo-w600.webp");
  });

  it("не картинка, небезопасное имя и уже превью → null", () => {
    assert.equal(buildUploadImageThumbnailFilename("clip.mp4"), null);
    assert.equal(buildUploadImageThumbnailFilename("anim.gif"), null);
    assert.equal(buildUploadImageThumbnailFilename("../etc.webp"), null);
    assert.equal(buildUploadImageThumbnailFilename("a/b.webp"), null);
    assert.equal(buildUploadImageThumbnailFilename(""), null);
    assert.equal(buildUploadImageThumbnailFilename("photo-w600.webp"), null);
  });

  it("isUploadImageThumbnailFilename узнаёт превью", () => {
    assert.equal(isUploadImageThumbnailFilename("photo-w600.webp"), true);
    assert.equal(isUploadImageThumbnailFilename("photo.webp"), false);
  });
});

describe("toUploadImageThumbnailUrl", () => {
  it("относительный, same-origin и CDN URL переписываются, query сохраняется", () => {
    assert.equal(toUploadImageThumbnailUrl("/uploads/a.webp"), "/uploads/a-w600.webp");
    assert.equal(
      toUploadImageThumbnailUrl("https://gitorg.ru/uploads/a.jpg"),
      "https://gitorg.ru/uploads/a-w600.webp",
    );
    assert.equal(
      toUploadImageThumbnailUrl("https://cdn.gitorg.ru/uploads/a.png?v=2#x"),
      "https://cdn.gitorg.ru/uploads/a-w600.webp?v=2#x",
    );
  });

  it("приватные, внешние, data: и уже превью не трогаются", () => {
    assert.equal(
      toUploadImageThumbnailUrl("/uploads/private/selfie.webp"),
      "/uploads/private/selfie.webp",
    );
    assert.equal(
      toUploadImageThumbnailUrl("https://i.pinimg.com/originals/c9/x.jpg"),
      "https://i.pinimg.com/originals/c9/x.jpg",
    );
    assert.equal(
      toUploadImageThumbnailUrl("data:image/svg+xml;utf8,<svg/>"),
      "data:image/svg+xml;utf8,<svg/>",
    );
    assert.equal(
      toUploadImageThumbnailUrl("/uploads/a-w600.webp"),
      "/uploads/a-w600.webp",
    );
    assert.equal(toUploadImageThumbnailUrl("/uploads/clip.mp4"), "/uploads/clip.mp4");
  });
});
