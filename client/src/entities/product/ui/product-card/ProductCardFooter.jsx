import { AddToCartButton } from "../../../../features/cart-add/ui/AddToCartButton.jsx";
import { PRODUCT_CARD_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductModerationDetailsFooter } from "../ProductModerationDetailsFooter.jsx";

/**
 * @param {{
 *   vm: ReturnType<import('./useProductCardViewModel.js').useProductCardViewModel>;
 *   sellerToolbar: import('react').ReactNode;
 *   stopCardDetailsActivation: (event: import('react').SyntheticEvent) => void;
 * }} props
 */
export function ProductCardFooter({ vm, sellerToolbar, stopCardDetailsActivation }) {
  if (!vm.showFooterActions) {
    return null;
  }

  return (
    <div
      className="product-card__footer-actions"
      aria-label={PRODUCT_CARD_UI.FOOTER_ACTIONS_ARIA}
      onClick={stopCardDetailsActivation}
      onKeyDown={stopCardDetailsActivation}
    >
      {vm.isModerationQueue && vm.moderationActions ? (
        <ProductModerationDetailsFooter
          rejectComment={vm.moderationActions.rejectComment}
          onRejectCommentChange={vm.moderationActions.onRejectCommentChange}
          onApprove={vm.moderationActions.onApprove}
          onReject={vm.moderationActions.onReject}
          isBusy={vm.moderationActions.isBusy}
          errorMessage={vm.moderationActions.errorMessage}
        />
      ) : null}
      {sellerToolbar}
      {vm.showAddToCartButton ? (
        <AddToCartButton
          productId={String(vm.product._id)}
          isAuthorized={vm.isAuthorized}
          onRequestLogin={vm.onRequestLoginAddToCart}
          maxQuantity={vm.purchaseLimit}
        />
      ) : null}
    </div>
  );
}
