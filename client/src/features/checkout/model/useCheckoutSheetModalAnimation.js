import { useEnterExitMountAnimation } from "../../../shared/lib/useEnterExitMountAnimation.js";
import { CHECKOUT_SHEET_MODAL_ANIMATION } from "../lib/checkoutSheetModalAnimation.js";

/**
 * Паритет mobile checkout sheet: enter/exit через shared mount→paint→open.
 *
 * @param {boolean} isOpen
 * @returns {{ mounted: boolean; isVisible: boolean }}
 */
export function useCheckoutSheetModalAnimation(isOpen) {
  return useEnterExitMountAnimation(isOpen, {
    exitMs: CHECKOUT_SHEET_MODAL_ANIMATION.exitMs,
  });
}
