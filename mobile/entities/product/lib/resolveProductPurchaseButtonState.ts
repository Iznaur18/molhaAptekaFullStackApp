import { isCartDealType, isProductPurchasableViaCart } from "@molha/api-contract";

import { getProductPurchaseLimit } from "./getProductPurchaseLimit";
import { isProductOutOfStock } from "./isProductOutOfStock";
import { resolveProductOutOfStockOverlayLabel } from "./resolveProductOutOfStockOverlayLabel";
import { resolveProductPurchaseBlockState } from "./resolveProductPurchaseBlockState";
import { resolveProductSellerClosedPurchaseState } from "./resolveProductSellerClosedPurchaseState";

type PurchaseProduct = Record<string, unknown> | null | undefined;

/**
 * Какую кнопку показать на карточке главного экрана: «В корзину», состояние
 * вместо неё («Свой товар», «Вы заблокированы», «Нет в наличии», «У нас
 * закрыто») или заявку у авто, недвижимости и услуг. Паритет web
 * `resolveProductPurchaseButtonState` + `showDealButton` из
 * `useProductCardChromeFlags`.
 */
export const resolveProductPurchaseButtonState = ({
  product,
  isOwnProduct,
}: {
  product: PurchaseProduct;
  isOwnProduct: boolean;
}) => {
  const hasProduct = product?._id != null;
  const purchaseLimit = product ? getProductPurchaseLimit(product) : 0;
  const isOutOfStock = product ? isProductOutOfStock(product) : false;
  const { isPurchaseBlocked, blockedLabel } = resolveProductPurchaseBlockState(product);
  const { isSellerClosed, closedLabel } =
    resolveProductSellerClosedPurchaseState(product);

  // Авто, недвижимость и услуги в корзину не кладут: «Нет в наличии» и
  // «У нас закрыто» — про заказ, у них этих кнопок нет.
  const viaCart = isProductPurchasableViaCart(product);

  const canShowAddToCart =
    viaCart &&
    hasProduct &&
    !isOwnProduct &&
    purchaseLimit > 0 &&
    !isOutOfStock &&
    !isPurchaseBlocked &&
    !isSellerClosed;
  const showOutOfStockPurchaseButton =
    viaCart && hasProduct && !isOwnProduct && isOutOfStock;
  const showBlockedPurchaseButton = hasProduct && !isOwnProduct && isPurchaseBlocked;
  const showSellerClosedPurchaseButton =
    viaCart &&
    hasProduct &&
    !isOwnProduct &&
    isSellerClosed &&
    !isPurchaseBlocked &&
    !isOutOfStock;
  const showOwnProductPurchaseButton = hasProduct && isOwnProduct;
  const hasPurchaseButton =
    canShowAddToCart ||
    showOutOfStockPurchaseButton ||
    showBlockedPurchaseButton ||
    showSellerClosedPurchaseButton ||
    showOwnProductPurchaseButton;
  // На месте «В корзину» — заявка, иначе карточка внизу пустая и ниже соседних.
  const showDealButton =
    hasProduct && !isOwnProduct && !isCartDealType(product?.productDealType);

  return {
    canShowAddToCart,
    showOutOfStockPurchaseButton,
    showBlockedPurchaseButton,
    showSellerClosedPurchaseButton,
    showOwnProductPurchaseButton,
    showDealButton,
    hasPurchaseButton,
    outOfStockPurchaseLabel: product
      ? resolveProductOutOfStockOverlayLabel(product)
      : "",
    blockedPurchaseLabel: blockedLabel,
    sellerClosedPurchaseLabel: closedLabel,
  };
};
