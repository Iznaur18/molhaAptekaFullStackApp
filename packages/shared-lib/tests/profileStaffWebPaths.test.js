import assert from "node:assert/strict";
import { test } from "node:test";

import { PROFILE_STAFF_SECTION_ORDER } from "../src/profileSections.ts";
import {
  PROFILE_SECTION_WEB_PATH,
  PROFILE_STAFF_WEB_ONLY_SECTION_IDS,
} from "../src/profileStaffWebPaths.ts";

test("profile staff web paths: every staff hub section has web path", () => {
  const missing = PROFILE_STAFF_SECTION_ORDER.filter(
    (sectionId) => !(sectionId in PROFILE_SECTION_WEB_PATH),
  );

  assert.deepEqual(
    missing,
    [],
    `missing PROFILE_SECTION_WEB_PATH for: ${missing.join(", ")}`,
  );
  assert.equal(
    PROFILE_STAFF_WEB_ONLY_SECTION_IDS.length,
    PROFILE_STAFF_SECTION_ORDER.length,
  );
});

test("profile staff web paths: paths are absolute SPA routes", () => {
  for (const path of Object.values(PROFILE_SECTION_WEB_PATH)) {
    assert.match(path, /^\//, `expected absolute path, got ${path}`);
  }
});
