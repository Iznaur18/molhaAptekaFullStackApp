import { PRODUCT_CARD_UI } from "../../../../shared/config/appUiCopy.js";
import { isProductPromoteButtonDisabled } from "../../lib/isProductPromoteButtonDisabled.js";

/**
 * @param {{
 *   vm: ReturnType<import('./useProductCardViewModel.js').useProductCardViewModel>;
 * }} props
 */
export function ProductCardSellerToolbar({ vm }) {
  if (vm.onDeleteProduct == null) {
    return null;
  }

  const promoteDisabled = isProductPromoteButtonDisabled({
    productIsAvailable: vm.product.productIsAvailable,
    isDeletePending: vm.isDeletePending,
    isAvailabilityTogglePending: vm.isAvailabilityTogglePending,
    isAuctionTogglePending: vm.isAuctionTogglePending,
  });

  return (
    <div className="product-card__seller-toolbar">
      {vm.onPromoteProduct ? (
        <button
          type="button"
          className="product-card__promote"
          disabled={promoteDisabled}
          onClick={(event) => {
            event.stopPropagation();
            vm.onPromoteProduct?.(vm.product);
          }}
        >
          {PRODUCT_CARD_UI.PROMOTION_BUTTON}
        </button>
      ) : null}
      {vm.onEditProduct && vm.sellerCanEdit ? (
        <button
          type="button"
          className="product-card__edit"
          disabled={vm.isDeletePending}
          onClick={(event) => {
            event.stopPropagation();
            vm.onEditProduct?.(vm.product);
          }}
        >
          {PRODUCT_CARD_UI.EDIT_PRODUCT}
        </button>
      ) : null}
    </div>
  );
}
