import { ADD_TO_CART_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductPurchaseCartButton } from "../ProductPurchaseCartButton.jsx";

/**
 * Кнопка покупки на карточке — та же, что в окне товара. Гость видит
 * «В корзину», нажатие открывает вход.
 *
 * @param {{
 *   vm: ReturnType<import('./useProductCardViewModel.js').useProductCardViewModel>;
 * }} props
 */
export function ProductCardPurchaseButton({ vm }) {
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
