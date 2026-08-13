import { useEnterExitMountAnimation } from "../../../shared/lib/useEnterExitMountAnimation.js";

export const WHOLESALE_PRICE_SHEET_ANIMATION = {
  enterMs: 280,
  exitMs: 220,
};

/**
 * @param {boolean} isOpen
 * @returns {{ mounted: boolean; isVisible: boolean }}
 */
export function useWholesalePriceSheetAnimation(isOpen) {
  return useEnterExitMountAnimation(isOpen, {
    exitMs: WHOLESALE_PRICE_SHEET_ANIMATION.exitMs,
  });
}
