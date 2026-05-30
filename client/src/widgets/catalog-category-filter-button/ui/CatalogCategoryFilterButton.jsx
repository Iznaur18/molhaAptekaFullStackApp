import { PRODUCT_CATEGORY_LABEL_RU } from "../../../entities/product/model/productConstants.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { HeaderCircleIconButton } from "../../../shared/ui/HeaderCircleIconButton/index.js";
import { Menu } from "../../../shared/ui/icon/index.js";

/**
 * @param {{
 *   isOpen: boolean;
 *   selectedProductCategory: import("../../../entities/product/model/types.js").ProductCategory | null;
 *   listId: string;
 *   onClick: () => void;
 *   isFilterActive?: boolean;
 *   mode?: "category" | "catalog";
 * }} props
 */
export function CatalogCategoryFilterButton({
  isOpen,
  selectedProductCategory,
  listId,
  onClick,
  isFilterActive = false,
  mode = "category",
}) {
  const ariaLabel = (() => {
    if (mode === "catalog") {
      if (isFilterActive) {
        return HOME_PAGE_UI.CATALOG_FILTER_BUTTON_ARIA_ACTIVE;
      }
      return HOME_PAGE_UI.CATALOG_FILTER_BUTTON_ARIA;
    }
    if (selectedProductCategory) {
      return HOME_PAGE_UI.FILTER_BUTTON_ARIA_SELECTED(
        PRODUCT_CATEGORY_LABEL_RU[selectedProductCategory],
      );
    }
    return HOME_PAGE_UI.FILTER_BUTTON_ARIA;
  })();

  return (
    <HeaderCircleIconButton
      onClick={onClick}
      isActive={isOpen || isFilterActive || selectedProductCategory != null}
      ariaLabel={ariaLabel}
      icon={Menu}
      ariaExpanded={isOpen}
      ariaControls={listId}
    />
  );
}
