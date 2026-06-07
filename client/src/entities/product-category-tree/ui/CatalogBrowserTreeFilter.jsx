import { useState } from "react";

import { buildCategoryBreadcrumbFromNode } from "../lib/buildCategoryBreadcrumbFromNode.js";
import { useProductCategoryLevelQuery } from "../model/useProductCategoryLevelQuery.js";
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

  const activeParentId = trail.length === 0 ? null : trail[trail.length - 1].id;
  const { categories: options, isLoading: loading, error } = useProductCategoryLevelQuery({
    parentId: activeParentId,
    enabled: isOpen,
  });

  const errorMessage =
    error instanceof Error ? error.message : error ? PRODUCT_CATEGORY_TREE_UI.LOAD_ERROR : "";

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

          {errorMessage ? (
            <p className="catalog-browser-tree-filter__error" role="alert">
              {errorMessage}
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
