import {
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_INSTALLMENT_ONLY,
  CATALOG_FILTER_SALE_ONLY,
} from "../../../entities/product/model/productConstants.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  buildCatalogFiltersOnlyDropdownItems,
  isCatalogFiltersDropdownItemSelected,
} from "../lib/buildCatalogFiltersOnlyDropdownItems.js";

/**
 * @param {{
 *   panelId: string;
 *   catalogSort: string;
 *   catalogFollowingOnly: boolean;
 *   catalogAuctionOnly: boolean;
 *   catalogInstallmentOnly: boolean;
 *   catalogSaleOnly: boolean;
 *   onCatalogSortChange: (sort: string) => void;
 *   onCatalogFollowingOnlyToggle: () => void;
 *   onCatalogAuctionOnlyToggle: () => void;
 *   onCatalogInstallmentOnlyToggle: () => void;
 *   onCatalogSaleOnlyToggle: () => void;
 * }} props
 */
export function CatalogFiltersDropdown({
  panelId,
  catalogSort,
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogInstallmentOnly,
  catalogSaleOnly,
  onCatalogSortChange,
  onCatalogFollowingOnlyToggle,
  onCatalogAuctionOnlyToggle,
  onCatalogInstallmentOnlyToggle,
  onCatalogSaleOnlyToggle,
}) {
  const listItems = buildCatalogFiltersOnlyDropdownItems();
  const selectionState = {
    catalogSort,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogInstallmentOnly,
    catalogSaleOnly,
  };

  const handleItemClick = (item) => {
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
    if (item.value === CATALOG_FILTER_INSTALLMENT_ONLY) {
      onCatalogInstallmentOnlyToggle();
      return;
    }
    if (item.value === CATALOG_FILTER_SALE_ONLY) {
      onCatalogSaleOnlyToggle();
    }
  };

  return (
    <ul
      id={panelId}
      className="app-shell__category-list"
      role="list"
      aria-label={HOME_PAGE_UI.CATALOG_FILTERS_PANEL_ARIA}
      onWheel={(event) => event.stopPropagation()}
    >
      {listItems.map((item) => {
        const isSelected = isCatalogFiltersDropdownItemSelected(item, selectionState);

        return (
          <li key={item.key} className="app-shell__category-item">
            <button
              type="button"
              className={[
                "app-shell__category-option",
                isSelected && "app-shell__category-option_selected",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={isSelected}
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
