import assert from "node:assert/strict";
import test from "node:test";

import { buildUploadVideoSizeError } from "./formatUploadBytesAsMb.js";

test("buildUploadVideoSizeError shows actual file size and limit", () => {
  assert.equal(
    buildUploadVideoSizeError(11 * 1024 * 1024, 25 * 1024 * 1024),
    "Файл 11,0 МБ — лимит 25,0 МБ",
  );
});
