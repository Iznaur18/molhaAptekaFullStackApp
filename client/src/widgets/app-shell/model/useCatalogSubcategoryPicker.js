import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { fetchProductCategoryChildren } from "../../../entities/product-category-tree/api/fetchProductCategoryChildren.js";
import { IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED } from "../../../entities/product-category-tree/lib/isCatalogBrowserSubcategoryFilterEnabled.js";
import { findCategoryRootIdForLegacySlug } from "../../../entities/product-category-tree/lib/findCategoryRootIdForLegacySlug.js";
import { productCategoryTreeQueryKeys } from "../../../entities/product-category-tree/model/productCategoryTreeQueryKeys.js";
import { buildCatalogProductsLocation } from "../../../entities/product-category-display/lib/catalogBrowserPaths.js";
import { CATALOG_SORT_NEWEST } from "../../../entities/product/model/productConstants.js";
import { PRODUCT_CATEGORY_TREE_UI } from "../../../shared/config/appUiCopy.js";

/** @typedef {{ id: string; labelRu: string }} CatalogSubcategoryPickerTrailStep */

/**
 * @param {object} params
 */
export function useCatalogSubcategoryPicker({
  isCatalogBrowserLanding,
  isCompactLayout,
  categoryRootsRef,
  applyCatalogQueryState,
  navigate,
  setCategoryTreeLabel,
  onCatalogError,
}) {
  const queryClient = useQueryClient();
  const [pickerTrail, setPickerTrail] = useState(
    /** @type {CatalogSubcategoryPickerTrailStep[]} */ ([]),
  );
  const [pickerLoadError, setPickerLoadError] = useState(/** @type {string | null} */ (null));
  const [resolvingLandingCategoryKey, setResolvingLandingCategoryKey] = useState(
    /** @type {string | null} */ (null),
  );
  const [resolvingPickerCategoryId, setResolvingPickerCategoryId] = useState(
    /** @type {string | null} */ (null),
  );
  const wasCatalogBrowserLandingRef = useRef(isCatalogBrowserLanding);
  const isResolvingLandingCategoryRef = useRef(false);
  const isResolvingPickerCategoryRef = useRef(false);

  const isCatalogSubcategoryPickerActive =
    IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED &&
    isCatalogBrowserLanding &&
    pickerTrail.length > 0;

  const clearPickerTrail = useCallback(() => {
    setPickerTrail([]);
    setPickerLoadError(null);
  }, []);

  useEffect(() => {
    const wasLanding = wasCatalogBrowserLandingRef.current;
    wasCatalogBrowserLandingRef.current = isCatalogBrowserLanding;

    if (wasLanding && !isCatalogBrowserLanding) {
      setPickerTrail([]);
      setPickerLoadError(null);
      setResolvingLandingCategoryKey(null);
      setResolvingPickerCategoryId(null);
      isResolvingLandingCategoryRef.current = false;
      isResolvingPickerCategoryRef.current = false;
    }
  }, [isCatalogBrowserLanding]);

  const reportChildrenLoadError = useCallback(
    (error) => {
      const message =
        error instanceof Error ? error.message : PRODUCT_CATEGORY_TREE_UI.LOAD_ERROR;
      onCatalogError(message);
      setPickerLoadError(message);
    },
    [onCatalogError],
  );

  const fetchCategoryChildren = useCallback(
    async (categoryId) => {
      const data = await queryClient.fetchQuery({
        queryKey: productCategoryTreeQueryKeys.children(categoryId),
        queryFn: () => fetchProductCategoryChildren(categoryId),
      });
      return data.categories ?? [];
    },
    [queryClient],
  );

  const navigateToCategoryProducts = useCallback(
    (categoryId) => {
      const nextQuery = {
        sort: CATALOG_SORT_NEWEST,
        category: null,
        categoryId,
        sellerPersonalCategoryId: null,
        followingOnly: false,
        auctionOnly: false,
        installmentOnly: false,
        saleOnly: false,
        near: false,
      };
      applyCatalogQueryState(nextQuery);
      setCategoryTreeLabel(null);
      setPickerTrail([]);
      setPickerLoadError(null);
      navigate(buildCatalogProductsLocation(nextQuery, { compact: isCompactLayout }));
    },
    [applyCatalogQueryState, isCompactLayout, navigate, setCategoryTreeLabel],
  );

  const openPickerForCategory = useCallback((step) => {
    setPickerLoadError(null);
    setPickerTrail([step]);
  }, []);

  const navigateWithLegacyCategorySlug = useCallback(
    (categorySlug) => {
      const nextQuery = {
        sort: CATALOG_SORT_NEWEST,
        category: categorySlug,
        categoryId: null,
        sellerPersonalCategoryId: null,
        followingOnly: false,
        auctionOnly: false,
        installmentOnly: false,
        saleOnly: false,
        near: false,
      };
      applyCatalogQueryState(nextQuery);
      setCategoryTreeLabel(null);
      navigate(buildCatalogProductsLocation(nextQuery, { compact: isCompactLayout }));
    },
    [applyCatalogQueryState, isCompactLayout, navigate, setCategoryTreeLabel],
  );

  const handleCatalogCategoryGridClick = useCallback(
    async (item) => {
      if (!IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED) {
        navigateWithLegacyCategorySlug(item.categorySlug);
        return;
      }

      if (isResolvingLandingCategoryRef.current) {
        return;
      }

      const rootId =
        item.categoryId ??
        findCategoryRootIdForLegacySlug(categoryRootsRef.current, item.categorySlug);

      if (!rootId) {
        navigateWithLegacyCategorySlug(item.categorySlug);
        return;
      }

      const itemKey = String(item.categoryId ?? item.categorySlug);
      setPickerLoadError(null);
      setResolvingLandingCategoryKey(itemKey);
      isResolvingLandingCategoryRef.current = true;

      try {
        const children = await fetchCategoryChildren(rootId);
        if (children.length > 0) {
          openPickerForCategory({ id: rootId, labelRu: item.label });
          return;
        }

        navigateToCategoryProducts(rootId);
      } catch (error) {
        reportChildrenLoadError(error);
      } finally {
        isResolvingLandingCategoryRef.current = false;
        setResolvingLandingCategoryKey(null);
      }
    },
    [
      categoryRootsRef,
      fetchCategoryChildren,
      navigateToCategoryProducts,
      navigateWithLegacyCategorySlug,
      openPickerForCategory,
      reportChildrenLoadError,
    ],
  );

  const handleSubcategoryPickerBack = useCallback(() => {
    setPickerLoadError(null);
    setPickerTrail((prev) => (prev.length <= 1 ? [] : prev.slice(0, -1)));
  }, []);

  const handleSubcategoryPickerViewAll = useCallback(
    (categoryId) => {
      navigateToCategoryProducts(categoryId);
    },
    [navigateToCategoryProducts],
  );

  const handleSubcategoryPickerCategoryClick = useCallback(
    async (node) => {
      if (isResolvingPickerCategoryRef.current) {
        return;
      }

      setPickerLoadError(null);
      setResolvingPickerCategoryId(node.id);
      isResolvingPickerCategoryRef.current = true;

      try {
        const children = await fetchCategoryChildren(node.id);
        if (children.length > 0) {
          setPickerTrail((prev) => [...prev, { id: node.id, labelRu: node.labelRu }]);
          return;
        }

        navigateToCategoryProducts(node.id);
      } catch (error) {
        reportChildrenLoadError(error);
      } finally {
        isResolvingPickerCategoryRef.current = false;
        setResolvingPickerCategoryId(null);
      }
    },
    [fetchCategoryChildren, navigateToCategoryProducts, reportChildrenLoadError],
  );

  return {
    pickerTrail,
    pickerLoadError,
    isCatalogSubcategoryPickerActive,
    resolvingLandingCategoryKey,
    resolvingPickerCategoryId,
    clearPickerTrail,
    handleCatalogCategoryGridClick,
    handleSubcategoryPickerBack,
    handleSubcategoryPickerViewAll,
    handleSubcategoryPickerCategoryClick,
  };
};
