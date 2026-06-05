import { useCallback, useEffect, useState } from "react";

import { CreateProductCategorySelect } from "../../product/ui/CreateProductCategorySelect.jsx";
import { PRODUCT_CATEGORY_ELECTRONICS } from "../../product/model/productConstants.js";
import { fetchProductCategoryChildren } from "../api/fetchProductCategoryChildren.js";
import { fetchProductCategoryRoots } from "../api/fetchProductCategoryRoots.js";
import { buildCategoryBreadcrumbFromNode } from "../lib/buildCategoryBreadcrumbFromNode.js";
import { PRODUCT_CATEGORY_TREE_UI } from "../../../shared/config/appUiCopy.js";
import { getProductFieldEditLabel } from "../../product/lib/productFieldRegistry.js";

import "./CreateProductCategoryPicker.css";

/**
 * @typedef {Object} ProductCategoryFormValue
 * @property {string | null} productCategoryId
 * @property {string} categoryBreadcrumbRu
 * @property {import('../../product/model/types.js').ProductCategory} productCategory
 */

/**
 * @param {{
 *   value: ProductCategoryFormValue;
 *   onChange: (next: ProductCategoryFormValue) => void;
 *   disabled?: boolean;
 * }} props
 */
export function CreateProductCategoryPicker({ value, onChange, disabled = false }) {
  const [hasTree, setHasTree] = useState(null);
  const [useLegacyList, setUseLegacyList] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [trail, setTrail] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadRoots = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");
      const { categories } = await fetchProductCategoryRoots();
      setOptions(categories);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : PRODUCT_CATEGORY_TREE_UI.LOAD_ERROR,
      );
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChildren = useCallback(async (parentId) => {
    try {
      setLoading(true);
      setLoadError("");
      const { categories } = await fetchProductCategoryChildren(parentId);
      setOptions(categories);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : PRODUCT_CATEGORY_TREE_UI.LOAD_ERROR,
      );
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { categories } = await fetchProductCategoryRoots();
        if (cancelled) return;
        const treeAvailable = categories.length > 0;
        setHasTree(treeAvailable);

        if (!treeAvailable) {
          setUseLegacyList(true);
          return;
        }

        if (value.productCategoryId) {
          setPickerOpen(false);
          return;
        }

        setPickerOpen(true);
        setOptions(categories);
      } catch {
        if (cancelled) return;
        setHasTree(false);
        setUseLegacyList(true);
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [value.productCategoryId]);

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
      });
      setPickerOpen(false);
      setTrail([]);
      setOptions([]);
      return;
    }

    const nextTrail = [
      ...trail,
      {
        id: node.id,
        labelRu: node.labelRu,
        legacyProductCategory: node.legacyProductCategory ?? null,
      },
    ];
    setTrail(nextTrail);
    void loadChildren(node.id);
  };

  const handleBack = () => {
    if (trail.length === 0) return;
    const nextTrail = trail.slice(0, -1);
    setTrail(nextTrail);
    if (nextTrail.length === 0) {
      void loadRoots();
      return;
    }
    void loadChildren(nextTrail[nextTrail.length - 1].id);
  };

  const openPicker = () => {
    setPickerOpen(true);
    setTrail([]);
    setUseLegacyList(false);
    void loadRoots();
  };

  const switchToLegacy = () => {
    setUseLegacyList(true);
    setPickerOpen(false);
    setTrail([]);
    onChange({
      productCategoryId: null,
      categoryBreadcrumbRu: "",
      productCategory: value.productCategory ?? PRODUCT_CATEGORY_ELECTRONICS,
    });
  };

  const switchToTree = () => {
    setUseLegacyList(false);
    setPickerOpen(true);
    setTrail([]);
    onChange({
      productCategoryId: null,
      categoryBreadcrumbRu: "",
      productCategory: value.productCategory ?? PRODUCT_CATEGORY_ELECTRONICS,
    });
    void loadRoots();
  };

  if (hasTree === null) {
    return (
      <p className="create-product-category-picker__hint">
        {PRODUCT_CATEGORY_TREE_UI.LOADING}
      </p>
    );
  }

  if (useLegacyList || !hasTree) {
    return (
      <div className="create-product-category-picker">
        <CreateProductCategorySelect
          value={value.productCategory}
          disabled={disabled}
          onChange={(productCategory) =>
            onChange({
              productCategoryId: null,
              categoryBreadcrumbRu: "",
              productCategory,
            })
          }
        />
        {hasTree ? (
          <button
            type="button"
            className="create-product-category-picker__mode-link"
            disabled={disabled}
            onClick={switchToTree}
          >
            {PRODUCT_CATEGORY_TREE_UI.SWITCH_TO_TREE}
          </button>
        ) : null}
      </div>
    );
  }

  if (!pickerOpen && value.productCategoryId) {
    return (
      <div className="create-product-category-picker">
        <span className="create-product-category-picker__legend">
          {getProductFieldEditLabel("productCategory")}
        </span>
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
        <button
          type="button"
          className="create-product-category-picker__mode-link"
          disabled={disabled}
          onClick={switchToLegacy}
        >
          {PRODUCT_CATEGORY_TREE_UI.SWITCH_TO_LEGACY}
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
      <span className="create-product-category-picker__legend">
        {getProductFieldEditLabel("productCategory")}
      </span>
      <p className="create-product-category-picker__hint">
        {PRODUCT_CATEGORY_TREE_UI.WIZARD_HINT}
      </p>
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
      <ul
        className="create-product-category-picker__menu"
        role="listbox"
        aria-label={stepTitle}
      >
        {loading ? (
          <li className="create-product-category-picker__loading">
            {PRODUCT_CATEGORY_TREE_UI.LOADING}
          </li>
        ) : (
          options.map((node) => (
            <li key={node.id} role="presentation">
              <button
                type="button"
                role="option"
                className="create-product-category-picker__option"
                disabled={disabled}
                onClick={() => handlePick(node)}
              >
                <span>{node.labelRu}</span>
                {node.isLeaf ? (
                  <span className="create-product-category-picker__leaf-badge">
                    {PRODUCT_CATEGORY_TREE_UI.LEAF_BADGE}
                  </span>
                ) : (
                  <span className="create-product-category-picker__chevron" aria-hidden>
                    ›
                  </span>
                )}
              </button>
            </li>
          ))
        )}
      </ul>
      <div className="create-product-category-picker__actions">
        {trail.length > 0 ? (
          <button
            type="button"
            className="create-product-category-picker__back"
            disabled={disabled || loading}
            onClick={handleBack}
          >
            {PRODUCT_CATEGORY_TREE_UI.BACK}
          </button>
        ) : null}
        <button
          type="button"
          className="create-product-category-picker__mode-link"
          disabled={disabled}
          onClick={switchToLegacy}
        >
          {PRODUCT_CATEGORY_TREE_UI.SWITCH_TO_LEGACY}
        </button>
      </div>
    </div>
  );
}
