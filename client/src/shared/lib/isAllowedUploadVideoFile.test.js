import assert from "node:assert/strict";
import test from "node:test";

import {
  isAllowedUploadVideoFile,
  normalizeUploadVideoMime,
} from "./isAllowedUploadVideoFile.js";

test("normalizeUploadVideoMime strips codec parameters", () => {
  assert.equal(
    normalizeUploadVideoMime('video/mp4; codecs="hvc1"'),
    "video/mp4",
  );
});

test("isAllowedUploadVideoFile accepts iPhone quicktime and mov extension", () => {
  assert.equal(
    isAllowedUploadVideoFile({
      name: "IMG_1234.MOV",
      type: "video/quicktime",
    }),
    true,
  );
  assert.equal(
    isAllowedUploadVideoFile({
      name: "clip.mov",
      type: "",
    }),
    true,
  );
});

test("isAllowedUploadVideoFile accepts HEVC mime and iOS octet-stream", () => {
  assert.equal(
    isAllowedUploadVideoFile({
      name: "video.mp4",
      type: "video/hevc",
    }),
    true,
  );
  assert.equal(
    isAllowedUploadVideoFile({
      name: "IMG_0001.MOV",
      type: "application/octet-stream",
    }),
    true,
  );
  assert.equal(
    isAllowedUploadVideoFile({
      name: "clip.mp4",
      type: 'video/mp4; codecs="hvc1,mp4a.40.2"',
    }),
    true,
  );
});

test("isAllowedUploadVideoFile rejects unsupported formats", () => {
  assert.equal(
    isAllowedUploadVideoFile({
      name: "video.avi",
      type: "video/x-msvideo",
    }),
    false,
  );
  assert.equal(
    isAllowedUploadVideoFile({
      name: "blob",
      type: "application/octet-stream",
    }),
    false,
  );
});
