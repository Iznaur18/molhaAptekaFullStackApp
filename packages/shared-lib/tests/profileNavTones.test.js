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

test("profile nav tones: dark soft is not near-white", () => {
  const darkBlue = resolveProfileNavTonePalette("blue", "dark");
  assert.equal(darkBlue.soft, "#405577");
  assert.equal(darkBlue.main, "#8589AC");
});

test("profile nav tones: dark purple CTA soft is structural deep", () => {
  const darkPurple = resolveProfileNavTonePalette("purple", "dark");
  assert.equal(darkPurple.soft, "#405577");
});

test("profile nav tones: moderation uses amber", () => {
  assert.equal(resolveProfileNavSectionTone(PROFILE_SECTION_PRODUCT_MODERATION), "amber");
});
