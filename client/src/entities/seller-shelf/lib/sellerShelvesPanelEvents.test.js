import { describe, expect, it, vi } from "vitest";

import {
  requestSellerShelvesPanelExpand,
  SELLER_SHELVES_EXPAND_EVENT,
} from "./sellerShelvesPanelEvents.js";

describe("sellerShelvesPanelEvents", () => {
  it("dispatches expand event on window", () => {
    const onExpand = vi.fn();
    window.addEventListener(SELLER_SHELVES_EXPAND_EVENT, onExpand);
    try {
      requestSellerShelvesPanelExpand();
      expect(onExpand).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener(SELLER_SHELVES_EXPAND_EVENT, onExpand);
    }
  });
});
