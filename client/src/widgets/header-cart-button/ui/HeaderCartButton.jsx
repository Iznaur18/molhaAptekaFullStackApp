import { useCart } from "../../../entities/cart/model/useCart.js";
import { useMyAcceptedBidsQuery } from "../../../entities/product-price-offer/model/useMyAcceptedBidsQuery.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { HEADER_CART_BUTTON_UI } from "../../../shared/config/appUiCopy.js";
import { HeaderCircleIconButton } from "../../../shared/ui/HeaderCircleIconButton/index.js";
import { ShoppingCart } from "../../../shared/ui/icon/index.js";

/**
 * Кнопка-индикатор корзины в шапке. Показывает бейдж с числом позиций:
 * обычные товары плюс выигранные аукционные лоты, ожидающие оплаты.
 *
 * @param {{ onClick: () => void; isActive?: boolean }} props
 */
export function HeaderCartButton({ onClick, isActive = false }) {
  const { totalCount } = useCart();
  const { isAuthorized } = useAuthSession();
  const acceptedBidsQuery = useMyAcceptedBidsQuery({ enabled: isAuthorized });

  const count = totalCount + (acceptedBidsQuery.data?.length ?? 0);
  const hasItems = count > 0;

  return (
    <HeaderCircleIconButton
      onClick={onClick}
      isActive={isActive}
      ariaLabel={HEADER_CART_BUTTON_UI.ARIA}
      icon={ShoppingCart}
      badgeContent={hasItems ? count : null}
      badgeAriaLabel={hasItems ? HEADER_CART_BUTTON_UI.COUNT_ARIA : undefined}
      badgeVariant="count"
    />
  );
}
