import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Модуль без alias-импортов — Node 24 стрипает типы и даёт гонять реальную логику.
import {
  HOME_ROUTE,
  normalizeWebPath,
  resolveWebPathToMobileRoute,
} from "../features/deep-linking/lib/resolveWebPathToMobileRoute.ts";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(mobileRoot, "..");

const readRepoFile = (relativePath) =>
  readFileSync(resolve(repoRoot, relativePath), "utf8");

test("normalizeWebPath чистит query, hash и хвостовые слэши", () => {
  assert.equal(normalizeWebPath("/wishlist?utm=x#top"), "/wishlist");
  assert.equal(normalizeWebPath("wishlist/"), "/wishlist");
  assert.equal(normalizeWebPath(""), "/");
  assert.equal(normalizeWebPath("/"), "/");
});

test("пути, которые раньше молча не открывались, теперь ведут на экран", () => {
  const cases = {
    "/basket": "/(tabs)/cart",
    "/wishlist": "/hub/wishlist",
    "/me": "/(tabs)/me",
    "/my-products": "/hub/my-products",
    "/premium": "/hub/premium",
    "/faq": "/faq",
    "/legal/privacy": "/legal/privacy",
    "/legal/offer": "/legal/offer",
    "/partner-program": "/hub/partner-program",
    "/data-confirmation": "/hub/data-confirmation",
    "/profile": "/(tabs)/me",
    "/profile/edit": "/profile/edit",
    "/profile/edit-profile": "/profile/edit",
    "/forgot-password": "/(auth)/forgot-password",
  };

  for (const [webPath, expected] of Object.entries(cases)) {
    assert.equal(resolveWebPathToMobileRoute(webPath), expected, webPath);
  }
});

test("динамические разделы разбираются по id", () => {
  assert.equal(resolveWebPathToMobileRoute("/product/64ab"), "/product/64ab");
  assert.equal(resolveWebPathToMobileRoute("/raffle/64ab"), "/raffle/64ab");
  assert.equal(resolveWebPathToMobileRoute("/seller/64ab"), "/seller/64ab");
  assert.equal(resolveWebPathToMobileRoute("/user/64ab"), "/user/64ab");
  assert.equal(resolveWebPathToMobileRoute("/hub/my-sales"), "/hub/my-sales");
});

test("служебные сегменты /user/* не считаются профилем", () => {
  assert.equal(resolveWebPathToMobileRoute("/user/search"), null);
  assert.equal(resolveWebPathToMobileRoute("/user/me"), null);
});

test("вложенный путь схлопывается к своему разделу", () => {
  assert.equal(resolveWebPathToMobileRoute("/orders/64ab"), "/orders");
  assert.equal(resolveWebPathToMobileRoute("/notifications/64ab"), "/notifications");
});

test("легаси-пути веба ведут туда же, куда ведёт редирект в вебе", () => {
  assert.equal(resolveWebPathToMobileRoute("/users"), "/users");
  assert.equal(resolveWebPathToMobileRoute("/affiliate-listings"), "/hub/partner-program");
  assert.equal(
    resolveWebPathToMobileRoute("/product-manage-toggle-display-admin"),
    "/hub/site-header-banner-admin",
  );
  assert.equal(
    resolveWebPathToMobileRoute("/product-promotions"),
    "/hub/product-moderation",
  );
});

test("разделы, которых на мобилке нет, отдают null", () => {
  assert.equal(resolveWebPathToMobileRoute("/staff-audit-log-admin"), null);
  assert.equal(resolveWebPathToMobileRoute("/broadcast-notifications-admin"), null);
  assert.equal(resolveWebPathToMobileRoute("/profile/onec-integration"), null);
});

test("каждый путь HOME_MAIN_VIEW_PATH веба либо открывается, либо помечен web-only", () => {
  const source = readRepoFile("client/src/shared/lib/homeMainViewPaths.js");
  const table = source.slice(
    source.indexOf("export const HOME_MAIN_VIEW_PATH"),
    source.indexOf("/** @type {Map<string, HomeMainView>} */"),
  );
  const webPaths = [...table.matchAll(/"(\/[^"]*)"/g)].map((match) => match[1]);

  assert.ok(webPaths.length >= 35, `нашли только ${webPaths.length} путей веба`);

  const knownWebOnly = new Set([
    "/profile/onec-integration",
    "/staff-audit-log-admin",
    "/broadcast-notifications-admin",
    "/admin-analytics",
  ]);

  const unmapped = webPaths.filter(
    (webPath) =>
      !knownWebOnly.has(webPath) && resolveWebPathToMobileRoute(webPath) == null,
  );

  assert.deepEqual(unmapped, [], `нет маршрута на мобилке: ${unmapped.join(", ")}`);
});

test("deep link на наш домен не остаётся без навигации", () => {
  const source = readFileSync(
    resolve(mobileRoot, "features/deep-linking/lib/parseAppDeepLink.ts"),
    "utf8",
  );
  assert.match(source, /resolveWebPathToMobileRoute\(rawPath\) \?\? HOME_ROUTE/);
  assert.equal(HOME_ROUTE, "/(tabs)");
});

test("баннер шапки и deep link читают одну таблицу", () => {
  const banner = readFileSync(
    resolve(mobileRoot, "features/deep-linking/lib/resolveSiteHeaderBannerMobileRoute.ts"),
    "utf8",
  );
  assert.match(banner, /resolveWebPathToMobileRoute/);
  assert.doesNotMatch(banner, /HUB_SECTION_PATHS/);
});
