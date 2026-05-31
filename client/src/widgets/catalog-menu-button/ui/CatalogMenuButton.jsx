import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { HeaderCircleIconButton } from "../../../shared/ui/HeaderCircleIconButton/index.js";
import { Menu } from "../../../shared/ui/icon/index.js";

/**
 * @param {{
 *   isActive?: boolean;
 *   onClick: () => void;
 * }} props
 */
export function CatalogMenuButton({ isActive = false, onClick }) {
  return (
    <HeaderCircleIconButton
      onClick={onClick}
      isActive={isActive}
      ariaLabel={HOME_PAGE_UI.CATALOG_MENU_BUTTON_ARIA}
      icon={Menu}
    />
  );
}
