import { useCallback } from "react";

import { PRODUCT_CARD_UI } from "../../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   vm: ReturnType<import('./useProductCardViewModel.js').useProductCardViewModel>;
 * }} params
 */
export function useProductCardDetailsSurface({ vm }) {
  const detailsSurfaceLabel = `${PRODUCT_CARD_UI.OPEN_DETAILS_ARIA} ${vm.heading}`;

  const handleOpenDetails = useCallback(() => {
    vm.onOpenDetails?.(vm.product);
  }, [vm.onOpenDetails, vm.product]);

  const handleDetailsSurfaceKeyDown = useCallback(
    /** @param {import('react').KeyboardEvent<HTMLDivElement>} event */
    (event) => {
      if (vm.isModerationQueue || vm.onOpenDetails == null) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      vm.onOpenDetails(vm.product);
    },
    [vm.isModerationQueue, vm.onOpenDetails, vm.product],
  );

  const stopCardDetailsActivation = useCallback(
    /** @param {import('react').SyntheticEvent} event */
    (event) => {
      event.stopPropagation();
    },
    [],
  );

  return {
    detailsSurfaceLabel,
    handleOpenDetails,
    handleDetailsSurfaceKeyDown,
    stopCardDetailsActivation,
  };
}
