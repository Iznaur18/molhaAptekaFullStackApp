import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PROFILE_SECTION_OVERVIEW,
  PROFILE_SECTION_PRODUCT_MODERATION,
  resolveProfileNavSectionTone,
  resolveProfileNavTonePalette,
} from "@izibuy/shared-lib";

test("profile nav tones: overview uses indigo", () => {
  assert.equal(resolveProfileNavSectionTone(PROFILE_SECTION_OVERVIEW), "indigo");
  assert.deepEqual(resolveProfileNavTonePalette("indigo"), {
    main: "#4f46e5",
    soft: "#eef2ff",
    strong: "#4338ca",
  });
});

test("profile nav tones: moderation uses orange", () => {
  assert.equal(resolveProfileNavSectionTone(PROFILE_SECTION_PRODUCT_MODERATION), "orange");
});
