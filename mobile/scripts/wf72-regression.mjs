/**
 * WF-7.2 static regression: routes, hub wiring, deep links.
 * Manual Samsung smoke — см. docs/mobile-development.md § WF-7.2
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveUploadedImageUrlForBrowser } from "../../packages/shared-lib/dist/index.js";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const MOBILE_ROOT = path.resolve(SCRIPT_DIR, "..");

const read = (relativePath) =>
  fs.readFileSync(path.join(MOBILE_ROOT, relativePath), "utf8");

const fileExists = (relativePath) =>
  fs.existsSync(path.join(MOBILE_ROOT, relativePath));

const extractProfileSectionIds = () => {
  const source = read("features/profile-hub/model/profileSections.ts");
  return [
    ...source.matchAll(/export const PROFILE_SECTION_[A-Z0-9_]+ = "([^"]+)"/g),
  ].map((m) => m[1]);
};

const extractHubSectionCases = () => {
  const source = read("features/profile-hub/ui/HubSectionContent.tsx");
  return [...source.matchAll(/case "([^"]+)":/g)].map((m) => m[1]);
};

const HUB_EXTERNAL_SECTIONS = new Set(["edit-profile"]);

const EXPECTED_APP_ROUTES = [
  "app/(tabs)/index.tsx",
  "app/(tabs)/catalog.tsx",
  "app/(tabs)/place-product.tsx",
  "app/(tabs)/cart.tsx",
  "app/(tabs)/profile.tsx",
  "app/(auth)/login.tsx",
  "app/(auth)/register.tsx",
  "app/catalog-browser.tsx",
  "app/create-product.tsx",
  "app/edit-product/[id].tsx",
  "app/(tabs)/hub/[section].tsx",
  "app/(tabs)/orders.tsx",
  "app/(tabs)/users.tsx",
  "app/legal/privacy.tsx",
  "app/notifications/index.tsx",
  "app/product/[id].tsx",
  "app/profile/edit.tsx",
  "app/raffle/[id].tsx",
  "app/seller/[userId].tsx",
  "app/user/[id].tsx",
  "app/user/[id]/edit.tsx",
];

// Mirror of parseAppDeepLink.ts (keep in sync)
const PRODUCT_PATH_RE = /\/product\/([^/?#]+)/i;
const RAFFLE_PATH_RE = /\/raffle\/([^/?#]+)/i;
const SELLER_PATH_RE = /\/seller\/([^/?#]+)/i;
const USER_PROFILE_PATH_RE = /^\/user\/([^/?#]+)$/i;
const HUB_PATH_RE = /\/hub\/([^/?#]+)/i;
const RESERVED_USER_PATH_SEGMENTS = new Set(["search", "me", "data-confirmation-requests"]);

const normalizePath = (rawPath) => {
  const trimmed = rawPath.trim();
  if (!trimmed) return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const matchNamedRoute = (pathname) => {
  const productMatch = pathname.match(PRODUCT_PATH_RE);
  if (productMatch?.[1]) return `/product/${decodeURIComponent(productMatch[1])}`;

  const raffleMatch = pathname.match(RAFFLE_PATH_RE);
  if (raffleMatch?.[1]) return `/raffle/${decodeURIComponent(raffleMatch[1])}`;

  const sellerMatch = pathname.match(SELLER_PATH_RE);
  if (sellerMatch?.[1]) return `/seller/${decodeURIComponent(sellerMatch[1])}`;

  const userMatch = pathname.match(USER_PROFILE_PATH_RE);
  if (userMatch?.[1]) {
    const userId = decodeURIComponent(userMatch[1]);
    if (!RESERVED_USER_PATH_SEGMENTS.has(userId)) return `/user/${userId}`;
  }

  const hubMatch = pathname.match(HUB_PATH_RE);
  if (hubMatch?.[1]) return `/hub/${decodeURIComponent(hubMatch[1])}`;

  if (pathname === "/orders" || pathname.startsWith("/orders/")) return "/orders";
  if (pathname === "/notifications" || pathname.startsWith("/notifications/"))
    return "/notifications";
  if (pathname === "/catalog" || pathname === "/catalog-browser") return "/catalog-browser";
  if (pathname === "/user-list" || pathname === "/users") return "/users";
  if (pathname === "/login") return "/(auth)/login";
  if (pathname === "/" || pathname === "/(tabs)") return "/(tabs)";
  return null;
};

const parseAppDeepLink = (url) => {
  try {
    const parsed = new URL(url);
    const scheme = parsed.protocol.replace(":", "");
    if (scheme === "izibuy") {
      const hostPath = parsed.hostname
        ? `/${parsed.hostname}${parsed.pathname}`
        : parsed.pathname;
      return matchNamedRoute(normalizePath(hostPath));
    }
    const host = parsed.hostname.toLowerCase();
    if (host === "izibuy.ru" || host === "www.izibuy.ru") {
      return matchNamedRoute(normalizePath(parsed.pathname));
    }
  } catch {
    const normalized = normalizePath(url.replace(/^izibuy:\/\//i, "/"));
    return matchNamedRoute(normalized);
  }
  return null;
};

const DEEP_LINK_CASES = [
  ["izibuy://product/abc123", "/product/abc123"],
  ["izibuy://raffle/raffle1", "/raffle/raffle1"],
  ["izibuy://seller/user42", "/seller/user42"],
  ["izibuy://user/user42", "/user/user42"],
  ["izibuy://users", "/users"],
  ["izibuy://user-list", "/users"],
  ["https://izibuy.ru/product/abc123", "/product/abc123"],
  ["izibuy://hub/wishlist", "/hub/wishlist"],
  ["izibuy://orders", "/orders"],
];

const UPLOAD_SOURCE_CHECKS = [
  {
    file: "entities/upload/api/uploadImage.ts",
    mustInclude: [
      "postMultipart",
      "@izibuy/shared-api",
      '"/upload"',
      "normalizeUploadUrlForStorage",
      "formatApiErrorMessage",
    ],
    mustNotInclude: ["axios.post("],
  },
  {
    file: "entities/upload/api/uploadVideo.ts",
    mustInclude: [
      "postMultipart",
      "@izibuy/shared-api",
      '"/upload/video"',
      "normalizeUploadUrlForStorage",
    ],
    mustNotInclude: ["axios.post("],
  },
  {
    file: "entities/upload/model/constants.ts",
    mustInclude: ["@molha/api-contract", "UPLOAD_IMAGE_MAX_BYTES", "UPLOAD_IMAGE_MIME_TYPES"],
  },
  {
    file: "shared/lib/index.ts",
    mustInclude: ["@izibuy/shared-lib", "normalizeUploadUrlForStorage"],
  },
];

const DEAD_MOBILE_LIB_FILES = [
  "shared/lib/formatPriceRub.ts",
  "shared/lib/formatApiErrorMessage.ts",
  "shared/lib/normalizeUploadUrlForStorage.ts",
  "shared/lib/formatIsoDateTime.ts",
];

const STAFF_WEB_FILES = [
  "features/profile-hub/lib/openProfileStaffWebSection.ts",
  "shared/config/webAppBaseUrl.ts",
  "../packages/shared-lib/src/profileStaffWebPaths.ts",
];

const BUYER_CRITICAL_ROUTES = [
  "app/(tabs)/index.tsx",
  "app/(tabs)/catalog.tsx",
  "app/product/[id].tsx",
  "app/(tabs)/cart.tsx",
  "app/(tabs)/orders.tsx",
  "app/(tabs)/profile.tsx",
  "app/(tabs)/hub/[section].tsx",
  "app/profile/edit.tsx",
];

const HUB_TAB_BAR_CHECKS = [
  {
    file: "app/(tabs)/_layout.tsx",
    mustInclude: ['name="hub/[section]"', 'name="orders"', 'name="users"', "href: null"],
  },
  {
    file: "shared/ui/MobileBottomTabBar.tsx",
    mustInclude: [
      "isProfileTabBarRoute",
      "isHomeTabBarRoute",
      "resolveMobileBottomNavHorizontalInset",
      "styles.shell",
      'pointerEvents: "box-none"',
      'item.routeName === "profile" && isProfileTabBarContext',
      'item.routeName === "index" && isHomeTabBarContext',
    ],
  },
  {
    file: "shared/lib/isHomeTabBarRoute.ts",
    mustInclude: ['normalized === "/users"', 'normalized.startsWith("/users/")'],
  },
  {
    file: "shared/lib/isProfileTabBarRoute.ts",
    mustInclude: ['normalized.startsWith("/hub/")', 'normalized.startsWith("/orders/")'],
  },
  {
    file: "features/profile-hub/ui/HubSectionContent.tsx",
    mustInclude: ['case "my-orders":', "MyOrdersPage"],
  },
  {
    file: "features/profile-hub/model/profileSections.ts",
    mustNotInclude: ["[PROFILE_SECTION_MY_ORDERS]: \"/orders\""],
  },
];

const PROFILE_NAV_CHROME_CHECKS = [
  {
    file: "../packages/shared-lib/src/profileNavTones.ts",
    mustInclude: ['overview: "indigo"', "resolveProfileNavSectionTone"],
  },
  {
    file: "features/profile-hub/lib/enrichProfileNavItem.ts",
    mustInclude: ["resolveProfileNavSectionTone", "resolveProfileNavIconName"],
  },
  {
    file: "features/profile-hub/lib/profileNavItemPresentation.ts",
    mustInclude: ["buildProfileNavItemPresentation", "borderLeftColor"],
  },
  {
    file: "features/profile-hub/ui/ProfileHubNavItem.tsx",
    mustInclude: ["MaterialIcons", "buildProfileNavItemPresentation"],
  },
  {
    file: "features/profile-hub/ui/ProfileHubMenu.tsx",
    mustInclude: ["ProfileHubNavItem", "groupDivided"],
  },
  {
    file: "shared/theme/profileChromeStyles.ts",
    mustInclude: ["primaryBright", "itemIconWrap", "groupDivided"],
  },
  {
    file: "features/profile-tab/ui/ProfileMobileSectionToggle.tsx",
    mustInclude: ['name="menu"', "MOBILE_NAV_CURRENT_SECTION"],
  },
];

const SCREEN_LAYOUT_CHECKS = [
  {
    file: "shared/lib/screenBreakpoints.ts",
    mustInclude: [
      "resolveProductGridColumns",
      "SCREEN_PRODUCT_GRID_2_COL_MAX_WIDTH",
      "SCREEN_PRODUCT_GRID_4_COL_MIN_WIDTH",
      "PRODUCT_GRID_COLUMNS_COMPACT",
      "PRODUCT_GRID_GAP = 6",
      "resolveLayoutContentWidth",
      "resolveScreenWidthTier",
    ],
  },
  {
    file: "shared/model/useProductGridLayout.ts",
    mustInclude: ["useWindowDimensions", "listKey"],
  },
  {
    file: "shared/model/useScreenLayout.ts",
    mustInclude: ["centeredContentStyle", "profileContentStyle"],
  },
  {
    file: "app/(tabs)/index.tsx",
    mustInclude: ["useProductGridLayout", "productGrid.columns"],
    mustNotInclude: ["NUM_COLUMNS = 2", "NUM_COLUMNS = 3"],
  },
  {
    file: "features/my-products-page/ui/MyProductsPage.tsx",
    mustInclude: ["useProductGridLayout"],
    mustNotInclude: ["NUM_COLUMNS = 2"],
  },
  {
    file: "features/seller-products-page/ui/SellerProductsPage.tsx",
    mustInclude: ["useProductGridLayout"],
    mustNotInclude: ["NUM_COLUMNS = 2"],
  },
  {
    file: "features/raffle-products-page/ui/RaffleProductsPage.tsx",
    mustInclude: ["useProductGridLayout"],
    mustNotInclude: ["numColumns={2}"],
  },
  {
    file: "entities/raffle/ui/RaffleFeaturedCarousel.tsx",
    mustInclude: ["useRaffleFeaturedSlideLayout"],
    mustNotInclude: ["useWindowDimensions"],
  },
  {
    file: "shared/theme/raffleFeaturedStyles.ts",
    mustInclude: ["maxWidth: \"100%\"", "overflow: \"hidden\""],
  },
];

// Mirror of isProfileTabBarRoute.ts (keep in sync)
const isProfileTabBarRoute = (pathname) => {
  const normalized = pathname.trim();
  if (normalized === "/hub" || normalized.startsWith("/hub/")) {
    return true;
  }
  return normalized === "/orders" || normalized.startsWith("/orders/");
};

// Mirror of isHomeTabBarRoute.ts (keep in sync)
const isHomeTabBarRoute = (pathname) => {
  const normalized = pathname.trim();
  return normalized === "/users" || normalized.startsWith("/users/");
};

const PROFILE_TAB_BAR_ROUTE_CASES = [
  ["/hub/my-sales", true],
  ["/hub/my-orders", true],
  ["/orders", true],
  ["/catalog", false],
  ["/(tabs)/cart", false],
];

const HOME_TAB_BAR_ROUTE_CASES = [
  ["/users", true],
  ["/users/", true],
  ["/catalog", false],
  ["/orders", false],
];

const BUYER_API_SOURCE_CHECKS = [
  {
    file: "entities/product/api/fetchCatalogProductsPage.ts",
    mustInclude: ["parseCatalogProductsPageData", 'apiClient.get("/product"'],
  },
  {
    file: "entities/product/api/fetchCatalogProductById.ts",
    mustInclude: ["parseCatalogProductByIdData", "/catalog"],
  },
  {
    file: "entities/cart/api/fetchMyCart.ts",
    mustInclude: ["parseMyCartData", 'apiClient.get("/cart"'],
  },
  {
    file: "entities/cart/api/replaceMyCart.ts",
    mustInclude: ["parseReplaceCartData", 'apiClient.put("/cart"'],
  },
  {
    file: "entities/order/api/createOrder.ts",
    mustInclude: ["parseCreateOrderData", 'apiClient.post("/order"'],
  },
  {
    file: "entities/order/api/fetchMyOrders.ts",
    mustInclude: ["parseMyOrdersData", 'apiClient.get("/order"'],
  },
  {
    file: "entities/session/api/fetchAuthMe.ts",
    mustInclude: ["parseAuthMeData", 'apiClient.get("/auth/me"'],
  },
];

const PRODUCT_PREVIEW_VIDEO_CHECKS = [
  {
    file: "entities/product/ui/ProductCard.tsx",
    mustInclude: [
      "ProductCardMediaSlide",
      "ProductCardMediaGalleryNav",
      "styles.imagePressable",
      "styles.contentPressable",
      "useProductCardMediaState",
    ],
    mustNotInclude: ['from "@/entities/product/ui/ProductCardMedia"'],
  },
  {
    file: "entities/product/ui/ProductMediaSlideContent.tsx",
    mustInclude: ["ProductPreviewVideo", 'slide.type === "video"'],
  },
  {
    file: "shared/ui/ProductPreviewVideo.web.tsx",
    mustInclude: ["resolvePreviewVideoMimeType", 'createElement("source"'],
    mustNotInclude: ["play().catch(() => {\n      onPlaybackFailed"],
  },
  {
    file: "entities/product/lib/resolveProductPreviewVideoUrl.ts",
    mustInclude: ["productPreviewVideoUrl", "resolveUploadedMediaUrl"],
  },
  {
    file: "shared/theme/catalogProductStyles.ts",
    mustInclude: ["PRODUCT_MEDIA_HERO_ASPECT_RATIO", "aspectRatio: PRODUCT_MEDIA_HERO_ASPECT_RATIO"],
  },
  {
    file: "entities/product/ui/ProductMediaGallery.tsx",
    mustInclude: ["styles.detailHero"],
    mustNotInclude: ["useWindowDimensions", "minHeight: detailHeroMinHeight", "DETAIL_HERO_MIN_HEIGHT"],
  },
];

const STORY_MEDIA_WIRING_CHECKS = [
  {
    file: "shared/lib/resolveMediaUrl.ts",
    mustInclude: ["resolveUploadedImageUrlForBrowser", "@izibuy/shared-lib"],
  },
  {
    file: "entities/user-story/lib/resolveUserStoryMediaUrl.ts",
    mustInclude: ["resolveUploadedMediaUrl"],
  },
  {
    file: "features/home-feed/ui/UserStoryViewerModal.tsx",
    mustInclude: [
      "resolveUserStoryMediaUrl",
      "resolvedMediaUrl",
      "computeUserStoryFrameSize",
      'presentationStyle="fullScreen"',
    ],
  },
];

const STORY_MEDIA_DEV_REWRITE_CASES = [
  [
    "http://127.0.0.1:5173/uploads/story.jpg",
    "http://192.168.1.10:4444",
    "http://192.168.1.10:4444/uploads/story.jpg",
  ],
  [
    "http://localhost:5173/uploads/story.jpg",
    "http://192.168.1.10:4444",
    "http://192.168.1.10:4444/uploads/story.jpg",
  ],
  [
    "https://cdn.izibuy.ru/uploads/story.jpg",
    "http://192.168.1.10:4444",
    "https://cdn.izibuy.ru/uploads/story.jpg",
  ],
];

// Mirror of resolvePreviewVideoMimeType.ts (keep in sync)
const resolvePreviewVideoMimeType = (src) => {
  const normalized = String(src ?? "").toLowerCase();
  if (normalized.includes(".mov") || normalized.includes(".quicktime")) {
    return "video/quicktime";
  }
  if (normalized.includes(".m4v")) {
    return "video/mp4";
  }
  if (normalized.includes(".webm")) {
    return "video/webm";
  }
  return "video/mp4";
};

const PREVIEW_VIDEO_MIME_CASES = [
  ["/uploads/preview.webm", "video/webm"],
  ["/uploads/preview.mov", "video/quicktime"],
  ["/uploads/preview.mp4", "video/mp4"],
];

const BUYER_UI_WIRING_CHECKS = [
  {
    file: "entities/product/ui/ProductCard.tsx",
    mustInclude: ['pathname: "/product/[id]"', "ProductCardMediaSlide"],
  },
  {
    file: "features/product-detail/ui/ProductDetailPurchaseActions.tsx",
    mustInclude: ["AddToCartButton"],
  },
  {
    file: "features/cart-add/ui/AddToCartButton.tsx",
    mustInclude: ["useCartActions"],
  },
  {
    file: "app/(tabs)/cart.tsx",
    mustInclude: ["createOrderMutation", 'router.replace("/orders")'],
  },
  {
    file: "app/(tabs)/profile.tsx",
    mustInclude: ["useAuthSessionQuery"],
  },
];

const assertSourceContains = (relativePath, fragments, label) => {
  const source = read(relativePath);
  const missing = fragments.filter((fragment) => !source.includes(fragment));
  if (missing.length > 0) {
    console.error(`✗ ${label} ${relativePath}: missing ${missing.join(", ")}`);
    return missing.length;
  }
  return 0;
};

const assertSourceExcludes = (relativePath, fragments, label) => {
  const source = read(relativePath);
  const found = fragments.filter((fragment) => source.includes(fragment));
  if (found.length > 0) {
    console.error(`✗ ${label} ${relativePath}: forbidden ${found.join(", ")}`);
    return found.length;
  }
  return 0;
};

const run = () => {
  let failed = 0;

  console.log("WF-7.2 static regression\n");

  for (const route of EXPECTED_APP_ROUTES) {
    if (!fileExists(route)) {
      console.error(`✗ missing route file: ${route}`);
      failed += 1;
    }
  }
  if (failed === 0) {
    console.log(`✓ app routes (${EXPECTED_APP_ROUTES.length})`);
  }

  if (fileExists("app/hub/[section].tsx")) {
    console.error("✗ hub must live under (tabs), not app/hub/[section].tsx");
    failed += 1;
  } else {
    console.log("✓ hub route nested in tabs (tab bar parity with web)");
  }

  let hubTabBarFailed = 0;
  for (const check of HUB_TAB_BAR_CHECKS) {
    hubTabBarFailed += assertSourceContains(check.file, check.mustInclude ?? [], "profile tab bar");
    if (check.mustNotInclude) {
      hubTabBarFailed += assertSourceExcludes(check.file, check.mustNotInclude, "profile tab bar");
    }
  }
  hubTabBarFailed += assertSourceExcludes(
    "app/_layout.tsx",
    ['name="hub/[section]"', 'name="orders"', 'name="users"'],
    "root stack",
  );
  if (fileExists("app/orders/index.tsx") || fileExists("app/(tabs)/orders/index.tsx")) {
    console.error("✗ orders must be app/(tabs)/orders.tsx, not orders/index.tsx");
    hubTabBarFailed += 1;
  }
  if (fileExists("app/users/index.tsx") || fileExists("app/(tabs)/users/index.tsx")) {
    console.error("✗ users must be app/(tabs)/users.tsx, not users/index.tsx");
    hubTabBarFailed += 1;
  }
  for (const [pathname, expected] of PROFILE_TAB_BAR_ROUTE_CASES) {
    const actual = isProfileTabBarRoute(pathname);
    if (actual !== expected) {
      console.error(`✗ isProfileTabBarRoute(${pathname}) expected ${expected}, got ${actual}`);
      hubTabBarFailed += 1;
    }
  }
  for (const [pathname, expected] of HOME_TAB_BAR_ROUTE_CASES) {
    const actual = isHomeTabBarRoute(pathname);
    if (actual !== expected) {
      console.error(`✗ isHomeTabBarRoute(${pathname}) expected ${expected}, got ${actual}`);
      hubTabBarFailed += 1;
    }
  }
  if (hubTabBarFailed > 0) {
    failed += hubTabBarFailed;
  } else {
    console.log(`✓ profile tab bar wiring (${HUB_TAB_BAR_CHECKS.length} checks + route helper)`);
  }

  let profileNavChromeFailed = 0;
  for (const check of PROFILE_NAV_CHROME_CHECKS) {
    const resolved =
      check.file.startsWith("../")
        ? path.join(MOBILE_ROOT, check.file)
        : path.join(MOBILE_ROOT, check.file);
    if (!fs.existsSync(resolved)) {
      console.error(`✗ missing profile nav chrome file: ${check.file}`);
      profileNavChromeFailed += 1;
      continue;
    }
    profileNavChromeFailed += assertSourceContains(
      check.file,
      check.mustInclude,
      "profile nav chrome",
    );
  }
  if (profileNavChromeFailed > 0) {
    failed += profileNavChromeFailed;
  } else {
    console.log(`✓ profile nav chrome (${PROFILE_NAV_CHROME_CHECKS.length} wiring files)`);
  }

  let screenLayoutFailed = 0;
  for (const check of SCREEN_LAYOUT_CHECKS) {
    if (!fileExists(check.file)) {
      console.error(`✗ missing screen layout file: ${check.file}`);
      screenLayoutFailed += 1;
      continue;
    }
    screenLayoutFailed += assertSourceContains(check.file, check.mustInclude, "screen layout");
    if (check.mustNotInclude) {
      screenLayoutFailed += assertSourceExcludes(check.file, check.mustNotInclude, "screen layout");
    }
  }
  if (screenLayoutFailed > 0) {
    failed += screenLayoutFailed;
  } else {
    console.log(`✓ screen layout (${SCREEN_LAYOUT_CHECKS.length} wiring files)`);
  }

  let productVideoFailed = 0;
  for (const check of PRODUCT_PREVIEW_VIDEO_CHECKS) {
    productVideoFailed += assertSourceContains(
      check.file,
      check.mustInclude ?? [],
      "product preview video",
    );
    if (check.mustNotInclude) {
      productVideoFailed += assertSourceExcludes(
        check.file,
        check.mustNotInclude,
        "product preview video",
      );
    }
  }
  for (const [src, expectedMime] of PREVIEW_VIDEO_MIME_CASES) {
    const actualMime = resolvePreviewVideoMimeType(src);
    if (actualMime !== expectedMime) {
      console.error(`✗ resolvePreviewVideoMimeType(${src}) expected ${expectedMime}, got ${actualMime}`);
      productVideoFailed += 1;
    }
  }
  if (productVideoFailed > 0) {
    failed += productVideoFailed;
  } else {
    console.log(`✓ product preview video (${PRODUCT_PREVIEW_VIDEO_CHECKS.length} checks + mime helper)`);
  }

  let storyMediaFailed = 0;
  for (const check of STORY_MEDIA_WIRING_CHECKS) {
    storyMediaFailed += assertSourceContains(
      check.file,
      check.mustInclude ?? [],
      "story media",
    );
  }
  for (const [rawUrl, mediaBase, expectedUrl] of STORY_MEDIA_DEV_REWRITE_CASES) {
    const actualUrl = resolveUploadedImageUrlForBrowser(rawUrl, mediaBase);
    if (actualUrl !== expectedUrl) {
      console.error(
        `✗ story media rewrite ${rawUrl} @ ${mediaBase}: expected ${expectedUrl}, got ${actualUrl}`,
      );
      storyMediaFailed += 1;
    }
  }
  if (storyMediaFailed > 0) {
    failed += storyMediaFailed;
  } else {
    console.log(
      `✓ story media (${STORY_MEDIA_WIRING_CHECKS.length} wiring + ${STORY_MEDIA_DEV_REWRITE_CASES.length} dev rewrite)`,
    );
  }

  const sectionIds = extractProfileSectionIds();
  const hubCases = new Set(extractHubSectionCases());
  const missingHub = sectionIds.filter(
    (id) => !HUB_EXTERNAL_SECTIONS.has(id) && !hubCases.has(id),
  );
  if (missingHub.length > 0) {
    console.error(`✗ HubSectionContent missing cases: ${missingHub.join(", ")}`);
    failed += missingHub.length;
  } else {
    console.log(`✓ hub sections wired (${sectionIds.length - HUB_EXTERNAL_SECTIONS.size})`);
  }

  const staffPage = "features/product-promotions-staff-page/ui/ProductPromotionsStaffPage.tsx";
  if (!fileExists(staffPage)) {
    console.error(`✗ missing ${staffPage}`);
    failed += 1;
  } else {
    console.log("✓ product-promotions staff page");
  }

  let deepLinkFailed = 0;
  for (const [url, expected] of DEEP_LINK_CASES) {
    const actual = parseAppDeepLink(url);
    if (actual !== expected) {
      console.error(`✗ deep link ${url}: expected ${expected}, got ${actual}`);
      deepLinkFailed += 1;
    }
  }
  if (deepLinkFailed > 0) {
    failed += deepLinkFailed;
  } else {
    console.log(`✓ deep links (${DEEP_LINK_CASES.length})`);
  }

  let uploadFailed = 0;
  for (const check of UPLOAD_SOURCE_CHECKS) {
    if (!fileExists(check.file)) {
      console.error(`✗ missing upload source: ${check.file}`);
      uploadFailed += 1;
      continue;
    }

    uploadFailed += assertSourceContains(
      check.file,
      check.mustInclude,
      "upload wiring",
    );
    if (check.mustNotInclude?.length) {
      uploadFailed += assertSourceExcludes(
        check.file,
        check.mustNotInclude,
        "upload wiring",
      );
    }
  }

  for (const deadFile of DEAD_MOBILE_LIB_FILES) {
    if (fileExists(deadFile)) {
      console.error(`✗ remove dead mobile lib copy: ${deadFile}`);
      uploadFailed += 1;
    }
  }

  if (uploadFailed > 0) {
    failed += uploadFailed;
  } else {
    console.log(`✓ upload stack (${UPLOAD_SOURCE_CHECKS.length} files, no dead lib copies)`);
  }

  let staffWebFailed = 0;
  for (const relativePath of STAFF_WEB_FILES) {
    const resolved =
      relativePath.startsWith("../")
        ? path.join(MOBILE_ROOT, relativePath)
        : path.join(MOBILE_ROOT, relativePath);
    if (!fs.existsSync(resolved)) {
      console.error(`✗ missing staff-web file: ${relativePath}`);
      staffWebFailed += 1;
    }
  }

  const staffWebHelper = read("features/profile-hub/lib/openProfileStaffWebSection.ts");
  if (!staffWebHelper.includes("isProfileStaffWebOnlySection")) {
    console.error("✗ staff web helper must use isProfileStaffWebOnlySection");
    staffWebFailed += 1;
  }
  if (!read("features/profile-hub/ui/ProfileHubMenu.tsx").includes("openProfileStaffWebSection")) {
    console.error("✗ ProfileHubMenu must call openProfileStaffWebSection");
    staffWebFailed += 1;
  }

  const readme = read("README.md");
  if (!readme.includes("## Staff inventory (G.2")) {
    console.error("✗ mobile/README.md must document Staff inventory (G.2)");
    staffWebFailed += 1;
  }

  const staffWebPathsSource = fs.readFileSync(
    path.join(MOBILE_ROOT, "../packages/shared-lib/src/profileStaffWebPaths.ts"),
    "utf8",
  );
  if (staffWebPathsSource.includes('PROFILE_SECTION_CREATE_RAFFLE]: "/me"')) {
    console.error("✗ create-raffle must not redirect to web /me (in-app hub)");
    staffWebFailed += 1;
  }
  if (!staffWebPathsSource.includes("isProfileStaffInAppSection")) {
    console.error("✗ staff web paths must define isProfileStaffInAppSection");
    staffWebFailed += 1;
  }
  if (!staffWebPathsSource.includes("...PROFILE_STAFF_SECTION_ORDER")) {
    console.error("✗ PROFILE_STAFF_IN_APP_SECTION_IDS must include all staff sections");
    staffWebFailed += 1;
  }
  if (!read("features/profile-hub/ui/ProfileHubMenu.tsx").includes("resolveProfileSectionRoute")) {
    console.error("✗ ProfileHubMenu must route in-app sections via resolveProfileSectionRoute");
    staffWebFailed += 1;
  }

  if (staffWebFailed > 0) {
    failed += staffWebFailed;
  } else {
    console.log(`✓ staff in-app hub (${STAFF_WEB_FILES.length} wiring files)`);
  }

  let buyerPathFailed = 0;
  const userDetailsPage = read("features/user-details-page/ui/UserDetailsPage.tsx");
  if (!userDetailsPage.includes("AdminUserStaffActions")) {
    console.error("✗ UserDetailsPage must expose admin edit action for staff");
    buyerPathFailed += 1;
  }
  if (!fileExists("app/user/[id]/edit.tsx")) {
    console.error("✗ missing admin edit user route: app/user/[id]/edit.tsx");
    buyerPathFailed += 1;
  }
  const adminEditUserForm = read("features/admin-edit-user-page/model/useAdminEditUserForm.ts");
  if (!adminEditUserForm.includes("router.back()")) {
    console.error("✗ admin edit user form must navigate back after successful save");
    buyerPathFailed += 1;
  }

  for (const route of BUYER_CRITICAL_ROUTES) {
    if (!fileExists(route)) {
      console.error(`✗ missing buyer-critical route: ${route}`);
      buyerPathFailed += 1;
    }
  }

  for (const check of BUYER_API_SOURCE_CHECKS) {
    if (!fileExists(check.file)) {
      console.error(`✗ missing buyer API source: ${check.file}`);
      buyerPathFailed += 1;
      continue;
    }
    buyerPathFailed += assertSourceContains(check.file, check.mustInclude, "buyer API");
  }

  for (const check of BUYER_UI_WIRING_CHECKS) {
    if (!fileExists(check.file)) {
      console.error(`✗ missing buyer UI wiring: ${check.file}`);
      buyerPathFailed += 1;
      continue;
    }
    buyerPathFailed += assertSourceContains(check.file, check.mustInclude, "buyer UI");
  }

  if (!read("README.md").includes("## Buyer-critical path (G.3)")) {
    console.error("✗ mobile/README.md must document Buyer-critical path (G.3)");
    buyerPathFailed += 1;
  }

  if (!fileExists("docs/BUYER-CRITICAL-PATH.md")) {
    console.error("✗ missing docs/BUYER-CRITICAL-PATH.md");
    buyerPathFailed += 1;
  }

  if (!fileExists("scripts/buyer-path-api-smoke.mjs")) {
    console.error("✗ missing scripts/buyer-path-api-smoke.mjs");
    buyerPathFailed += 1;
  }

  if (buyerPathFailed > 0) {
    failed += buyerPathFailed;
  } else {
    console.log(
      `✓ buyer-critical path (G.3, ${BUYER_CRITICAL_ROUTES.length} routes, ${BUYER_API_SOURCE_CHECKS.length} APIs)`,
    );
  }

  console.log("\n---");
  if (failed > 0) {
    console.error(`FAILED: ${failed} check(s)`);
    process.exit(1);
  }
  console.log("PASS — static WF-7.2");
  console.log("API smoke: npm run smoke:buyer-path (G.3, needs server + e2e seed)");
  console.log("Manual: Samsung smoke → docs/mobile-development.md § WF-7.2");
  console.log("  adb shell am start -a android.intent.action.VIEW -d \"izibuy://product/<id>\"");
};

run();
