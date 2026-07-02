import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const mobileIntroPage = read("mobile/features/intro-ad-moderation-page/ui/IntroAdModerationPage.tsx");
const webIntroPage = read("client/src/pages/intro-ad-moderation/ui/IntroAdModerationPage.jsx");
const mobileNav = read("mobile/features/profile-hub/model/buildProfileNavGroups.ts");
const webNav = read("client/src/pages/my-profile/lib/buildProfileNavGroups.js");
const sharedSections = read("packages/shared-lib/src/profileSections.ts");

assert.match(mobileIntroPage, /SellerPersonalCategoryCampaignModerationSection/);
assert.match(mobileIntroPage, /ModerationSectionTitle/);
assert.match(webIntroPage, /SellerPersonalCategoryCampaignModerationSection/);
assert.match(webIntroPage, /ModerationSectionTitle/);
assert.doesNotMatch(mobileNav, /seller-personal-category-moderation/);
assert.doesNotMatch(webNav, /seller-personal-category-moderation/);
assert.doesNotMatch(sharedSections, /PROFILE_SECTION_SELLER_PERSONAL_CATEGORY_MODERATION,\s*\]/);

console.log("intro-ad-moderation-merge.test.mjs: ok");
