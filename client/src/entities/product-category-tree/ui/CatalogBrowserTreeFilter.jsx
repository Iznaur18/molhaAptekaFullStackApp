import { useCallback, useEffect, useState } from "react";

import { fetchProductCategoryChildren } from "../api/fetchProductCategoryChildren.js";
import { fetchProductCategoryRoots } from "../api/fetchProductCategoryRoots.js";
import { buildCategoryBreadcrumbFromNode } from "../lib/buildCategoryBreadcrumbFromNode.js";
import { PRODUCT_CATEGORY_TREE_UI } from "../../../shared/config/appUiCopy.js";

import "./CatalogBrowserTreeFilter.css";

/**
 * @param {{
 *   categoryId: string | null;
 *   categoryLabel: string | null;
 *   disabled?: boolean;
 *   onSelect: (payload: { categoryId: string; categoryLabel: string }) => void;
 *   onClear: () => void;
 * }} props
 */
export function CatalogBrowserTreeFilter({
  categoryId,
  categoryLabel,
  disabled = false,
  onSelect,
  onClear,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [trail, setTrail] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRoots = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { categories } = await fetchProductCategoryRoots();
      setOptions(categories);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : PRODUCT_CATEGORY_TREE_UI.LOAD_ERROR,
      );
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChildren = useCallback(async (parentId) => {
    try {
      setLoading(true);
      setError("");
      const { categories } = await fetchProductCategoryChildren(parentId);
      setOptions(categories);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : PRODUCT_CATEGORY_TREE_UI.LOAD_ERROR,
      );
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    if (trail.length === 0) {
      void loadRoots();
      return undefined;
    }
    void loadChildren(trail[trail.length - 1].id);
    return undefined;
  }, [isOpen, trail, loadRoots, loadChildren]);

  const handlePick = (node) => {
    if (node.isLeaf) {
      onSelect({
        categoryId: node.id,
        categoryLabel: buildCategoryBreadcrumbFromNode(node),
      });
      setIsOpen(false);
      setTrail([]);
      return;
    }

    setTrail((prev) => [...prev, { id: node.id, labelRu: node.labelRu }]);
  };

  const handleBack = () => {
    setTrail((prev) => prev.slice(0, -1));
  };

  const openPicker = () => {
    setIsOpen(true);
    setTrail([]);
  };

  const closePicker = () => {
    setIsOpen(false);
    setTrail([]);
  };

  const stepTitle =
    trail.length === 0
      ? PRODUCT_CATEGORY_TREE_UI.STEP_ROOT
      : trail[trail.length - 1].labelRu;

  const crumbsLabel = trail.map((step) => step.labelRu).join(" › ");
  const hasFilter = Boolean(categoryId && categoryLabel);

  return (
    <div className="catalog-browser-tree-filter">
      {hasFilter ? (
        <div className="catalog-browser-tree-filter__active">
          <p className="catalog-browser-tree-filter__active-main">
            <span className="catalog-browser-tree-filter__active-label">
              {PRODUCT_CATEGORY_TREE_UI.FILTER_PREFIX}
            </span>{" "}
            <span className="catalog-browser-tree-filter__active-value">
              {categoryLabel}
            </span>
          </p>
          <div className="catalog-browser-tree-filter__active-actions">
            <button
              type="button"
              className="catalog-browser-tree-filter__pick-link"
              disabled={disabled}
              onClick={openPicker}
            >
              {PRODUCT_CATEGORY_TREE_UI.PICK_SUBCATEGORY}
            </button>
            <button
              type="button"
              className="catalog-browser-tree-filter__clear-link"
              disabled={disabled}
              onClick={onClear}
            >
              {PRODUCT_CATEGORY_TREE_UI.CLEAR_FILTER}
            </button>
          </div>
        </div>
      ) : !isOpen ? (
        <button
          type="button"
          className="catalog-browser-tree-filter__trigger"
          disabled={disabled}
          onClick={openPicker}
        >
          {PRODUCT_CATEGORY_TREE_UI.CATALOG_FILTER_OPEN}
        </button>
      ) : null}

      {isOpen ? (
        <div
          className="catalog-browser-tree-filter__popover"
          role="dialog"
          aria-label={PRODUCT_CATEGORY_TREE_UI.CATALOG_FILTER_OPEN}
        >
          <div className="catalog-browser-tree-filter__topbar">
            <button
              type="button"
              className="catalog-browser-tree-filter__icon-btn"
              disabled={disabled || loading || trail.length === 0}
              aria-label={PRODUCT_CATEGORY_TREE_UI.BACK}
              onClick={handleBack}
            >
              ←
            </button>
            <h3 className="catalog-browser-tree-filter__topbar-title">{stepTitle}</h3>
            <button
              type="button"
              className="catalog-browser-tree-filter__icon-btn"
              disabled={disabled}
              aria-label={PRODUCT_CATEGORY_TREE_UI.CLOSE}
              onClick={closePicker}
            >
              ×
            </button>
          </div>

          {crumbsLabel ? (
            <p className="catalog-browser-tree-filter__crumbs">{crumbsLabel}</p>
          ) : (
            <p className="catalog-browser-tree-filter__hint-inline">
              {PRODUCT_CATEGORY_TREE_UI.CATALOG_FILTER_HINT_SHORT}
            </p>
          )}

          {error ? (
            <p className="catalog-browser-tree-filter__error" role="alert">
              {error}
            </p>
          ) : null}

          <ul className="catalog-browser-tree-filter__list" role="listbox">
            {loading ? (
              <li className="catalog-browser-tree-filter__list-empty">
                {PRODUCT_CATEGORY_TREE_UI.LOADING}
              </li>
            ) : options.length === 0 ? (
              <li className="catalog-browser-tree-filter__list-empty">
                {PRODUCT_CATEGORY_TREE_UI.EMPTY_LEVEL}
              </li>
            ) : (
              options.map((node) => (
                <li key={node.id} role="presentation">
                  <button
                    type="button"
                    className="catalog-browser-tree-filter__row"
                    disabled={disabled}
                    onClick={() => handlePick(node)}
                  >
                    <span className="catalog-browser-tree-filter__row-label">
                      {node.labelRu}
                    </span>
                    {node.isLeaf ? (
                      <span className="catalog-browser-tree-filter__row-action">
                        {PRODUCT_CATEGORY_TREE_UI.PICK_LEAF}
                      </span>
                    ) : (
                      <span
                        className="catalog-browser-tree-filter__row-chevron"
                        aria-hidden
                      >
                        ›
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
