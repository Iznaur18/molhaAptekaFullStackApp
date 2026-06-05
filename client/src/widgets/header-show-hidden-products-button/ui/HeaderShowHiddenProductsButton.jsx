import { HEADER_SHOW_HIDDEN_PRODUCTS_BUTTON_UI } from "../../../shared/config/appUiCopy.js";
import { HeaderCircleIconButton } from "../../../shared/ui/HeaderCircleIconButton/index.js";
import { Eye } from "../../../shared/ui/icon/index.js";

/**
 * @param {{
 *   isActive?: boolean;
 *   onClick: () => void;
 * }} props
 */
export function HeaderShowHiddenProductsButton({ isActive = false, onClick }) {
  const ariaLabel = isActive
    ? HEADER_SHOW_HIDDEN_PRODUCTS_BUTTON_UI.ARIA_ACTIVE
    : HEADER_SHOW_HIDDEN_PRODUCTS_BUTTON_UI.ARIA;

  return (
    <HeaderCircleIconButton
      onClick={onClick}
      isActive={isActive}
      ariaLabel={ariaLabel}
      ariaExpanded={isActive}
      icon={Eye}
    />
  );
}
