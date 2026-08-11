import {
  CATALOG_FILTER_AFFILIATE_ONLY,
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_INSTALLMENT_ONLY,
  CATALOG_FILTER_NEAR,
  CATALOG_FILTER_ORIGINAL_ONLY,
  CATALOG_FILTER_RENTAL_ONLY,
  CATALOG_FILTER_SALE_ONLY,
  CATALOG_FILTER_WHOLESALE_ONLY,
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
 *   catalogInstallmentOnly: boolean;
 *   catalogSaleOnly: boolean;
 *   catalogRentalOnly: boolean;
 *   catalogAffiliateOnly: boolean;
 *   catalogWholesaleOnly: boolean;
 *   catalogOriginalOnly: boolean;
 *   catalogNear: boolean;
 *   onProductCategorySelect: (
 *     category: import("../../../entities/product/model/types.js").ProductCategory | null,
 *   ) => void;
 *   onCatalogSortChange: (sort: string) => void;
 *   onCatalogFollowingOnlyToggle: () => void;
 *   onCatalogAuctionOnlyToggle: () => void;
 *   onCatalogInstallmentOnlyToggle: () => void;
 *   onCatalogSaleOnlyToggle: () => void;
 *   onCatalogRentalOnlyToggle: () => void;
 *   onCatalogAffiliateOnlyToggle: () => void;
 *   onCatalogWholesaleOnlyToggle: () => void;
 *   onCatalogOriginalOnlyToggle: () => void;
 *   onCatalogNearToggle: () => void;
 * }} props
 */
export function CatalogFilterDropdown({
  panelId,
  selectedProductCategory,
  catalogSort,
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogInstallmentOnly,
  catalogSaleOnly,
  catalogRentalOnly,
  catalogAffiliateOnly,
  catalogWholesaleOnly,
  catalogOriginalOnly,
  catalogNear,
  onProductCategorySelect,
  onCatalogSortChange,
  onCatalogFollowingOnlyToggle,
  onCatalogAuctionOnlyToggle,
  onCatalogInstallmentOnlyToggle,
  onCatalogSaleOnlyToggle,
  onCatalogRentalOnlyToggle,
  onCatalogAffiliateOnlyToggle,
  onCatalogWholesaleOnlyToggle,
  onCatalogOriginalOnlyToggle,
  onCatalogNearToggle,
}) {
  const listItems = buildCatalogFilterDropdownItems();
  const selectionState = {
    selectedProductCategory,
    catalogSort,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogInstallmentOnly,
    catalogSaleOnly,
    catalogRentalOnly,
    catalogAffiliateOnly,
    catalogWholesaleOnly,
    catalogOriginalOnly,
    catalogNear,
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
    if (item.value === CATALOG_FILTER_INSTALLMENT_ONLY) {
      onCatalogInstallmentOnlyToggle();
      return;
    }
    if (item.value === CATALOG_FILTER_SALE_ONLY) {
      onCatalogSaleOnlyToggle();
      return;
    }
    if (item.value === CATALOG_FILTER_RENTAL_ONLY) {
      onCatalogRentalOnlyToggle();
      return;
    }
    if (item.value === CATALOG_FILTER_AFFILIATE_ONLY) {
      onCatalogAffiliateOnlyToggle();
      return;
    }
    if (item.value === CATALOG_FILTER_WHOLESALE_ONLY) {
      onCatalogWholesaleOnlyToggle();
      return;
    }
    if (item.value === CATALOG_FILTER_ORIGINAL_ONLY) {
      onCatalogOriginalOnlyToggle();
      return;
    }
    if (item.value === CATALOG_FILTER_NEAR) {
      onCatalogNearToggle();
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
        const isSelected = isCatalogFilterDropdownItemSelected(item, selectionState);

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
