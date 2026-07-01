import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("product reports page mirrors web sections toolbar and hub chrome", () => {
  const page = readMobileFile("features/product-reports-page/ui/ProductReportsPage.tsx");
  const toolbar = readMobileFile("features/product-reports-page/ui/ProductReportsToolbar.tsx");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /ProductReportsToolbar/);
  assert.match(page, /ProductReportGroupCard/);
  assert.match(page, /UserStoryReportGroupCard/);
  assert.match(page, /SECTION_PRODUCTS/);
  assert.match(page, /SECTION_STORIES/);
  assert.match(page, /activeSectionId="product-reports"/);
  assert.match(page, /TAB_PRODUCT_REPORTS/);
  assert.doesNotMatch(page, /StaffModerationActions/);
  assert.doesNotMatch(page, /staffQueueStyles/);

  assert.match(toolbar, /SECTION_FILTER_ALL/);
});

test("product report group card mirrors web actions", () => {
  const card = readMobileFile("entities/product-report/ui/ProductReportGroupCard.tsx");

  assert.match(card, /OPEN_SELLER/);
  assert.match(card, /OPEN_REPORTER/);
  assert.match(card, /STAFF_NOTE_LABEL/);
  assert.match(card, /ACTION_REJECT/);
});

test("user story report group card mirrors web actions", () => {
  const card = readMobileFile("entities/user-story/ui/UserStoryReportGroupCard.tsx");

  assert.match(card, /STORY_REPORTS_STAFF_NOTE_LABEL/);
  assert.match(card, /OPEN_REPORTER/);
  assert.match(card, /STORY_REPORTS_ACTION_HIDE/);
});

test("product reports ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /REPORT_ITEM_META:/);
  assert.match(copy, /OPEN_SELLER: "Продавец"/);
  assert.match(copy, /OPEN_REPORTER: "Жалобщик"/);
});
