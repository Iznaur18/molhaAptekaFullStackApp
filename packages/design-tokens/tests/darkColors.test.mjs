import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DARK_THEME_HARD_BLUE_KEYS,
  izColors,
  izColorsDark,
} from "../src/colors.ts";
import {
  mirrorLightness,
  parseHexColor,
  rgbToHsl,
  setLightness,
} from "../src/invertColorLightness.ts";

const MIRRORED_NEUTRAL_KEYS = [
  "text",
  "textMuted",
  "textSecondary",
  "textPlaceholder",
  "ink",
  "bg",
  "border",
  "borderStrong",
];

test("mirrorLightness flips white to black and back", () => {
  assert.equal(mirrorLightness("#ffffff"), "#000000");
  assert.equal(mirrorLightness("#000000"), "#ffffff");
});

test("mirrorLightness keeps hue for tinted neutrals", () => {
  const light = rgbToHsl(parseHexColor("#e5eef2"));
  const dark = rgbToHsl(parseHexColor(mirrorLightness("#e5eef2")));
  assert.ok(Math.abs(light.h - dark.h) < 1);
  assert.ok(Math.abs(light.s - dark.s) < 0.02);
  assert.ok(Math.abs(light.l + dark.l - 1) < 0.02);
});

test("dark neutrals differ from light and match lightness mirror", () => {
  for (const key of MIRRORED_NEUTRAL_KEYS) {
    assert.notEqual(izColorsDark[key], izColors[key], key);
    assert.equal(izColorsDark[key], mirrorLightness(izColors[key]), key);
  }
});

test("dark surfaces stay lighter than bg after elevation fix", () => {
  const bgL = rgbToHsl(parseHexColor(izColorsDark.bg)).l;
  for (const key of ["surface", "surfaceMuted", "surfaceElevated"]) {
    assert.notEqual(izColorsDark[key], izColors[key], key);
    assert.ok(rgbToHsl(parseHexColor(izColorsDark[key])).l > bgL, key);
  }
});

test("hard blue tokens are identical in dark", () => {
  for (const key of DARK_THEME_HARD_BLUE_KEYS) {
    assert.equal(izColorsDark[key], izColors[key], key);
  }
  assert.equal(izColorsDark.onContrast, izColors.onContrast);
  assert.equal(izColorsDark.accent, izColors.accent);
});

test("soft blues keep hue but are darkened for dark surfaces", () => {
  const softKeys = ["actionSoft", "actionBorder", "infoSoft"];
  for (const key of softKeys) {
    const lightHsl = rgbToHsl(parseHexColor(izColors[key]));
    const darkHsl = rgbToHsl(parseHexColor(izColorsDark[key]));
    assert.notEqual(izColorsDark[key], izColors[key], key);
    assert.ok(Math.abs(lightHsl.h - darkHsl.h) < 2, key);
    assert.ok(darkHsl.l < 0.4, key);
  }
  assert.equal(izColorsDark.actionSoft, setLightness(izColors.actionSoft, 0.18));
  assert.equal(izColorsDark.actionBorder, setLightness(izColors.actionBorder, 0.32));
  assert.equal(izColorsDark.infoSoft, setLightness(izColors.infoSoft, 0.18));
});

test("status surfaces are mirrored; solids are brightened", () => {
  assert.equal(izColorsDark.successSurface, mirrorLightness(izColors.successSurface));
  assert.equal(izColorsDark.warningSurface, mirrorLightness(izColors.warningSurface));
  assert.equal(izColorsDark.dangerSurface, mirrorLightness(izColors.dangerSurface));
  assert.equal(izColorsDark.accentSoft, mirrorLightness(izColors.accentSoft));

  assert.ok(
    rgbToHsl(parseHexColor(izColorsDark.success)).l >
      rgbToHsl(parseHexColor(izColors.success)).l,
  );
  assert.ok(
    rgbToHsl(parseHexColor(izColorsDark.dangerText)).l >
      rgbToHsl(parseHexColor(izColors.dangerText)).l,
  );
});

test("focusRing keeps action blue channels", () => {
  assert.match(izColorsDark.focusRing, /^rgb\(31 111 235 \/ 22%\)$/);
});
