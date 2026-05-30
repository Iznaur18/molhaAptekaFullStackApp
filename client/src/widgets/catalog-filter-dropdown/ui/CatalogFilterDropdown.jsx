import {
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_SALE_ONLY,
} from "../../../entities/product/model/productConstants.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  buildCatalogFilterDropdownItems,
  isCatalogFilterDropdownItemSelected,
} from "../lib/buildCatalogFilterDropdownItems.js";

/**
 * @param {{
 *   panelId: string;
 *   selectedProductCategory: import("../../../entities/product/model/types.js").ProductCategory | null;
 *   catalogSort: string;
 *   catalogFollowingOnly: boolean;
 *   catalogAuctionOnly: boolean;
 *   catalogSaleOnly: boolean;
 *   onProductCategorySelect: (
 *     category: import("../../../entities/product/model/types.js").ProductCategory | null,
 *   ) => void;
 *   onCatalogSortChange: (sort: string) => void;
 *   onCatalogFollowingOnlyToggle: () => void;
 *   onCatalogAuctionOnlyToggle: () => void;
 *   onCatalogSaleOnlyToggle: () => void;
 * }} props
 */
export function CatalogFilterDropdown({
  panelId,
  selectedProductCategory,
  catalogSort,
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogSaleOnly,
  onProductCategorySelect,
  onCatalogSortChange,
  onCatalogFollowingOnlyToggle,
  onCatalogAuctionOnlyToggle,
  onCatalogSaleOnlyToggle,
}) {
  const listItems = buildCatalogFilterDropdownItems();
  const selectionState = {
    selectedProductCategory,
    catalogSort,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogSaleOnly,
  };

  const handleItemClick = (item) => {
    if (item.type === "category") {
      onProductCategorySelect(item.value);
      return;
    }
    if (item.type === "sort") {
      onCatalogSortChange(item.value);
      return;
    }
    if (item.value === CATALOG_FILTER_FOLLOWING_ONLY) {
      onCatalogFollowingOnlyToggle();
      return;
    }
    if (item.value === CATALOG_FILTER_AUCTION_ONLY) {
      onCatalogAuctionOnlyToggle();
      return;
    }
    if (item.value === CATALOG_FILTER_SALE_ONLY) {
      onCatalogSaleOnlyToggle();
    }
  };

  return (
    <ul
      id={panelId}
      className="home-page__category-list"
      role="list"
      aria-label={HOME_PAGE_UI.CATALOG_FILTERS_PANEL_ARIA}
      onWheel={(event) => event.stopPropagation()}
    >
      {listItems.map((item) => {
        const isSelected = isCatalogFilterDropdownItemSelected(
          item,
          selectionState,
        );

        return (
          <li key={item.key} className="home-page__category-item">
            <button
              type="button"
              className={[
                "home-page__category-option",
                isSelected && "home-page__category-option_selected",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={item.type !== "category" ? isSelected : undefined}
              aria-current={item.type === "category" && isSelected ? "true" : undefined}
              onClick={() => handleItemClick(item)}
            >
              {item.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
