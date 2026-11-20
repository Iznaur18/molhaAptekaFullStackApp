import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { resolveWebPathToMobileRoute } from "../features/deep-linking/lib/resolveWebPathToMobileRoute.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(MOBILE_ROOT, rel), "utf8");

test("order detail route + page wiring", () => {
  assert.equal(existsSync(join(MOBILE_ROOT, "app/orders/[id].tsx")), true);
  assert.equal(
    existsSync(join(MOBILE_ROOT, "features/my-orders-page/ui/OrderDetailPage.tsx")),
    true,
  );

  const route = read("app/orders/[id].tsx");
  const page = read("features/my-orders-page/ui/OrderDetailPage.tsx");
  const list = read("features/my-orders-page/ui/MyOrdersPage.tsx");
  const card = read("entities/order/ui/OrderCard.tsx");
  const layout = read("app/_layout.tsx");
  const resolve = read("features/deep-linking/lib/resolveWebPathToMobileRoute.ts");

  assert.match(route, /OrderDetailPage/);
  assert.match(page, /useMyOrdersQuery/);
  assert.match(page, /useBuyerOrderCardActions/);
  assert.match(page, /DETAIL_NOT_FOUND/);
  assert.match(page, /AUTH_REQUIRED/);
  assert.match(page, /ScreenBackButton/);
  assert.match(list, /pathname: "\/orders\/\[id\]"/);
  assert.match(list, /onOpenOrder=/);
  assert.match(card, /onOpenOrder\?:/);
  assert.match(layout, /name="orders\/\[id\]"/);
  assert.match(resolve, /\/orders\/\$\{id\}/);
  assert.match(resolve, /\/my-orders\//);
});

test("deep link maps order id paths to /orders/:id", () => {
  assert.equal(resolveWebPathToMobileRoute("/orders/abc"), "/orders/abc");
  assert.equal(resolveWebPathToMobileRoute("/my-orders/abc"), "/orders/abc");
  assert.equal(resolveWebPathToMobileRoute("/orders"), "/orders");
});
