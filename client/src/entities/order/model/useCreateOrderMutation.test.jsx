import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";
import { buildTestOrder } from "../../../test/fixtures/apiFixtures.js";

const createOrderMock = vi.fn();
const invalidateOrderQueriesMock = vi.fn();

vi.mock("../api/createOrder.js", () => ({
  createOrder: (...args) => createOrderMock(...args),
}));

vi.mock("../lib/orderQueryCache.js", () => ({
  invalidateOrderQueries: (...args) => invalidateOrderQueriesMock(...args),
}));

const { useCreateOrderMutation } = await import("./useCreateOrderMutation.js");

function createQueryWrapper(queryClient) {
  return function QueryWrapper({ children }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useCreateOrderMutation", () => {
  beforeEach(() => {
    createOrderMock.mockReset();
    invalidateOrderQueriesMock.mockReset();
  });

  it("mutates order and invalidates order queries on success", async () => {
    const order = buildTestOrder();
    createOrderMock.mockResolvedValue(order);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCreateOrderMutation(), {
      wrapper: createQueryWrapper(queryClient),
    });

    const payload = {
      items: [{ productId: "507f1f77bcf86cd799439012", quantity: 1 }],
      deliveryAddress: "г Москва, ул Тестовая, д 1",
      deliveryAddressFlat: "",
      paymentMethod: "cardPrepaid",
    };

    result.current.mutate(payload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(createOrderMock.mock.calls[0][0]).toEqual(payload);
    expect(invalidateOrderQueriesMock).toHaveBeenCalledWith(queryClient);
    expect(result.current.data).toEqual(order);
  });
});
