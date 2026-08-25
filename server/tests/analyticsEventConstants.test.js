import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ANALYTICS_EVENT_ORDER_ITEM_SOLD,
  ANALYTICS_EVENT_PRODUCT_VIEWED,
  ANALYTICS_EVENT_TYPES,
} from "../constants/analyticsEventConstants.js";
import { computeProductSoldQuantityDelta } from "../services/product/productSoldQuantityDenorm.js";
import {
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
} from "../constants/orderConstants.js";

test("analytics event types include core Level-2 set", () => {
  assert.ok(ANALYTICS_EVENT_TYPES.includes(ANALYTICS_EVENT_PRODUCT_VIEWED));
  assert.ok(ANALYTICS_EVENT_TYPES.includes(ANALYTICS_EVENT_ORDER_ITEM_SOLD));
  assert.equal(ANALYTICS_EVENT_TYPES.length, 6);
});

test("sold delta still increments shipped → delivered", () => {
  assert.equal(
    computeProductSoldQuantityDelta(ORDER_STATUS_SHIPPED, ORDER_STATUS_DELIVERED, 2),
    2,
  );
});
