import assert from "node:assert/strict";
import { test } from "node:test";

import { buildPrivateUploadApiUrl } from "../services/upload/privateUploadPaths.js";
import { parsePrivateUploadFilenameFromUrl } from "../services/upload/privateUploadPaths.js";

test("private selfie URL round-trip for ACL lookup", () => {
  const filename = "1710000000-abc1234.webp";
  const url = buildPrivateUploadApiUrl(filename);
  assert.equal(url, "/upload/private/1710000000-abc1234.webp");
  assert.equal(parsePrivateUploadFilenameFromUrl(url), filename);
});
