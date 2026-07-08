import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PROFILE_SECTION_OVERVIEW,
  PROFILE_SECTION_PRODUCT_MODERATION,
  resolveProfileNavSectionTone,
  resolveProfileNavTonePalette,
} from "@izibuy/shared-lib";

test("profile nav tones: overview uses blue", () => {
  assert.equal(resolveProfileNavSectionTone(PROFILE_SECTION_OVERVIEW), "blue");
  assert.deepEqual(resolveProfileNavTonePalette("blue"), {
    main: "#2563eb",
    soft: "#eff6ff",
    strong: "#1557b3",
  });
});

test("profile nav tones: moderation uses amber", () => {
  assert.equal(resolveProfileNavSectionTone(PROFILE_SECTION_PRODUCT_MODERATION), "amber");
});
