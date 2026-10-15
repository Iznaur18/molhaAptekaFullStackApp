import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const GROUP_COPY_KEYS = [
  "STATUS_GROUP_ALL",
  "STATUS_GROUP_ATTENTION",
  "STATUS_GROUP_IN_PROGRESS",
  "STATUS_GROUP_DONE",
  "STATUS_GROUP_CLOSED",
  "STATUS_MORE",
  "STATUS_LESS",
];

/** Значение строкового ключа внутри блока `MY_ORDERS_PAGE_UI` файла копирайта. */
const pickCopy = (source, key) => {
  const block = /MY_ORDERS_PAGE_UI = \{[\s\S]*?\n\}/.exec(source)?.[0] ?? "";
  return new RegExp(`${key}: "([^"]+)"`).exec(block)?.[1] ?? null;
};

test("подписи групп «Моих покупок» совпадают с сайтом", () => {
  const web = read("../client/src/shared/config/copy/orders.js");
  const mobile = read("shared/config/appUiCopy.ts");
  for (const key of GROUP_COPY_KEYS) {
    const webValue = pickCopy(web, key);
    assert.ok(webValue, `на сайте нет ${key}`);
    assert.equal(pickCopy(mobile, key), webValue, key);
  }
});

test("панель «Моих покупок»: группы, «Нужно действие» и «Ещё статусы»", () => {
  const toolbar = read("features/my-orders-page/ui/MyOrdersPageToolbar.tsx");
  for (const key of GROUP_COPY_KEYS) {
    assert.match(toolbar, new RegExp(`MY_ORDERS_PAGE_UI\\.${key}`), key);
  }
  // Точный статус из второго ряда открывает его сразу, как на сайте.
  assert.match(toolbar, /useState\(exactStatusSelected\)/);
  assert.match(toolbar, /isMyOrdersListGroupFilter/);
  // Чипы переносятся, а не прокручиваются вбок.
  assert.doesNotMatch(toolbar, /horizontal/);
  assert.match(read("shared/theme/myOrdersPageStyles.ts"), /flexWrap: "wrap"/);
});

test("фильтр покупок и правило «в работе» берутся из shared-lib", () => {
  assert.match(
    read("entities/order/lib/filterMyOrders.ts"),
    /orderMatchesStatusFilter[\s\S]*@izibuy\/shared-lib/,
  );
  assert.match(read("entities/order/lib/isOrderInProgress.ts"), /@izibuy\/shared-lib/);
});

test("«Нужно действие» и выбор статуса сбрасывают друг друга", () => {
  const page = read("features/my-orders-page/ui/MyOrdersPage.tsx");
  assert.match(page, /onAttentionOnlyChange=\{handleAttentionOnlyChange\}/);
  assert.match(page, /onAttentionFilterChange=\{handleAttentionOnlyChange\}/);
  assert.match(
    page,
    /onStatusFilterChange=\{\(value\) => \{\s*setStatusFilter\(value\);\s*setAttentionOnly\(false\);/,
  );
});
