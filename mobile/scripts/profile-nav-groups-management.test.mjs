import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = join(MOBILE_ROOT, "..");
const SHARED_LIB_ROOT = join(REPO_ROOT, "packages/shared-lib");

const readRepoFile = (relativePath) =>
  readFileSync(join(REPO_ROOT, relativePath), "utf8");

test("profile nav: site-header-banner-admin only in management order", async () => {
  execSync("npm run build", { cwd: SHARED_LIB_ROOT, stdio: "pipe" });

  const { PROFILE_MANAGEMENT_SECTION_ORDER, PROFILE_STAFF_SECTION_ORDER } = await import(
    pathToFileURL(join(SHARED_LIB_ROOT, "dist/profileSections.js")).href
  );

  assert.equal(PROFILE_STAFF_SECTION_ORDER.includes("site-header-banner-admin"), false);
  assert.equal(
    PROFILE_MANAGEMENT_SECTION_ORDER.includes("site-header-banner-admin"),
    true,
  );
});

test("profile nav: seller personal category moderation merged into intro-ad", async () => {
  execSync("npm run build", { cwd: SHARED_LIB_ROOT, stdio: "pipe" });

  const { PROFILE_MANAGEMENT_SECTION_ORDER } = await import(
    pathToFileURL(join(SHARED_LIB_ROOT, "dist/profileSections.js")).href
  );

  assert.equal(
    PROFILE_MANAGEMENT_SECTION_ORDER.includes("seller-personal-category-moderation"),
    false,
  );
});

test("profile nav builders exclude management ids from staff group", () => {
  const mobileBuilder = readRepoFile(
    "mobile/features/profile-hub/model/buildProfileNavGroups.ts",
  );
  const webBuilder = readRepoFile("client/src/pages/my-profile/lib/buildProfileNavGroups.js");

  assert.match(mobileBuilder, /managementSectionIds/);
  assert.match(webBuilder, /managementSectionIds/);
  assert.match(
    readRepoFile("packages/shared-lib/src/profileSections.ts"),
    /PROFILE_MANAGEMENT_SECTION_ORDER[\s\S]*PROFILE_SECTION_SITE_HEADER_BANNER_ADMIN/,
  );
});
