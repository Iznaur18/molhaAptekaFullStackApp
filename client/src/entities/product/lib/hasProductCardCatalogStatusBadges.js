/**
 * @param {ReturnType<import('../ui/product-card/useProductCardViewModel.js').useProductCardViewModel>} vm
 */
export function shouldShowProductCardStatusSlot(vm) {
  if (
    vm.isMineMode &&
    !vm.isModerationQueue &&
    (vm.product.productIsAvailable === false || vm.purchaseLimit === 0)
  ) {
    return true;
  }

  if (!vm.isMineMode && !vm.isModerationQueue && vm.product.productIsAvailable === false) {
    return true;
  }

  if (vm.isMineMode && vm.isPromotionActive) {
    return true;
  }

  if (vm.isMineMode && vm.isLoyaltyPointsOvercommitted) {
    return true;
  }

  return false;
}

/**
 * @param {ReturnType<import('../ui/product-card/useProductCardViewModel.js').useProductCardViewModel>} vm
 */
export function hasProductCardCatalogStatusBadges(vm) {
  return (
    shouldShowProductCardStatusSlot(vm) ||
    Boolean(vm.nearDistanceLabel) ||
    vm.showAuctionBadge ||
    vm.showInstallmentBadge ||
    vm.showWholesaleBadge ||
    vm.showFlashSaleBadge ||
    vm.showRaffleBadge ||
    vm.showAffiliateBadge
  );
}
