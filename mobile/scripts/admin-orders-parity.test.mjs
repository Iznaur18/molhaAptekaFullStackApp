import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("admin orders page mirrors web toolbar, filters and compact cards", () => {
  const page = readMobileFile("features/admin-orders-page/ui/AdminOrdersPage.tsx");
  const toolbar = readMobileFile("features/admin-orders-page/ui/AdminOrdersPageToolbar.tsx");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /AdminOrdersPageToolbar/);
  assert.match(page, /OrderStatusSelect/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /compact/);
  assert.match(page, /showBuyer/);
  assert.match(page, /statusSlot/);
  assert.match(page, /PAGE_LIMIT/);
  assert.match(page, /updateStatusMutation/);
  assert.match(page, /activeSectionId="admin-orders"/);
  assert.match(page, /TAB_ADMIN_ORDERS/);
  assert.doesNotMatch(page, /staffQueueStyles/);

  assert.match(toolbar, /ADMIN_ORDERS_PAGE_UI\.TITLE/);
  assert.match(toolbar, /STATUS_FILTER_ALL/);
  assert.match(toolbar, /resolveMyOrdersStatusFilterChipActiveColors/);
});

test("order status select mirrors web admin status change", () => {
  const select = readMobileFile("features/admin-order-status/ui/OrderStatusSelect.tsx");
  const orderCard = readMobileFile("entities/order/ui/OrderCard.tsx");

  assert.match(select, /STATUS_CHANGE_LABEL/);
  assert.match(select, /ORDER_STATUSES/);
  assert.match(select, /STATUS_CHANGE_PENDING/);

  assert.match(orderCard, /statusSlot/);
});

test("admin orders ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /TITLE: "Все заказы"/);
  assert.match(copy, /EMPTY_BY_FILTER: "По выбранному статусу заказов нет."/);
  assert.match(copy, /PAGE_LIMIT: 20/);
});
