import { ProductDealActions } from "@/entities/deal-request/ui/ProductDealActions";
import { isCurrentUserProductSeller } from "@/entities/product/lib/isCurrentUserProductSeller";
import { resolveProductPurchaseButtonState } from "@/entities/product/lib/resolveProductPurchaseButtonState";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { AddToCartButton } from "@/features/cart-add/ui/AddToCartButton";
import { ADD_TO_CART_UI } from "@/shared/config";
import { BlockedPurchaseButton } from "@/shared/ui/BlockedPurchaseButton";

type ProductCardPurchaseActionProps = {
  product: Record<string, unknown> & { _id: string };
};

/**
 * Кнопка внизу карточки главного экрана — паритет web `ProductCardPurchaseButton`:
 * та же, что в окне товара. Гость видит «В корзину», нажатие ведёт на вход.
 * У авто, недвижимости и услуг на этом месте — «Записаться» / «Оставить заявку».
 */
export const ProductCardPurchaseAction = ({
  product,
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
    return <ProductDealActions product={product} isOwnProduct={false} variant="card" />;
  }
  if (state.showOwnProductPurchaseButton) {
    return <BlockedPurchaseButton label={ADD_TO_CART_UI.OWN_PRODUCT} variant="card" />;
  }
  if (state.showBlockedPurchaseButton) {
    return <BlockedPurchaseButton label={state.blockedPurchaseLabel} variant="card" />;
  }
  if (state.showOutOfStockPurchaseButton) {
    return (
      <BlockedPurchaseButton
        label={state.outOfStockPurchaseLabel || ADD_TO_CART_UI.OUT_OF_STOCK}
        variant="card"
      />
    );
  }
  if (state.showSellerClosedPurchaseButton) {
    return (
      <BlockedPurchaseButton label={state.sellerClosedPurchaseLabel} variant="card" />
    );
  }
  if (!state.canShowAddToCart) {
    return null;
  }
  return <AddToCartButton productId={product._id} product={product} variant="card" />;
};

/** Стабильная ссылка для `ProductCard.renderPurchaseAction` (не ломает memo). */
export const renderProductCardPurchaseAction = (
  product: Record<string, unknown> & { _id: string },
) => <ProductCardPurchaseAction product={product} />;
