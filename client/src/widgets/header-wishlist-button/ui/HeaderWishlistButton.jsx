import { useWishlist } from "../../../entities/wishlist/model/useWishlist.js";
import { HEADER_WISHLIST_BUTTON_UI } from "../../../shared/config/appUiCopy.js";
import { HeaderCircleIconButton } from "../../../shared/ui/HeaderCircleIconButton/index.js";
import { Heart } from "../../../shared/ui/icon/index.js";

/**
 * @param {{ onClick: () => void; isActive?: boolean }} props
 */
export function HeaderWishlistButton({ onClick, isActive = false }) {
  const { totalCount } = useWishlist();
  const hasItems = totalCount > 0;

  return (
    <HeaderCircleIconButton
      onClick={onClick}
      isActive={isActive}
      ariaLabel={HEADER_WISHLIST_BUTTON_UI.ARIA}
      icon={Heart}
      badgeContent={hasItems ? totalCount : null}
      badgeAriaLabel={hasItems ? HEADER_WISHLIST_BUTTON_UI.COUNT_ARIA : undefined}
      badgeVariant="count"
    />
  );
}
