import assert from "node:assert/strict";
import test from "node:test";

import { resolveUploadContentType } from "../services/upload/resolveUploadContentType.js";
import { resolveUploadFileExtension } from "../services/upload/resolveUploadFileExtension.js";

test("resolveUploadFileExtension maps iPhone quicktime to mov", () => {
  assert.equal(
    resolveUploadFileExtension({
      originalname: "IMG_0001.MOV",
      mimetype: "video/quicktime",
    }),
    "mov",
  );
  assert.equal(
    resolveUploadFileExtension({
      originalname: "clip.bin",
      mimetype: "video/quicktime",
    }),
    "mov",
  );
});

test("resolveUploadContentType fixes legacy quicktime extension", () => {
  assert.equal(
    resolveUploadContentType("1730000000-abc.quicktime"),
    "video/quicktime",
  );
  assert.equal(
    resolveUploadContentType("1730000000-abc.mov"),
    "video/quicktime",
  );
  assert.equal(
    resolveUploadContentType(
      "1730000000-abc.mov",
      "application/octet-stream",
    ),
    "video/quicktime",
  );
});
