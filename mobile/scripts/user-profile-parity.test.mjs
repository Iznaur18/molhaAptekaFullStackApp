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
  const body = readMobileFile(
    "features/user-details-page/ui/UserDetailsProfileBody.tsx",
  );
  const jsx = body.slice(body.indexOf("return ("));

  const bannerIndex = jsx.indexOf("ProfileOverviewBanner");
  const storefrontIndex = jsx.indexOf("USER_DETAILS_PAGE_UI.SELLER_STOREFRONT");
  const purchasesIndex = jsx.indexOf("<UserProfilePurchasesList");
  const productsIndex = jsx.indexOf("<UserProfileProductsList");
  const infoIndex = jsx.indexOf("<UserProfileInfoPanel");

  assert.ok(bannerIndex >= 0);
  assert.ok(storefrontIndex >= 0);
  assert.ok(purchasesIndex >= 0);
  assert.ok(productsIndex >= 0);
  assert.ok(infoIndex >= 0);
  assert.ok(storefrontIndex > bannerIndex);
  assert.ok(purchasesIndex > storefrontIndex);
  assert.ok(productsIndex > purchasesIndex);
  assert.ok(infoIndex > productsIndex);
  assert.doesNotMatch(jsx, /onViewAllProducts=/);
});

test("user profile detail rows include userFullName icon like web", () => {
  const mobileIcons = readMobileFile("entities/user/lib/profileRowIcons.ts");
  const webIcons = readClientFile("entities/user/lib/profileRowIcons.js");

  assert.match(mobileIcons, /userFullName:\s*"check-circle"/);
  assert.match(webIcons, /userFullName:\s*BadgeCheck/);
});

