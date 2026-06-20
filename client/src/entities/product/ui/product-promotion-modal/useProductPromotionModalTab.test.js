import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  PRODUCT_PROMOTION_MODAL_DEFAULT_TAB,
  PRODUCT_PROMOTION_MODAL_TAB_MANAGE,
  PRODUCT_PROMOTION_MODAL_TAB_PROMOTION,
} from "./productPromotionModalTabs.js";
import { useProductPromotionModalTab } from "./useProductPromotionModalTab.js";

describe("useProductPromotionModalTab", () => {
  it("starts on promotion tab", () => {
    const { result } = renderHook(() =>
      useProductPromotionModalTab({ isOpen: true, showManageTab: true }),
    );

    expect(result.current.activeTabId).toBe(PRODUCT_PROMOTION_MODAL_DEFAULT_TAB);
    expect(result.current.isPromotionTab).toBe(true);
    expect(result.current.isManageTab).toBe(false);
  });

  it("switches to manage tab", () => {
    const { result } = renderHook(() =>
      useProductPromotionModalTab({ isOpen: true, showManageTab: true }),
    );

    act(() => {
      result.current.setActiveTabId(PRODUCT_PROMOTION_MODAL_TAB_MANAGE);
    });

    expect(result.current.activeTabId).toBe(PRODUCT_PROMOTION_MODAL_TAB_MANAGE);
    expect(result.current.isManageTab).toBe(true);
  });

  it("resets to promotion when modal closes", () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) => useProductPromotionModalTab({ isOpen, showManageTab: true }),
      { initialProps: { isOpen: true } },
    );

    act(() => {
      result.current.setActiveTabId(PRODUCT_PROMOTION_MODAL_TAB_MANAGE);
    });

    rerender({ isOpen: false });
    rerender({ isOpen: true });

    expect(result.current.activeTabId).toBe(PRODUCT_PROMOTION_MODAL_TAB_PROMOTION);
  });

  it("falls back to promotion when manage tab is hidden", () => {
    const { result, rerender } = renderHook(
      ({ showManageTab }) =>
        useProductPromotionModalTab({ isOpen: true, showManageTab }),
      { initialProps: { showManageTab: true } },
    );

    act(() => {
      result.current.setActiveTabId(PRODUCT_PROMOTION_MODAL_TAB_MANAGE);
    });

    rerender({ showManageTab: false });

    expect(result.current.activeTabId).toBe(PRODUCT_PROMOTION_MODAL_TAB_PROMOTION);
  });
});
