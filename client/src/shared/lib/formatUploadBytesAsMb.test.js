import { expect, test } from "vitest";

import { buildUploadVideoSizeError } from "./formatUploadBytesAsMb.js";

test("buildUploadVideoSizeError shows actual file size and limit", () => {
  expect(buildUploadVideoSizeError(11 * 1024 * 1024, 25 * 1024 * 1024)).toBe(
    "Файл 11,0 МБ — лимит 25,0 МБ",
  );
});