test("UserDetailsPage uses premium header and thumb lists", () => {
  const page = readMobileFile("features/user-details-page/ui/UserDetailsPage.tsx");
  const header = readMobileFile("features/user-details-page/ui/UserDetailsHeader.tsx");
  const hook = readMobileFile("features/user-details-page/model/useUserDetailsPage.ts");
  const chrome = readMobileFile("shared/theme/profileChromeStyles.ts");
  const voteStyles = readMobileFile("shared/theme/accountFeatureStyles.ts");
  const overlay = readMobileFile("shared/ui/MobileBottomNavOverlay.tsx");
  const webPageCss = readClientFile("pages/user-details/ui/UserDetailsPage.css");
  const webShell = readClientFile("app/ui/AppShellHeader.jsx");

  assert.match(page, /UserDetailsHeader/);
  assert.match(page, /UserDetailsProfileBody/);
  assert.match(page, /useUserDetailsPage/);
  assert.match(page, /MobileBottomNavOverlay/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(header, /UserPremiumDisplayName/);
  assert.match(header, /UserFollowButton/);
  assert.match(hook, /canViewOtherUserPurchases/);
  assert.match(hook, /showOtherUserPurchases/);
  assert.match(chrome, /USER_DETAILS_SCREEN_GAP/);
  assert.match(chrome, /gap: USER_DETAILS_SCREEN_GAP/);
  assert.match(chrome, /rootProfileRadius:[\s\S]*marginBottom: 0/);
  assert.match(voteStyles, /useUserVoteRatingStyles[\s\S]*marginTop: 0/);
  assert.match(overlay, /router\.navigate/);
  assert.match(overlay, /\/\(tabs\)/);
  assert.match(webPageCss, /--user-details-screen-gap:\s*6px/);
  assert.match(webPageCss, /\.user-profile-purchases-section\s*\{\s*margin-bottom:\s*0/);
  assert.match(webShell, /MobileBottomNav/);
});

test("profile thumb lists match web purchases/products blocks", () => {
  const products = readMobileFile("entities/user/ui/UserProfileProductsList.tsx");
  const purchases = readMobileFile("entities/user/ui/UserProfilePurchasesList.tsx");
  const section = readMobileFile("entities/user/ui/UserProfileThumbSection.tsx");
  const chrome = readMobileFile("shared/theme/profileChromeStyles.ts");
  const webPurchasesCss = readClientFile("entities/user/ui/UserProfilePurchasesList.css");
  const followStyles = readMobileFile("shared/theme/accountFeatureStyles.ts");
  const webFollowCss = readClientFile("entities/user-follow/ui/UserFollowButton.css");

  assert.match(products, /UserProfileThumbSection/);
  assert.match(products, /useUserProfileProductsQuery/);
  assert.match(products, /enabled: true/);
  assert.match(products, /profile-scroll/);
  assert.doesNotMatch(products, /SHOW_MORE/);
  assert.match(section, /HorizontalOverflowRow/);
  assert.match(section, /CachedProductImage/);
  assert.match(section, /TouchableOpacity/);
  assert.match(section, /isReactNativeWeb/);
  assert.match(section, /profile-scroll/);
  assert.match(section, /styles\.rootProfileRadius/);
  assert.doesNotMatch(
    section.slice(section.lastIndexOf("if (isHorizontalChrome)")),
    /SquircleView/,
  );
  assert.match(chrome, /USER_PROFILE_THUMB_TRACK_HEIGHT/);
  assert.match(chrome, /USER_PROFILE_PURCHASES_TRACK_HEIGHT/);
  assert.match(chrome, /rootProfileRadius:/);
  assert.match(chrome, /borderRadius: PROFILE_CARD_SQUIRCLE_RADIUS/);
  assert.match(chrome, /scrollRowContentProfile:/);
  assert.match(chrome, /scrollRowInnerProfile:/);
  assert.match(chrome, /paddingVertical: UPP\.bodyPaddingY/);
  assert.match(chrome, /bodyProfileScrollRow:[\s\S]*paddingHorizontal: 0/);
  assert.match(chrome, /thumbClipProfile:/);
  assert.match(chrome, /borderRadius: UPP\.thumbRadius/);
  assert.match(section, /USER_PROFILE_PURCHASES_TRACK_HEIGHT/);
  assert.match(section, /scrollRowContentProfile/);
  assert.match(section, /scrollRowInnerProfile/);
  assert.match(section, /chrome=\{isProfileScroll \? "profile"/);
  assert.match(chrome, /flexWrap: "nowrap"/);
  assert.match(purchases, /useUserPurchasesQuery/);
  assert.match(section, /useUserProfileThumbListStyles/);
  assert.match(webPurchasesCss, /--user-profile-purchases-section-radius:\s*24px/);
  assert.match(webPurchasesCss, /--user-profile-purchases-thumb-size:\s*64px/);
  assert.match(webPurchasesCss, /--user-profile-purchases-thumb-radius:\s*14px/);
  assert.match(webPurchasesCss, /padding:\s*0\.75rem 0\.875rem/);
  assert.match(followStyles, /borderRadius: theme\.radius\.pill/);
  assert.match(webFollowCss, /border-radius:\s*999px/);
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
  const panelStyles = readMobileFile("entities/user/ui/userProfileInfoPanelStyles.ts");
  const chrome = readMobileFile("shared/theme/profileChromeStyles.ts");
  const detailRowBlock = panelStyles.match(/detailRow:\s*\{([^}]*)\}/)?.[1] ?? "";
  const detailValueBlock = panelStyles.match(/detailValue:\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(detailRowBlock, /flexDirection:\s*"row"/);
  assert.match(detailRowBlock, /justifyContent:\s*"space-between"/);
  assert.match(detailRowBlock, /flexWrap:\s*"nowrap"/);
  assert.match(detailValueBlock, /textAlign:\s*"right"/);
  assert.doesNotMatch(detailRowBlock, /flexDirection:\s*"column"/);
  assert.doesNotMatch(panel, /SquircleView/);
  assert.doesNotMatch(panel, /izColors\.nearBlack/);
  assert.match(panelStyles, /resolveProfileSectionHeaderChrome/);
  assert.match(panelStyles, /borderRadius: O\.infoSectionRadius/);
  assert.match(panelStyles, /gap: O\.infoSectionsGap/);
  assert.match(chrome, /resolveProfileSectionHeaderChrome/);
  assert.match(chrome, /theme\.colors\.ink/);
  assert.match(chrome, /theme\.colors\.onContrast/);
});

test("stats section uses grid cards with gradient icons like web", () => {
  const panel = readMobileFile("entities/user/ui/UserProfileInfoPanel.tsx");
  const card = readMobileFile("entities/user/ui/ProfileStatCard.tsx");
  const gradients = readMobileFile("entities/user/lib/profileStatIconGradients.ts");
  const styles = readMobileFile("entities/user/ui/userProfileInfoPanelStyles.ts");
  const webCss = readClientFile("entities/user/ui/UserProfileInfoPanel.css");
  const webPanel = readClientFile("entities/user/ui/UserProfileInfoPanel.jsx");

  assert.match(panel, /PROFILE_STATS_SECTION_ID/);
  assert.match(panel, /ProfileStatCard/);
  assert.match(panel, /statsGrid/);
  assert.match(panel, /rowActions/);
  assert.match(card, /GradientFill/);
  assert.match(card, /resolveProfileStatIconGradient/);
  assert.match(card, /chevron-right/);
  assert.match(card, /accessibilityRole="button"/);
  assert.match(gradients, /followersCount:/);
  assert.match(gradients, /userLoyaltyPoints:/);
  assert.match(gradients, /PROFILE_STATS_WIDE_ROW_IDS/);
  assert.match(styles, /statIcon:/);
  assert.match(styles, /borderRadius: 16/);
  assert.match(webCss, /user-profile-info__stats-grid/);
  assert.match(webCss, /user-profile-info__stat-icon/);
  assert.match(webPanel, /ProfileStatCard/);
  assert.match(webPanel, /section_stats/);
  assert.match(webPanel, /rowActions/);
  const overview = readMobileFile("features/profile-tab/ui/ProfileTabOverviewSection.tsx");
  assert.match(overview, /PROFILE_ROW_ID\.FOLLOWING/);
  assert.match(overview, /PROFILE_ROW_ID\.FOLLOWERS/);
  assert.match(overview, /PROFILE_ROW_ID\.TOTAL_SALES_AMOUNT/);
  assert.match(overview, /PROFILE_ROW_ID\.TOTAL_PURCHASES_AMOUNT/);
  assert.match(overview, /PROFILE_ROW_ID\.WISHLIST/);
  assert.match(overview, /PROFILE_ROW_ID\.LOYALTY_POINTS/);
  assert.match(overview, /UserRatingVotesSheet/);
});

test("email reveal parity with web (hasEmail → Показать почту)", () => {
  const rows = readMobileFile("entities/user/lib/getUserProfileRows.ts");
  const panel = readMobileFile("entities/user/ui/UserProfileInfoPanel.tsx");
  const reveal = readMobileFile("entities/user/ui/ProfileEmailReveal.tsx");
  const api = readMobileFile("entities/user/api/fetchUserEmail.ts");
  const copy = readMobileFile("shared/config/appUiCopy.ts");
  const webRows = readClientFile("entities/user/lib/getUserProfileRows.js");
  const webReveal = readClientFile("entities/user/ui/ProfileEmailReveal.jsx");

  assert.match(rows, /needsEmailReveal/);
  assert.match(rows, /hasEmail/);
  assert.match(webRows, /needsEmailReveal/);
  assert.match(panel, /ProfileEmailReveal/);
  assert.match(panel, /needsEmailReveal/);
  assert.match(reveal, /fetchUserEmail/);
  assert.match(reveal, /SHOW_EMAIL/);
  assert.match(api, /\/user\/\$\{encodeURIComponent\(userId\)\}\/email/);
  assert.match(copy, /SHOW_EMAIL: "Показать почту"/);
  assert.match(webReveal, /fetchUserEmail/);
  assert.match(webReveal, /SHOW_EMAIL/);
});

test("subscriptions and seller name open user profile", () => {
  const subscriptions = readMobileFile(
    "features/subscriptions-page/ui/SubscriptionsPage.tsx",
  );
  const sellerRow = readMobileFile("entities/product/ui/ProductCardSellerRow.tsx");
  const sellerPage = readMobileFile(
    "features/seller-products-page/ui/SellerProductsPage.tsx",
  );

  assert.match(subscriptions, /SubscriptionUserRow/);
  assert.match(subscriptions, /\/user\/\[id\]/);
  assert.match(sellerRow, /\/user\/\[id\]/);
  assert.match(sellerPage, /UserPremiumDisplayName/);
});
