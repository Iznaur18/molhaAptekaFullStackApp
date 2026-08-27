import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("RuRegionPickerSheet: Squircle shadow outer has bounded height (sheetFill)", () => {
  const sheet = readMobileFile("entities/region/ui/RuRegionPickerSheet.tsx");
  const squircle = readMobileFile("shared/ui/SquircleView.tsx");
  const animation = readMobileFile("entities/region/model/useViewerRegionPickerSheetAnimation.ts");
  const timing = readMobileFile("entities/region/lib/viewerRegionPickerSheetAnimation.ts");

  assert.match(squircle, /if \(outerStyle != null \|\| shadowStyle != null\)/);
  assert.match(sheet, /sheetFill:/);
  assert.match(sheet, /outerStyle=\{styles\.sheetFill\}/);
  assert.match(sheet, /shadowStyle=\{styles\.sheetShadow\}/);
  assert.match(sheet, /zIndex:\s*1/);
  assert.match(sheet, /useViewerRegionPickerSheetAnimation/);
  assert.match(sheet, /useCssTransition \? View : Animated\.View/);
  assert.match(animation, /VIEWER_REGION_PICKER_SHEET_ANIMATION/);
  assert.match(animation, /scheduleOpenAfterPaint/);
  assert.match(animation, /transitionProperty: "transform"/);
  assert.match(timing, /enterMs: 300/);
  assert.match(timing, /exitMs: 240/);
  assert.match(timing, /enterEasingCss: "cubic-bezier\(0.215, 0.61, 0.355, 1\)"/);
});

test("viewer / form region selects open RuRegionPickerSheet", () => {
  const viewer = readMobileFile("entities/region/ui/ViewerRegionSelect.tsx");
  const form = readMobileFile("entities/region/ui/RuRegionSelect.tsx");
  const searchRow = readMobileFile("features/home-feed/ui/HomeCatalogSearchRow.tsx");
  const profile = readMobileFile("features/profile-edit/ui/EditProfileForm.tsx");

  assert.match(viewer, /RuRegionPickerSheet/);
  assert.match(viewer, /setOpen\(true\)/);
  assert.match(form, /RuRegionPickerSheet/);
  assert.match(form, /setOpen\(true\)/);
  assert.match(searchRow, /ViewerRegionSelect/);
  assert.match(profile, /LABEL_REGION/);
  assert.match(profile, /RuRegionSelect/);
});
