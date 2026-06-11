import assert from "node:assert/strict";
import test from "node:test";

import { isAllowedUploadVideoFile } from "../utils/isAllowedUploadVideoFile.js";

test("isAllowedUploadVideoFile accepts HEVC and iOS octet-stream uploads", () => {
  assert.equal(
    isAllowedUploadVideoFile({
      originalname: "IMG_0001.MOV",
      mimetype: "application/octet-stream",
    }),
    true,
  );
  assert.equal(
    isAllowedUploadVideoFile({
      originalname: "clip.mp4",
      mimetype: 'video/mp4; codecs="hvc1"',
    }),
    true,
  );
});

test("isAllowedUploadVideoFile rejects unknown video containers", () => {
  assert.equal(
    isAllowedUploadVideoFile({
      originalname: "clip.avi",
      mimetype: "video/x-msvideo",
    }),
    false,
  );
});
