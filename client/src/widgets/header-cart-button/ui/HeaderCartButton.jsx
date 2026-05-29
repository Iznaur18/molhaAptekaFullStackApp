import { useCart } from "../../../entities/cart/model/useCart.js";
import { HEADER_CART_BUTTON_UI } from "../../../shared/config/appUiCopy.js";
import { HeaderCircleIconButton } from "../../../shared/ui/HeaderCircleIconButton/index.js";
import { ShoppingCart } from "../../../shared/ui/icon/index.js";

/**
 * Кнопка-индикатор корзины в шапке. Показывает бейдж с числом позиций.
 *
 * @param {{ onClick: () => void; isActive?: boolean }} props
 */
export function HeaderCartButton({ onClick, isActive = false }) {
  const { totalCount } = useCart();
  const hasItems = totalCount > 0;

  return (
    <HeaderCircleIconButton
      onClick={onClick}
      isActive={isActive}
      ariaLabel={HEADER_CART_BUTTON_UI.ARIA}
      icon={ShoppingCart}
      badgeContent={hasItems ? totalCount : null}
      badgeAriaLabel={hasItems ? HEADER_CART_BUTTON_UI.COUNT_ARIA : undefined}
      badgeVariant="count"
    />
  );
}
