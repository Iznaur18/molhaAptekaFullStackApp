import { ProductDealActions } from "@/entities/deal-request/ui/ProductDealActions";
import { isCurrentUserProductSeller } from "@/entities/product/lib/isCurrentUserProductSeller";
import { resolveProductPurchaseButtonState } from "@/entities/product/lib/resolveProductPurchaseButtonState";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { AddToCartButton } from "@/features/cart-add/ui/AddToCartButton";
import { ADD_TO_CART_UI } from "@/shared/config";
import { BlockedPurchaseButton } from "@/shared/ui/BlockedPurchaseButton";

/** `card` — обычная карточка ленты, `banner` — широкий баннер 3-го уровня. */
export type ProductCardPurchasePlacement = "card" | "banner";

type ProductCardPurchaseActionProps = {
  product: Record<string, unknown> & { _id: string };
  placement?: ProductCardPurchasePlacement;
};

/**
 * Кнопка внизу карточки главного экрана — паритет web `ProductCardPurchaseButton`:
 * та же, что в окне товара. Гость видит «В корзину», нажатие ведёт на вход.
 * У авто, недвижимости и услуг на этом месте — «Записаться» / «Оставить заявку».
 */
export const ProductCardPurchaseAction = ({
  product,
  placement = "card",
}: ProductCardPurchaseActionProps) => {
  const sessionQuery = useAuthSessionQuery();
  const currentUserId = sessionQuery.data?.user?._id ?? null;

  // Скрытый продавцом товар — без кнопки, как на сайте.
  if (product.productIsAvailable === false) {
    return null;
  }

  const state = resolveProductPurchaseButtonState({
    product,
    isOwnProduct: isCurrentUserProductSeller(product, currentUserId),
  });

  if (state.showDealButton) {
    return (
      <ProductDealActions product={product} isOwnProduct={false} variant={placement} />
    );
  }
  if (state.showOwnProductPurchaseButton) {
    return (
      <BlockedPurchaseButton label={ADD_TO_CART_UI.OWN_PRODUCT} variant={placement} />
    );
  }
  if (state.showBlockedPurchaseButton) {
    return (
      <BlockedPurchaseButton label={state.blockedPurchaseLabel} variant={placement} />
    );
  }
  if (state.showOutOfStockPurchaseButton) {
    return (
      <BlockedPurchaseButton
        label={state.outOfStockPurchaseLabel || ADD_TO_CART_UI.OUT_OF_STOCK}
        variant={placement}
      />
    );
  }
  if (state.showSellerClosedPurchaseButton) {
    return (
      <BlockedPurchaseButton
        label={state.sellerClosedPurchaseLabel}
        variant={placement}
      />
    );
  }
  if (!state.canShowAddToCart) {
    return null;
  }
  return (
    <AddToCartButton productId={product._id} product={product} variant={placement} />
  );
};

/** Стабильная ссылка для `ProductCard.renderPurchaseAction` (не ломает memo). */
export const renderProductCardPurchaseAction = (
  product: Record<string, unknown> & { _id: string },
  placement: ProductCardPurchasePlacement = "card",
) => <ProductCardPurchaseAction product={product} placement={placement} />;
