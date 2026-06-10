import { useMemo } from "react";

import { buildCatalogSubcategoryPickerTiles } from "../lib/buildCatalogSubcategoryPickerTiles.js";
import { useProductCategoryChildrenQuery } from "../../product-category-tree/model/useProductCategoryChildrenQuery.js";
import { PRODUCT_CATEGORY_DISPLAY_UI, PRODUCT_CATEGORY_TREE_UI } from "../../../shared/config/appUiCopy.js";
import { CatalogCategoryTilesGrid } from "./CatalogCategoryTilesGrid.jsx";
import { CatalogCategoryTilesGridSkeleton } from "./CatalogCategoryTilesGridSkeleton.jsx";

import "./CatalogSubcategoryPicker.css";

/**
 * @typedef {{ id: string; labelRu: string }} CatalogSubcategoryPickerTrailStep
 */

/**
 * @param {{
 *   trail: CatalogSubcategoryPickerTrailStep[];
 *   displays: import('../model/types.js').ProductCategoryDisplayFromApi[];
 *   isAdmin: boolean;
 *   loadError: string | null;
 *   resolvingCategoryId: string | null;
 *   onBack: () => void;
 *   onViewAll: (categoryId: string) => void;
 *   onCategoryClick: (node: import('../../product-category-tree/model/types.js').ProductCategoryNode) => void;
 *   onEditCategoryClick: (payload: { categoryId: string; fallbackLabel: string }) => void;
 * }} props
 */
export function CatalogSubcategoryPicker({
  trail,
  displays,
  isAdmin,
  loadError,
  resolvingCategoryId,
  onBack,
  onViewAll,
  onCategoryClick,
  onEditCategoryClick,
}) {
  const activeParent = trail[trail.length - 1];
  const { data: categories = [], isLoading, isError, error } = useProductCategoryChildrenQuery({
    parentId: activeParent.id,
    enabled: Boolean(activeParent?.id),
  });

  const queryErrorMessage =
    error instanceof Error ? error.message : isError ? PRODUCT_CATEGORY_TREE_UI.LOAD_ERROR : "";
  const errorMessage = loadError ?? queryErrorMessage;

  const tiles = useMemo(() => {
    if (!activeParent) {
      return [];
    }

    return buildCatalogSubcategoryPickerTiles({
      parent: activeParent,
      categories,
      displays,
    });
  }, [activeParent, categories, displays]);

  const handleTileClick = (item) => {
    if (resolvingCategoryId) {
      return;
    }

    if (item.key.startsWith("view-all:")) {
      onViewAll(item.categoryId ?? activeParent.id);
      return;
    }

    const node = categories.find((row) => row.id === item.categoryId);
    if (node) {
      onCategoryClick(node);
    }
  };

  const handleEditTileClick = (item) => {
    if (!item.categoryId || item.key.startsWith("view-all:")) {
      return;
    }

    onEditCategoryClick({
      categoryId: item.categoryId,
      fallbackLabel: item.label,
    });
  };

  return (
    <section
      className="catalog-subcategory-picker"
      aria-label={PRODUCT_CATEGORY_DISPLAY_UI.SUBCATEGORY_PICKER_ARIA}
    >
      <div className="catalog-subcategory-picker__header">
        <button
          type="button"
          className="catalog-subcategory-picker__back"
          onClick={onBack}
          aria-label={PRODUCT_CATEGORY_DISPLAY_UI.SUBCATEGORY_BACK_ARIA}
        >
          {PRODUCT_CATEGORY_DISPLAY_UI.SUBCATEGORY_BACK}
        </button>
        <h2 className="catalog-subcategory-picker__title">{activeParent.labelRu}</h2>
      </div>

      {errorMessage ? (
        <p className="catalog-subcategory-picker__error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <CatalogCategoryTilesGridSkeleton />
      ) : (
        <CatalogCategoryTilesGrid
          items={tiles}
          isAdmin={isAdmin}
          pendingTileKey={resolvingCategoryId}
          onTileClick={handleTileClick}
          onEditTileClick={handleEditTileClick}
          getEditAriaLabel={(item) =>
            PRODUCT_CATEGORY_DISPLAY_UI.SUBCATEGORY_NODE_EDIT_ARIA(item.label)
          }
        />
      )}
    </section>
  );
}
