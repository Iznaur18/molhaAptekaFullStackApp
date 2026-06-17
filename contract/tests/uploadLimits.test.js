import assert from "node:assert/strict";
import test from "node:test";

import {
  UPLOAD_IMAGE_MAX_BYTES,
  UPLOAD_IMAGE_MIME_TYPES,
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

test("video upload limits are stable", () => {
  assert.equal(UPLOAD_VIDEO_MAX_MB, 25);
  assert.equal(UPLOAD_VIDEO_MAX_BYTES, 25 * 1024 * 1024);
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
