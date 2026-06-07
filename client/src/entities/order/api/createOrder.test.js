import { beforeEach, describe, expect, it, vi } from "vitest";

import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { buildTestOrder } from "../../../test/fixtures/apiFixtures.js";

const postMock = vi.fn();

vi.mock("../../../shared/api/index.js", () => ({
  apiClient: {
    post: (...args) => postMock(...args),
  },
}));

const { createOrder } = await import("./createOrder.js");

describe("createOrder", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("posts payload and returns parsed order", async () => {
    const order = buildTestOrder();
    postMock.mockResolvedValue({
      data: { success: true, data: { message: "Заказ создан", order } },
    });

    const payload = {
      items: [{ productId: "507f1f77bcf86cd799439012", quantity: 1 }],
      deliveryAddress: "г Москва, ул Тестовая, д 1",
      deliveryAddressFlat: "",
      paymentMethod: "cardPrepaid",
    };

    const result = await createOrder(payload);

    expect(postMock).toHaveBeenCalledWith("/order", payload);
    expect(result).toEqual(order);
  });

  it("throws API message from axios error", async () => {
    postMock.mockRejectedValue({
      response: { data: { message: "Недостаточно товара" } },
    });

    await expect(
      createOrder({
        items: [{ productId: "507f1f77bcf86cd799439012", quantity: 1 }],
        deliveryAddress: "г Москва",
        deliveryAddressFlat: "",
        paymentMethod: "cardPrepaid",
      }),
    ).rejects.toThrow("Недостаточно товара");
  });

  it("throws invalid response on broken envelope", async () => {
    postMock.mockResolvedValue({ data: { success: true, data: { order: { _id: "x" } } } });

    await expect(
      createOrder({
        items: [{ productId: "507f1f77bcf86cd799439012", quantity: 1 }],
        deliveryAddress: "г Москва",
        deliveryAddressFlat: "",
        paymentMethod: "cardPrepaid",
      }),
    ).rejects.toThrow(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
  });
});
