import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { HeaderCircleIconButton } from "../../../shared/ui/HeaderCircleIconButton/index.js";
import { SlidersHorizontal } from "../../../shared/ui/icon/index.js";

/**
 * @param {{
 *   isOpen: boolean;
 *   listId: string;
 *   onClick: () => void;
 *   isFilterActive?: boolean;
 * }} props
 */
export function CatalogFiltersButton({
  isOpen,
  listId,
  onClick,
  isFilterActive = false,
}) {
  const ariaLabel = isFilterActive
    ? HOME_PAGE_UI.CATALOG_FILTER_BUTTON_ARIA_ACTIVE
    : HOME_PAGE_UI.CATALOG_FILTER_BUTTON_ARIA;

  return (
    <HeaderCircleIconButton
      onClick={onClick}
      isActive={isOpen || isFilterActive}
      ariaLabel={ariaLabel}
      icon={SlidersHorizontal}
      ariaExpanded={isOpen}
      ariaControls={listId}
    />
  );
}
