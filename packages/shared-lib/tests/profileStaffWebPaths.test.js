import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isProfileStaffInAppSection,
  isProfileStaffWebOnlySection,
  PROFILE_MANAGEMENT_SECTION_ORDER,
  PROFILE_SECTION_CREATE_RAFFLE,
  PROFILE_SECTION_PRODUCT_MODERATION,
  PROFILE_SECTION_WEB_PATH,
  PROFILE_STAFF_IN_APP_SECTION_IDS,
  PROFILE_STAFF_SECTION_ORDER,
  PROFILE_STAFF_WEB_ONLY_SECTION_IDS,
} from "@izibuy/shared-lib";

const PROFILE_STAFF_AND_MANAGEMENT_SECTION_ORDER = [
  ...PROFILE_STAFF_SECTION_ORDER,
  ...PROFILE_MANAGEMENT_SECTION_ORDER,
];

test("profile staff: all staff sections open in-app on mobile", () => {
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
  assert.deepEqual(PROFILE_STAFF_WEB_ONLY_SECTION_IDS, []);
});

test("profile staff web paths: web-only staff sections have SPA path", () => {
  const expectedWebOnly = PROFILE_STAFF_AND_MANAGEMENT_SECTION_ORDER.filter(
    (sectionId) => !PROFILE_STAFF_IN_APP_SECTION_IDS.includes(sectionId),
  );
  const missing = expectedWebOnly.filter(
    (sectionId) => !(sectionId in PROFILE_SECTION_WEB_PATH),
  );

  assert.deepEqual(
    missing,
    [],
    `missing PROFILE_SECTION_WEB_PATH for: ${missing.join(", ")}`,
  );
  assert.equal(
    PROFILE_STAFF_WEB_ONLY_SECTION_IDS.length,
    expectedWebOnly.length,
  );
});

test("profile staff web paths: product-moderation stays in-app", () => {
  assert.ok(isProfileStaffInAppSection(PROFILE_SECTION_PRODUCT_MODERATION));
  assert.equal(isProfileStaffWebOnlySection(PROFILE_SECTION_PRODUCT_MODERATION), false);
});

test("profile staff web paths: create-raffle stays in-app on mobile", () => {
  assert.ok(PROFILE_STAFF_IN_APP_SECTION_IDS.includes(PROFILE_SECTION_CREATE_RAFFLE));
  assert.equal(isProfileStaffWebOnlySection(PROFILE_SECTION_CREATE_RAFFLE), false);
});

test("profile staff web paths: paths are absolute SPA routes", () => {
  for (const path of Object.values(PROFILE_SECTION_WEB_PATH)) {
    assert.match(path, /^\//, `expected absolute path, got ${path}`);
  }
});
