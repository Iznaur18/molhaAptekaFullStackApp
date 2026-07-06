import { HEADER_PLACE_PRODUCT_BUTTON_UI } from "../../../shared/config/appUiCopy.js";
import { HeaderCircleIconButton } from "../../../shared/ui/HeaderCircleIconButton/index.js";
import { Plus } from "../../../shared/ui/icon/index.js";

/**
 * @param {{ onClick: () => void; isLoginRequired?: boolean }} props
 */
export function HeaderPlaceProductButton({ onClick, isLoginRequired = false }) {
  const ariaLabel = isLoginRequired
    ? HEADER_PLACE_PRODUCT_BUTTON_UI.ARIA_LOGIN_REQUIRED
    : HEADER_PLACE_PRODUCT_BUTTON_UI.ARIA;

  return (
    <HeaderCircleIconButton
      onClick={onClick}
      ariaLabel={ariaLabel}
      icon={Plus}
      className="header-circle-button--cta"
    />
  );
}
