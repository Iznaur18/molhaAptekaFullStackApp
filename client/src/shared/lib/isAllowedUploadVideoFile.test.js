import { expect, test } from "vitest";

import {
  isAllowedUploadVideoFile,
  normalizeUploadVideoMime,
} from "./isAllowedUploadVideoFile.js";

test("normalizeUploadVideoMime strips codec parameters", () => {
  expect(normalizeUploadVideoMime('video/mp4; codecs="hvc1"')).toBe("video/mp4");
});

test("isAllowedUploadVideoFile accepts iPhone quicktime and mov extension", () => {
  expect(
    isAllowedUploadVideoFile({
      name: "IMG_1234.MOV",
      type: "video/quicktime",
    }),
  ).toBe(true);
  expect(
    isAllowedUploadVideoFile({
      name: "clip.mov",
      type: "",
    }),
  ).toBe(true);
});

test("isAllowedUploadVideoFile accepts HEVC mime and iOS octet-stream", () => {
  expect(
    isAllowedUploadVideoFile({
      name: "video.mp4",
      type: "video/hevc",
    }),
  ).toBe(true);
  expect(
    isAllowedUploadVideoFile({
      name: "IMG_0001.MOV",
      type: "application/octet-stream",
    }),
  ).toBe(true);
  expect(
    isAllowedUploadVideoFile({
      name: "clip.mp4",
      type: 'video/mp4; codecs="hvc1,mp4a.40.2"',
    }),
  ).toBe(true);
});

test("isAllowedUploadVideoFile rejects unsupported formats", () => {
  expect(
    isAllowedUploadVideoFile({
      name: "video.avi",
      type: "video/x-msvideo",
    }),
  ).toBe(false);
  expect(
    isAllowedUploadVideoFile({
      name: "blob",
      type: "application/octet-stream",
    }),
  ).toBe(false);
});
