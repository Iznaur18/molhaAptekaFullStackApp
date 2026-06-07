import { PRODUCT_CARD_UI } from "../../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   vm: ReturnType<import('./useProductCardViewModel.js').useProductCardViewModel>;
 * }} props
 */
export function ProductCardStatusSlot({ vm }) {
  if (
    vm.isMineMode &&
    !vm.isModerationQueue &&
    (vm.product.productIsAvailable === false || vm.purchaseLimit === 0)
  ) {
    return (
      <p className="product-card__hidden-badge" role="status">
        {PRODUCT_CARD_UI.HIDDEN_FROM_CATALOG_BADGE}
      </p>
    );
  }

  if (!vm.isMineMode && !vm.isModerationQueue && vm.product.productIsAvailable === false) {
    return (
      <p className="product-card__hidden-badge" role="status">
        {PRODUCT_CARD_UI.HIDDEN_FROM_CATALOG_BADGE}
      </p>
    );
  }

  if (vm.isMineMode && vm.isPromotionActive) {
    return (
      <p className="product-card__promotion-badge" role="status">
        {PRODUCT_CARD_UI.PROMOTED_TIER_UNTIL(
          vm.getPromotionTierLabel(),
          vm.getPromotionUntil(),
        )}
      </p>
    );
  }

  if (vm.isMineMode && vm.isLoyaltyPointsOvercommitted) {
    return (
      <p className="product-card__loyalty-overcommitted-badge" role="alert">
        {PRODUCT_CARD_UI.LOYALTY_POINTS_OVERCOMMITTED_BADGE}
      </p>
    );
  }

  return null;
}
