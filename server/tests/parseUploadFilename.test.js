import assert from "node:assert/strict";
import test from "node:test";

import { parseUploadFilenameFromMediaUrl } from "../services/upload/parseUploadFilenameFromMediaUrl.js";

test("parseUploadFilenameFromMediaUrl: CDN and relative", () => {
  assert.equal(
    parseUploadFilenameFromMediaUrl("https://cdn.example.com/uploads/a.webp"),
    "a.webp",
  );
  assert.equal(parseUploadFilenameFromMediaUrl("/uploads/b.jpg"), "b.jpg");
  assert.equal(parseUploadFilenameFromMediaUrl(""), null);
});
