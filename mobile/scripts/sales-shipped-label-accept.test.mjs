import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const read = (relativePath) => readFileSync(join(ROOT, relativePath), "utf8");

const sharedStatuses = read(join("..", "packages/shared-lib/src/orderStatus.ts"));
const mobileConstants = read("entities/order/model/constants.ts");
const clientConstants = read(
  join("..", "client/src/entities/order/model/constants.js"),
);

/** `ORDER_STATUS_READY_FOR_PICKUP` → `ready_for_pickup`, как объявлено в shared-lib. */
const statusValueByConstName = Object.fromEntries(
  [
    ...sharedStatuses.matchAll(/export const (ORDER_STATUS_[A-Z_]+) = "([a-z_]+)";/g),
  ].map(([, name, value]) => [name, value]),
);

test("подписи статусов живут в shared-lib, клиенты их только реэкспортируют", () => {
  assert.match(sharedStatuses, /export const ORDER_STATUS_LABEL_RU/);
  assert.match(sharedStatuses, /export const SALES_ORDER_STATUS_LABEL_RU/);

  for (const [name, source] of [
    ["mobile", mobileConstants],
    ["client", clientConstants],
  ]) {
    assert.match(source, /SALES_ORDER_STATUS_LABEL_RU/, name);
    assert.match(source, /from "@izibuy\/shared-lib"/, name);
    // Своя копия словаря в клиенте — это снова расхождение сайта и приложения.
    assert.doesNotMatch(source, /ORDER_STATUS_LABEL_RU\s*[:=]/, name);
    assert.doesNotMatch(source, /export const ORDER_STATUS_[A-Z_]+ = "/, name);
  }
});

test("shared-lib знает ровно те статусы, что и контракт", () => {
  const contractOrder = read(join("..", "contract/src/order.js"));
  const contractBlock = contractOrder.match(
    /export const ORDER_STATUSES = \[([\s\S]*?)\];/,
  );
  assert.ok(contractBlock, "ORDER_STATUSES в контракте не найден");
  const contractStatuses = [...contractBlock[1].matchAll(/"([a-z_]+)"/g)].map(
    ([, value]) => value,
  );

  const sharedBlock = sharedStatuses.match(
    /export const ORDER_STATUSES = \[([\s\S]*?)\] as const;/,
  );
  assert.ok(sharedBlock, "ORDER_STATUSES в shared-lib не найден");
  const sharedList = [...sharedBlock[1].matchAll(/(ORDER_STATUS_[A-Z_]+)/g)].map(
    ([, name]) => statusValueByConstName[name],
  );

  assert.deepEqual([...sharedList].sort(), [...contractStatuses].sort());

  // У каждого статуса есть подпись — иначе в интерфейсе вылезет сырой код.
  const labelsBlock = sharedStatuses.match(
    /export const ORDER_STATUS_LABEL_RU[^=]*= \{([\s\S]*?)\n\};/,
  );
  assert.ok(labelsBlock, "ORDER_STATUS_LABEL_RU в shared-lib не найден");
  const labelled = [...labelsBlock[1].matchAll(/\[(ORDER_STATUS_[A-Z_]+)\]: "/g)].map(
    ([, name]) => statusValueByConstName[name],
  );
  assert.deepEqual([...labelled].sort(), [...contractStatuses].sort());
});

test("в продажах shipped — «Отгружен», кнопка — «Отгрузить»", () => {
  const mobileCopy = read("shared/config/appUiCopy.ts");
  const clientOrdersCopy = read(join("..", "client/src/shared/config/copy/orders.js"));
  const mobileResolve = read("entities/order/lib/resolveOrderStatusLabelRu.ts");
  const clientResolve = read(
    join("..", "client/src/entities/order/lib/resolveOrderStatusLabelRu.js"),
  );
  const salesToolbar = read("features/my-sales-page/ui/MySalesPageToolbar.tsx");

  assert.match(sharedStatuses, /\[ORDER_STATUS_SHIPPED\]: "Отправлен"/);
  assert.match(sharedStatuses, /\[ORDER_STATUS_SHIPPED\]: "Отгружен"/);
  // «Принят» — отдельная ступень лестницы, а не подпись shipped.
  assert.match(sharedStatuses, /\[ORDER_STATUS_ACCEPTED\]: "Принят"/);
  assert.match(mobileCopy, /ACTION_SHIPPED: "Отгрузить"/);
  assert.match(clientOrdersCopy, /ACTION_SHIPPED: "Отгрузить"/);
  assert.match(mobileResolve, /attentionRole === "seller"/);
  assert.match(clientResolve, /attentionRole === "seller"/);
  assert.match(salesToolbar, /SALES_ORDER_STATUS_LABEL_RU/);
});

test("цвета бейджа статуса совпадают с OrderCard.css сайта", () => {
  const css = read(join("..", "client/src/entities/order/ui/OrderCard.css"));
  const mobilePalette = read("entities/order/lib/resolveOrderStatusBadgeStyle.ts");

  const webColorByStatus = {};
  for (const [, selectors, body] of css.matchAll(
    /((?:\.order-card__status_[a-z_]+,?\s*)+)\{([^}]*)\}/g,
  )) {
    const background = body.match(/--order-status-bg:\s*(#[0-9a-f]{6})/i)?.[1];
    if (!background) continue;
    for (const [, status] of selectors.matchAll(/\.order-card__status_([a-z_]+)/g)) {
      webColorByStatus[status] = background.toLowerCase();
    }
  }

  const mobileColorByStatus = Object.fromEntries(
    [
      ...mobilePalette.matchAll(
        /\[(ORDER_STATUS_[A-Z_]+)\]: solid\("(#[0-9a-f]{6})"/gi,
      ),
    ].map(([, name, color]) => [statusValueByConstName[name], color.toLowerCase()]),
  );

  const statuses = Object.values(statusValueByConstName).sort();
  assert.deepEqual(Object.keys(mobileColorByStatus).sort(), statuses);
  for (const status of statuses) {
    assert.equal(
      mobileColorByStatus[status],
      webColorByStatus[status],
      `цвет статуса ${status} разошёлся с сайтом`,
    );
  }
});
