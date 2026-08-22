import assert from "node:assert/strict";
import test from "node:test";
import { ORDER_FULFILLMENT_DELIVERY, ORDER_FULFILLMENT_PICKUP } from "@molha/api-contract";

import { resolveInstallmentDeliveryFromSheet } from "./resolveInstallmentDeliveryFromSheet.js";

test("installment pickup maps product pickup address into deliveryAddress", () => {
  const resolved = resolveInstallmentDeliveryFromSheet(
    {
      fulfillmentMethod: ORDER_FULFILLMENT_PICKUP,
      deliveryAddress: "",
      deliveryAddressFlat: "",
      paymentMethod: "cashOnDelivery",
    },
    { productPickupAddress: "г Грозный, ул Кишиевой, д 28А" },
  );
  assert.equal(resolved.deliveryAddress, "г Грозный, ул Кишиевой, д 28А");
  assert.equal(resolved.deliveryAddressFlat, "");
});

test("installment delivery keeps sheet address", () => {
  const resolved = resolveInstallmentDeliveryFromSheet(
    {
      fulfillmentMethod: ORDER_FULFILLMENT_DELIVERY,
      deliveryAddress: "Москва, Тверская 1",
      deliveryAddressFlat: "12",
      paymentMethod: "cashOnDelivery",
    },
    { productPickupAddress: "ignored" },
  );
  assert.equal(resolved.deliveryAddress, "Москва, Тверская 1");
  assert.equal(resolved.deliveryAddressFlat, "12");
});
