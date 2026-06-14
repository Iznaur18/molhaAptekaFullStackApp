/**
 * WF-7.2 static regression: routes, hub wiring, deep links.
 * Manual Samsung smoke — см. docs/mobile-development.md § WF-7.2
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const HUB_EXTERNAL_SECTIONS = new Set(["my-orders", "edit-profile"]);

const EXPECTED_APP_ROUTES = [
  "app/(tabs)/index.tsx",
  "app/(tabs)/cart.tsx",
  "app/(tabs)/profile.tsx",
  "app/(auth)/login.tsx",
  "app/(auth)/register.tsx",
  "app/catalog-browser.tsx",
  "app/create-product.tsx",
  "app/edit-product/[id].tsx",
  "app/hub/[section].tsx",
  "app/legal/privacy.tsx",
  "app/notifications/index.tsx",
  "app/orders/index.tsx",
  "app/product/[id].tsx",
  "app/profile/edit.tsx",
  "app/raffle/[id].tsx",
  "app/seller/[userId].tsx",
  "app/user/[id].tsx",
  "app/users/index.tsx",
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

  console.log("\n---");
  if (failed > 0) {
    console.error(`FAILED: ${failed} check(s)`);
    process.exit(1);
  }
  console.log("PASS — static WF-7.2");
  console.log("Manual: Samsung smoke → docs/mobile-development.md § WF-7.2");
  console.log("  adb shell am start -a android.intent.action.VIEW -d \"izibuy://product/<id>\"");
};

run();
