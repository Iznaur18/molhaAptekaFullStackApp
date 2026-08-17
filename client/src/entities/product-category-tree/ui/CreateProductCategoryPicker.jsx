import { useMemo, useState } from "react";

import { buildCatalogSubcategoryPickerTiles } from "../../product-category-display/lib/buildCatalogSubcategoryPickerTiles.js";
import { buildResolvedProductCategoryDisplaysFromRoots } from "../../product-category-display/lib/resolveProductCategoryDisplay.js";
import { useProductCategoryDisplaysQuery } from "../../product-category-display/model/useProductCategoryDisplaysQuery.js";
import { CatalogCategoryTilesGrid } from "../../product-category-display/ui/CatalogCategoryTilesGrid.jsx";
import { CatalogCategoryTilesGridSkeleton } from "../../product-category-display/ui/CatalogCategoryTilesGridSkeleton.jsx";
import { buildCategoryBreadcrumbFromNode } from "../lib/buildCategoryBreadcrumbFromNode.js";
import { useProductCategoryLevelQuery } from "../model/useProductCategoryLevelQuery.js";
import { useProductCategoryRootsQuery } from "../model/useProductCategoryRootsQuery.js";
import { PRODUCT_CATEGORY_TREE_UI } from "../../../shared/config/appUiCopy.js";
import { getProductFieldEditLabel } from "../../product/lib/productFieldRegistry.js";

import "./CreateProductCategoryPicker.css";

/**
 * @typedef {Object} ProductCategoryFormValue
 * @property {string | null} productCategoryId
 * @property {string} categoryBreadcrumbRu
 * @property {import('../../product/model/types.js').ProductCategory} productCategory
 * @property {string[]} [defaultCharacteristicKeys]
 */

/**
 * @param {{
 *   value: ProductCategoryFormValue;
 *   onChange: (next: ProductCategoryFormValue) => void;
 *   disabled?: boolean;
 * }} props
 */
export function CreateProductCategoryPicker(props) {
  return <ProductCategoryTreePicker {...props} />;
}

/**
 * @param {{
 *   value: ProductCategoryFormValue;
 *   onChange: (next: ProductCategoryFormValue) => void;
 *   disabled?: boolean;
 * }} props
 */
