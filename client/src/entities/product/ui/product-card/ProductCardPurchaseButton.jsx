import { ADD_TO_CART_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductDealActions } from "../../../deal-request/ui/ProductDealActions.jsx";
import { ProductPurchaseCartButton } from "../ProductPurchaseCartButton.jsx";

/**
 * Кнопка покупки на карточке — та же, что в окне товара. Гость видит
 * «В корзину», нажатие открывает вход. У авто, недвижимости и услуг на этом
 * месте — кнопка заявки.
 *
 * @param {{
 *   vm: ReturnType<import('./useProductCardViewModel.js').useProductCardViewModel>;
 * }} props
 */
export function ProductCardPurchaseButton({ vm }) {
  if (vm.showDealButton) {
    return (
      <ProductDealActions
        product={vm.product}
        isAuthorized={vm.isAuthorized}
        isOwnProduct={false}
        onRequestLogin={vm.onRequestLoginAddToCart}
        variant="card"
      />
    );
  }

  if (!vm.showAddToCartButton || !vm.purchaseButtonState) {
    return null;
  }

  return (
    <ProductPurchaseCartButton
      {...vm.purchaseButtonState}
      productId={String(vm.product._id)}
      isAuthorized={vm.isAuthorized}
      onRequestLogin={vm.onRequestLoginAddToCart}
      guestLabel={ADD_TO_CART_UI.ADD}
    />
  );
}
