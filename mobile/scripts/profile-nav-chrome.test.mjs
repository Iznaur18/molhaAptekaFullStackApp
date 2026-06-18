import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PROFILE_SECTION_OVERVIEW,
  resolveProfileNavSectionTone,
  resolveProfileNavTonePalette,
} from "../../packages/shared-lib/dist/index.js";

// Mirror of buildProfileNavItemPresentation.ts (keep in sync)
const buildProfileNavItemPresentation = (tone, { isActive, isCta }) => {
  const palette = resolveProfileNavTonePalette(tone);
  const highlighted = isActive || isCta;

  return {
    container: {
      borderLeftColor: isActive ? palette.main : "transparent",
      backgroundColor: highlighted ? palette.soft : "transparent",
    },
    iconWrap: highlighted
      ? { backgroundColor: palette.main }
      : { backgroundColor: palette.soft },
    iconColor: highlighted ? "#ffffff" : palette.main,
    label: {
      color: highlighted ? palette.strong : undefined,
      fontWeight: highlighted ? "700" : "600",
    },
  };
};

test("profile nav tones: overview is indigo", () => {
  assert.equal(resolveProfileNavSectionTone(PROFILE_SECTION_OVERVIEW), "indigo");
});

test("profile nav presentation: active overview uses indigo accent", () => {
  const tone = resolveProfileNavSectionTone(PROFILE_SECTION_OVERVIEW);
  const palette = resolveProfileNavTonePalette(tone);
  const presentation = buildProfileNavItemPresentation(tone, {
    isActive: true,
    isCta: false,
  });

  assert.equal(presentation.container.borderLeftColor, palette.main);
  assert.equal(presentation.iconWrap.backgroundColor, palette.main);
  assert.equal(presentation.iconColor, "#ffffff");
  assert.equal(presentation.label.color, palette.strong);
});

test("profile nav presentation: idle item keeps transparent container", () => {
  const tone = resolveProfileNavSectionTone(PROFILE_SECTION_OVERVIEW);
  const presentation = buildProfileNavItemPresentation(tone, {
    isActive: false,
    isCta: false,
  });

  assert.equal(presentation.container.backgroundColor, "transparent");
  assert.equal(presentation.container.borderLeftColor, "transparent");
});
