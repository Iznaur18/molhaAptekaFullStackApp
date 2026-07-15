import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const read = (relativePath) => readFileSync(join(ROOT, relativePath), "utf8");

test("sales shipped status and action copy is Принять", () => {
  const mobileConstants = read("entities/order/model/constants.ts");
  const clientConstants = read(
    join("..", "client/src/entities/order/model/constants.js"),
  );
  const mobileCopy = read("shared/config/appUiCopy.ts");
  const clientCopy = read(join("..", "client/src/shared/config/appUiCopy.js"));
  const mobileResolve = read("entities/order/lib/resolveOrderStatusLabelRu.ts");
  const clientResolve = read(
    join("..", "client/src/entities/order/lib/resolveOrderStatusLabelRu.js"),
  );
  const salesToolbar = read("features/my-sales-page/ui/MySalesPageToolbar.tsx");

  assert.match(mobileConstants, /SALES_ORDER_STATUS_LABEL_RU/);
  assert.match(mobileConstants, /\[ORDER_STATUS_SHIPPED\]: "Принять"/);
  assert.match(mobileConstants, /\[ORDER_STATUS_SHIPPED\]: "Отправлен"/);
  assert.match(clientConstants, /SALES_ORDER_STATUS_LABEL_RU/);
  assert.match(clientConstants, /\[ORDER_STATUS_SHIPPED\]: "Принять"/);
  assert.match(mobileCopy, /ACTION_SHIPPED: "Принять"/);
  assert.match(clientCopy, /ACTION_SHIPPED: "Принять"/);
  assert.doesNotMatch(mobileCopy, /ACTION_SHIPPED: "Отправлен"/);
  assert.match(mobileResolve, /attentionRole === "seller"/);
  assert.match(clientResolve, /attentionRole === "seller"/);
  assert.match(salesToolbar, /SALES_ORDER_STATUS_LABEL_RU/);
  assert.match(clientCopy, /SUBMITTED_LABEL: "Отправлено"/);
});