function ProductCategoryTreePicker({ value, onChange, disabled = false }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [trail, setTrail] = useState([]);

  const initRootsQuery = useProductCategoryRootsQuery({
    enabled: !value.productCategoryId,
  });
  const activeParentId = trail.length === 0 ? null : trail[trail.length - 1].id;
  // Drill-down UI is shown when no category is selected yet (pickerOpen stays false
  // until "Change category"). Must still fetch roots/children in that state.
  const treeBrowserActive = pickerOpen || !value.productCategoryId;
  const levelQuery = useProductCategoryLevelQuery({
    parentId: activeParentId,
    enabled: treeBrowserActive,
  });
  const displaysQuery = useProductCategoryDisplaysQuery({
    enabled: treeBrowserActive,
  });

  const hasTree =
    initRootsQuery.isLoading || initRootsQuery.isFetching
      ? null
      : (initRootsQuery.data?.length ?? 0) > 0;
  const options = levelQuery.categories;
  const displays = displaysQuery.data ?? [];
  const loading = levelQuery.isLoading;
  const loadError =
    initRootsQuery.error instanceof Error
      ? initRootsQuery.error.message
      : levelQuery.error instanceof Error
        ? levelQuery.error.message
        : initRootsQuery.isError || levelQuery.isError
          ? PRODUCT_CATEGORY_TREE_UI.LOAD_ERROR
          : "";

  const tiles = useMemo(() => {
    if (activeParentId == null) {
      return buildResolvedProductCategoryDisplaysFromRoots(options, displays).map((item) => ({
        key: item.categoryId ?? item.displaySlug,
        label: item.label,
        imageUrl: item.imageUrl,
        categoryId: item.categoryId ?? undefined,
      }));
    }

    const parent = trail[trail.length - 1];
    if (!parent) {
      return [];
    }

    return buildCatalogSubcategoryPickerTiles({
      parent,
      categories: options,
      displays,
      includeViewAll: false,
    });
  }, [activeParentId, displays, options, trail]);

  const resolveLegacySlug = (node, nextTrail) => {
    if (
      typeof node.legacyProductCategory === "string" &&
      node.legacyProductCategory.trim() !== ""
    ) {
      return node.legacyProductCategory;
    }
    const fromTrail = nextTrail.find(
      (step) =>
        typeof step.legacyProductCategory === "string" &&
        step.legacyProductCategory.trim() !== "",
    );
    return fromTrail?.legacyProductCategory ?? value.productCategory;
  };

  const handlePick = (node) => {
    if (node.isLeaf) {
      onChange({
        productCategoryId: node.id,
        categoryBreadcrumbRu: buildCategoryBreadcrumbFromNode(node),
        productCategory: resolveLegacySlug(node, trail),
        defaultCharacteristicKeys: Array.isArray(node.defaultCharacteristicKeys)
          ? node.defaultCharacteristicKeys.map(String)
          : [],
      });
      setPickerOpen(false);
      setTrail([]);
      return;
    }

    setTrail((prev) => [
      ...prev,
      {
        id: node.id,
        labelRu: node.labelRu,
        legacyProductCategory: node.legacyProductCategory ?? null,
      },
    ]);
  };

  const handleTileClick = (item) => {
    if (disabled || !item.categoryId) {
      return;
    }
    const node = options.find((row) => row.id === item.categoryId);
    if (node) {
      handlePick(node);
    }
  };

  const handleBack = () => {
    if (trail.length === 0) return;
    setTrail((prev) => prev.slice(0, -1));
  };

  const openPicker = () => {
    setPickerOpen(true);
    setTrail([]);
  };

  if (hasTree === null) {
    return (
      <p className="create-product-category-picker__hint">
        {PRODUCT_CATEGORY_TREE_UI.LOADING}
      </p>
    );
  }

  if (!hasTree) {
    return (
      <p className="create-product-category-picker__hint">
        {loadError || PRODUCT_CATEGORY_TREE_UI.EMPTY_TREE}
      </p>
    );
  }

  if (!pickerOpen && value.productCategoryId) {
    return (
      <div className="create-product-category-picker">
        <div className="create-product-category-picker__summary">
          <span className="create-product-category-picker__summary-label">
            {PRODUCT_CATEGORY_TREE_UI.SELECTED_PREFIX}
          </span>
          <span className="create-product-category-picker__summary-value">
            {value.categoryBreadcrumbRu || getProductFieldEditLabel("productCategory")}
          </span>
        </div>
        <button
          type="button"
          className="create-product-category-picker__mode-link"
          disabled={disabled}
          onClick={openPicker}
        >
          {PRODUCT_CATEGORY_TREE_UI.CHANGE_CATEGORY}
        </button>
      </div>
    );
  }

  const stepTitle =
    trail.length === 0
      ? PRODUCT_CATEGORY_TREE_UI.STEP_ROOT
      : trail[trail.length - 1].labelRu;

  return (
    <div className="create-product-category-picker">
      {trail.length > 0 ? (
        <nav
          className="create-product-category-picker__trail"
          aria-label={PRODUCT_CATEGORY_TREE_UI.TRAIL_ARIA}
        >
          {trail.map((step) => (
            <span key={step.id} className="create-product-category-picker__trail-item">
              {step.labelRu}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="create-product-category-picker__step-title">{stepTitle}</div>
      {loadError ? (
        <p className="create-product-category-picker__error" role="alert">
          {loadError}
        </p>
      ) : null}
      <div className="create-product-category-picker__grid" aria-label={stepTitle}>
        {loading ? (
          <CatalogCategoryTilesGridSkeleton />
        ) : options.length === 0 ? (
          <p className="create-product-category-picker__hint">
            {PRODUCT_CATEGORY_TREE_UI.EMPTY_LEVEL}
          </p>
        ) : (
          <CatalogCategoryTilesGrid
            items={tiles}
            disabled={disabled}
            onTileClick={handleTileClick}
          />
        )}
      </div>
      {trail.length > 0 ? (
        <div className="create-product-category-picker__actions">
          <button
            type="button"
            className="create-product-category-picker__back"
            disabled={disabled || loading}
            onClick={handleBack}
          >
            {PRODUCT_CATEGORY_TREE_UI.BACK}
          </button>
        </div>
      ) : null}
    </div>
  );
}
