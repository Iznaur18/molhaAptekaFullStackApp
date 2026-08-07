import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isProfileStaffInAppSection,
  isProfileStaffWebOnlySection,
  PROFILE_MANAGEMENT_SECTION_ORDER,
  PROFILE_SECTION_CREATE_RAFFLE,
  PROFILE_SECTION_PRODUCT_MODERATION,
  PROFILE_SECTION_RAFFLES,
  PROFILE_SECTION_SELLER_PERSONAL_CATEGORY_MODERATION,
  PROFILE_SECTION_WEB_PATH,
  PROFILE_STAFF_IN_APP_SECTION_IDS,
  PROFILE_STAFF_SECTION_ORDER,
  PROFILE_STAFF_WEB_ONLY_SECTION_IDS,
} from "@izibuy/shared-lib";

const PROFILE_STAFF_AND_MANAGEMENT_SECTION_ORDER = [
  ...PROFILE_STAFF_SECTION_ORDER,
  ...PROFILE_MANAGEMENT_SECTION_ORDER,
];

test("profile staff: in-app staff/management sections open in-app on mobile", () => {
  for (const sectionId of PROFILE_STAFF_AND_MANAGEMENT_SECTION_ORDER) {
    assert.ok(
      isProfileStaffInAppSection(sectionId),
      `${sectionId} must be in PROFILE_STAFF_IN_APP_SECTION_IDS`,
    );
    assert.equal(
      isProfileStaffWebOnlySection(sectionId),
      false,
      `${sectionId} must not redirect to web`,
    );
  }

  assert.equal(
    PROFILE_STAFF_IN_APP_SECTION_IDS.length,
    PROFILE_STAFF_AND_MANAGEMENT_SECTION_ORDER.length,
  );
});

test("profile staff web paths: web-only staff sections have SPA path", () => {
  // G.1: staff sections without an in-app screen fall back to the web SPA.
  // Web-only = entries in PROFILE_SECTION_WEB_PATH that are not in the in-app order.
  const inAppIds = new Set(PROFILE_STAFF_AND_MANAGEMENT_SECTION_ORDER);
  const expectedWebOnly = Object.keys(PROFILE_SECTION_WEB_PATH).filter(
    (sectionId) => !inAppIds.has(sectionId),
  );

  // Locks the intended web-only inventory: catches a section accidentally
  // dropped from (or added to) the in-app order arrays.
  assert.deepEqual(
    [...PROFILE_STAFF_WEB_ONLY_SECTION_IDS].sort(),
    [
      PROFILE_SECTION_RAFFLES,
      PROFILE_SECTION_SELLER_PERSONAL_CATEGORY_MODERATION,
    ].sort(),
  );
  assert.deepEqual(
    [...PROFILE_STAFF_WEB_ONLY_SECTION_IDS].sort(),
    [...expectedWebOnly].sort(),
  );

  for (const sectionId of PROFILE_STAFF_WEB_ONLY_SECTION_IDS) {
    assert.ok(
      sectionId in PROFILE_SECTION_WEB_PATH,
      `missing PROFILE_SECTION_WEB_PATH for: ${sectionId}`,
    );
    assert.equal(isProfileStaffInAppSection(sectionId), false);
    assert.equal(isProfileStaffWebOnlySection(sectionId), true);
  }
});

test("profile staff web paths: product-moderation stays in-app", () => {
  assert.ok(isProfileStaffInAppSection(PROFILE_SECTION_PRODUCT_MODERATION));
  assert.equal(isProfileStaffWebOnlySection(PROFILE_SECTION_PRODUCT_MODERATION), false);
});

test("profile staff web paths: create-raffle opens via hub, not staff nav", () => {
  assert.equal(
    PROFILE_STAFF_SECTION_ORDER.includes(PROFILE_SECTION_CREATE_RAFFLE),
    false,
  );
  assert.equal(isProfileStaffWebOnlySection(PROFILE_SECTION_CREATE_RAFFLE), false);
});

test("profile staff web paths: paths are absolute SPA routes", () => {
  for (const path of Object.values(PROFILE_SECTION_WEB_PATH)) {
    assert.match(path, /^\//, `expected absolute path, got ${path}`);
  }
});
