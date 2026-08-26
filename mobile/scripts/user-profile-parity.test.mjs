import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "../client/src");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const readClientFile = (relativePath) =>
  readFileSync(join(CLIENT_ROOT, relativePath), "utf8");

test("UserDetailsPage mirrors web modal section order", () => {
  const body = readMobileFile("features/user-details-page/ui/UserDetailsProfileBody.tsx");
  const jsx = body.slice(body.indexOf("return ("));

  const bannerIndex = jsx.indexOf("ProfileOverviewBanner");
  const purchasesIndex = jsx.indexOf("<UserProfilePurchasesList");
  const productsIndex = jsx.indexOf("<UserProfileProductsList");
  const infoIndex = jsx.indexOf("<UserProfileInfoPanel");

  assert.ok(bannerIndex >= 0);
  assert.ok(purchasesIndex >= 0);
  assert.ok(productsIndex >= 0);
  assert.ok(infoIndex >= 0);
  assert.ok(purchasesIndex > bannerIndex);
  assert.ok(productsIndex > purchasesIndex);
  assert.ok(infoIndex > productsIndex);
});

test("UserDetailsPage uses premium header and thumb lists", () => {
  const page = readMobileFile("features/user-details-page/ui/UserDetailsPage.tsx");
  const header = readMobileFile("features/user-details-page/ui/UserDetailsHeader.tsx");
  const hook = readMobileFile("features/user-details-page/model/useUserDetailsPage.ts");

  assert.match(page, /UserDetailsHeader/);
  assert.match(page, /UserDetailsProfileBody/);
  assert.match(page, /useUserDetailsPage/);
  assert.match(header, /UserPremiumDisplayName/);
  assert.match(header, /UserFollowButton/);
  assert.match(hook, /canViewOtherUserPurchases/);
  assert.match(hook, /showOtherUserPurchases/);
});

test("profile thumb lists match web purchases/products blocks", () => {
  const products = readMobileFile("entities/user/ui/UserProfileProductsList.tsx");
  const purchases = readMobileFile("entities/user/ui/UserProfilePurchasesList.tsx");
  const section = readMobileFile("entities/user/ui/UserProfileThumbSection.tsx");

  assert.match(products, /UserProfileThumbSection/);
  assert.match(products, /SHOW_MORE/);
  assert.match(purchases, /useUserPurchasesQuery/);
  assert.match(section, /useUserProfileThumbListStyles/);
});

test("ProfileOverviewBanner supports image focus like web", () => {
  const banner = readMobileFile("entities/user/ui/ProfileOverviewBanner.tsx");
  const focus = readMobileFile("entities/user/lib/profileImageFocus.ts");
  const avatar = readMobileFile("entities/user/ui/UserPremiumAvatar.tsx");
  const chrome = readMobileFile("shared/theme/profileChromeStyles.ts");
  const webModal = readClientFile("entities/user/ui/UserDetailsModal.css");
  const webPage = readClientFile("pages/my-profile/ui/MyProfilePage.css");

  assert.match(focus, /getUserAvatarFocus/);
  assert.match(focus, /getUserBackgroundFocus/);
  assert.match(banner, /UserPremiumAvatar/);
  assert.match(banner, /contentPosition/);
  assert.match(banner, /avatarWrapPremium/);
  assert.match(banner, /isPremium \? styles\.avatarWrapPremium/);
  assert.doesNotMatch(banner, /SquircleView/);
  assert.match(avatar, /contentPosition/);
  assert.match(chrome, /avatarWrapPremium:/);
  assert.match(chrome, /borderColor: theme\.colors\.premium/);
  assert.match(chrome, /PROFILE_BANNER_HEIGHT = PROFILE_AVATAR_SIZE \* 3/);
  assert.match(chrome, /PROFILE_BANNER_RADIUS = 24/);
  assert.match(chrome, /height: PROFILE_BANNER_HEIGHT/);
  assert.match(chrome, /borderRadius: PROFILE_BANNER_RADIUS/);
  assert.match(webModal, /--modal-profile-banner-radius:\s*24px/);
  assert.match(webModal, /--modal-profile-banner-height-mult:\s*3/);
  assert.match(webPage, /--modal-profile-banner-radius:\s*24px/);
});

test("user profile product thumb seeds catalog cache before product screen", () => {
  const products = readMobileFile("entities/user/ui/UserProfileProductsList.tsx");
  const seed = readMobileFile("entities/product/lib/seedCatalogProductQueryCache.ts");

  assert.match(products, /seedCatalogProductQueryCache/);
  assert.match(seed, /setQueryData/);
});

test("user profile info detail rows align label and value on one line", () => {
  const panel = readMobileFile("entities/user/ui/UserProfileInfoPanel.tsx");
  const detailRowBlock = panel.match(/detailRow:\s*\{([^}]*)\}/)?.[1] ?? "";
  const detailValueBlock = panel.match(/detailValue:\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(detailRowBlock, /flexDirection:\s*"row"/);
  assert.match(detailRowBlock, /justifyContent:\s*"space-between"/);
  assert.match(detailRowBlock, /flexWrap:\s*"nowrap"/);
  assert.match(detailValueBlock, /textAlign:\s*"right"/);
  assert.doesNotMatch(detailRowBlock, /flexDirection:\s*"column"/);
  assert.doesNotMatch(panel, /SquircleView/);
  assert.match(panel, /borderRadius: O\.infoSectionRadius/);
  assert.match(panel, /gap: O\.infoSectionsGap/);
});

test("subscriptions and seller name open user profile", () => {
  const subscriptions = readMobileFile("features/subscriptions-page/ui/SubscriptionsPage.tsx");
  const sellerRow = readMobileFile("entities/product/ui/ProductCardSellerRow.tsx");
  const sellerPage = readMobileFile("features/seller-products-page/ui/SellerProductsPage.tsx");

  assert.match(subscriptions, /SubscriptionUserRow/);
  assert.match(subscriptions, /\/user\/\[id\]/);
  assert.match(sellerRow, /\/user\/\[id\]/);
  assert.match(sellerPage, /UserPremiumDisplayName/);
});
