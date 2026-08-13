import assert from "node:assert/strict";
import test from "node:test";

import {
  STORY_UPLOAD_VIDEO_MAX_BYTES,
  STORY_UPLOAD_VIDEO_MAX_MB,
  UPLOAD_IMAGE_COMPRESS_MAX_DIMENSION,
  UPLOAD_IMAGE_COMPRESS_TARGET_BYTES,
  UPLOAD_IMAGE_MAX_BYTES,
  UPLOAD_IMAGE_MIME_TYPES,
  UPLOAD_IMAGE_SOURCE_MAX_BYTES,
  UPLOAD_IMAGE_SOURCE_MAX_MB,
  UPLOAD_VIDEO_EXTENSIONS,
  UPLOAD_VIDEO_MAX_BYTES,
  UPLOAD_VIDEO_MAX_MB,
  UPLOAD_VIDEO_MIME_TYPES,
} from "../src/uploadLimits.js";

test("image upload limits are stable", () => {
  assert.equal(UPLOAD_IMAGE_MAX_BYTES, 5 * 1024 * 1024);
  assert.deepEqual(UPLOAD_IMAGE_MIME_TYPES, [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ]);
});

test("image client compression limits are stable", () => {
  assert.equal(UPLOAD_IMAGE_SOURCE_MAX_MB, 50);
  assert.equal(UPLOAD_IMAGE_SOURCE_MAX_BYTES, 50 * 1024 * 1024);
  // Целевой размер после сжатия обязан влезать в серверный лимит multer.
  assert.ok(UPLOAD_IMAGE_COMPRESS_TARGET_BYTES < UPLOAD_IMAGE_MAX_BYTES);
  assert.equal(UPLOAD_IMAGE_COMPRESS_TARGET_BYTES, 2 * 1024 * 1024);
  assert.equal(UPLOAD_IMAGE_COMPRESS_MAX_DIMENSION, 2560);
});

test("video upload limits are stable", () => {
  assert.equal(UPLOAD_VIDEO_MAX_MB, 5);
  assert.equal(UPLOAD_VIDEO_MAX_BYTES, 5 * 1024 * 1024);
  assert.equal(STORY_UPLOAD_VIDEO_MAX_MB, 100);
  assert.equal(STORY_UPLOAD_VIDEO_MAX_BYTES, 100 * 1024 * 1024);
  assert.deepEqual(UPLOAD_VIDEO_MIME_TYPES, [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/hevc",
    "video/h265",
    "video/x-hevc",
    "video/x-m4v",
  ]);
  assert.deepEqual(UPLOAD_VIDEO_EXTENSIONS, [".mp4", ".webm", ".mov", ".m4v"]);
});
