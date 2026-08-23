import { describe, expect, it } from "vitest";
import {
  ORDER_FULFILLMENT_DELIVERY,
  ORDER_FULFILLMENT_PICKUP,
} from "@molha/api-contract";

import { resolveInstallmentDeliveryFromSheet } from "./resolveInstallmentDeliveryFromSheet.js";

describe("resolveInstallmentDeliveryFromSheet", () => {
  it("installment pickup maps product pickup address into deliveryAddress", () => {
    const resolved = resolveInstallmentDeliveryFromSheet(
      {
        fulfillmentMethod: ORDER_FULFILLMENT_PICKUP,
        deliveryAddress: "",
        deliveryAddressFlat: "",
        paymentMethod: "cashOnDelivery",
      },
      { productPickupAddress: "г Грозный, ул Кишиевой, д 28А" },
    );
    expect(resolved.deliveryAddress).toBe("г Грозный, ул Кишиевой, д 28А");
    expect(resolved.deliveryAddressFlat).toBe("");
  });

  it("installment delivery keeps sheet address", () => {
    const resolved = resolveInstallmentDeliveryFromSheet(
      {
        fulfillmentMethod: ORDER_FULFILLMENT_DELIVERY,
        deliveryAddress: "Москва, Тверская 1",
        deliveryAddressFlat: "12",
        paymentMethod: "cashOnDelivery",
      },
      { productPickupAddress: "ignored" },
    );
    expect(resolved.deliveryAddress).toBe("Москва, Тверская 1");
    expect(resolved.deliveryAddressFlat).toBe("12");
  });
});
