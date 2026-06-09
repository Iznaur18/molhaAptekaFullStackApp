import assert from "node:assert/strict";
import test from "node:test";

import { isStoredBackgroundImageUrl } from "../utils/isStoredBackgroundImageUrl.js";
import { normalizeUserBackgroundForSave } from "../utils/userBackgroundValue.js";

test("isStoredBackgroundImageUrl accepts /uploads path", () => {
  assert.equal(isStoredBackgroundImageUrl("/uploads/bg.webp"), true);
});

test("normalizeUserBackgroundForSave stores relative upload path", () => {
  assert.equal(
    normalizeUserBackgroundForSave("/uploads/bg.webp", {
      isPremiumUser: true,
      isAdminEditor: false,
    }),
    "/uploads/bg.webp",
  );
});
