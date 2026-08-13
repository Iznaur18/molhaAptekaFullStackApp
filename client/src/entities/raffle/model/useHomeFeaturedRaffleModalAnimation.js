import { useEnterExitMountAnimation } from "../../../shared/lib/useEnterExitMountAnimation.js";
import { HOME_FEATURED_RAFFLE_MODAL_ANIMATION } from "../lib/homeFeaturedRaffleModalAnimation.js";

/**
 * @param {boolean} isOpen
 * @returns {{ mounted: boolean; isVisible: boolean }}
 */
export function useHomeFeaturedRaffleModalAnimation(isOpen) {
  return useEnterExitMountAnimation(isOpen, {
    exitMs: HOME_FEATURED_RAFFLE_MODAL_ANIMATION.exitMs,
  });
}
