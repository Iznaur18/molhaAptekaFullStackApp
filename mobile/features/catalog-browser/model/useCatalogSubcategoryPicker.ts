import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

import type { ResolvedProductCategoryDisplay } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import type { ProductCategoryRootNode } from "@/entities/product-category-display/model/types";
import { fetchProductCategoryChildren } from "@/entities/product-category-tree/api/fetchProductCategoryChildren";
import { findCategoryRootIdForLegacySlug } from "@/entities/product-category-tree/lib/findCategoryRootIdForLegacySlug";
import type { CatalogListFilters } from "@/entities/product/model/catalogListFilters";
import { CATALOG_SORT_NEWEST } from "@/entities/product/model/productConstants";
import { API_CLIENT_UI } from "@/shared/config";
import { categoryTreeQueryKeys } from "@/shared/api";

export type CatalogSubcategoryPickerTrailStep = {
  id: string;
  labelRu: string;
};

type ProductCategoryChildNode = {
  id: string;
  labelRu: string;
};

type UseCatalogSubcategoryPickerParams = {
  categoryRoots: ProductCategoryRootNode[];
  onNavigateToProducts: (filters: Partial<CatalogListFilters>) => void;
};

const resolveCategoryNodeId = (node: { id?: string; _id?: string }): string | null => {
  const id = node.id ?? node._id;
  return id != null ? String(id) : null;
};

const normalizeChildNodes = (
  categories: Array<{ id?: string; _id?: string; labelRu?: string; name?: string }>,
): ProductCategoryChildNode[] =>
  categories.flatMap((node) => {
    const id = resolveCategoryNodeId(node);
    if (!id) {
      return [];
    }
    const labelRu = String(node.labelRu ?? node.name ?? "").trim() || id;
    return [{ id, labelRu }];
  });

export const useCatalogSubcategoryPicker = ({
  categoryRoots,
  onNavigateToProducts,
}: UseCatalogSubcategoryPickerParams) => {
  const queryClient = useQueryClient();
  const [pickerTrail, setPickerTrail] = useState<CatalogSubcategoryPickerTrailStep[]>([]);
  const [pickerLoadError, setPickerLoadError] = useState<string | null>(null);
  const [resolvingLandingCategoryKey, setResolvingLandingCategoryKey] = useState<string | null>(
    null,
  );
  const [resolvingPickerCategoryId, setResolvingPickerCategoryId] = useState<string | null>(null);
  const isResolvingLandingCategoryRef = useRef(false);
  const isResolvingPickerCategoryRef = useRef(false);

  const isCatalogSubcategoryPickerActive = pickerTrail.length > 0;

  const clearPickerTrail = useCallback(() => {
    setPickerTrail([]);
    setPickerLoadError(null);
  }, []);

  const fetchCategoryChildren = useCallback(
    async (categoryId: string) => {
      const data = await queryClient.fetchQuery({
        queryKey: categoryTreeQueryKeys.children(categoryId),
        queryFn: () => fetchProductCategoryChildren(categoryId),
      });
      return normalizeChildNodes(data.categories ?? []);
    },
    [queryClient],
  );

  const navigateToCategoryProducts = useCallback(
    (categoryId: string) => {
      onNavigateToProducts({
        categoryId,
        sort: CATALOG_SORT_NEWEST,
        followingOnly: false,
        auctionOnly: false,
        installmentOnly: false,
        saleOnly: false,
        rentalOnly: false,
        affiliateOnly: false,
        wholesaleOnly: false,
        originalOnly: false,
        near: false,
      });
      clearPickerTrail();
      setPickerLoadError(null);
    },
    [clearPickerTrail, onNavigateToProducts],
  );

  const openPickerForCategory = useCallback((step: CatalogSubcategoryPickerTrailStep) => {
    setPickerLoadError(null);
    setPickerTrail([step]);
  }, []);

  const reportChildrenLoadError = useCallback((error: unknown) => {
    const message =
      error instanceof Error ? error.message : API_CLIENT_UI.FETCH_CATEGORY_CHILDREN_FALLBACK;
    setPickerLoadError(message);
  }, []);

  const handleCatalogCategoryGridClick = useCallback(
    async (item: ResolvedProductCategoryDisplay) => {
      if (isResolvingLandingCategoryRef.current) {
        return;
      }

      const rootId =
        item.categoryId ?? findCategoryRootIdForLegacySlug(categoryRoots, item.categorySlug);

      if (!rootId) {
        onNavigateToProducts({
          productCategory: item.categorySlug,
          sort: CATALOG_SORT_NEWEST,
          followingOnly: false,
          auctionOnly: false,
          installmentOnly: false,
          saleOnly: false,
          rentalOnly: false,
          affiliateOnly: false,
          wholesaleOnly: false,
          originalOnly: false,
          near: false,
        });
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
      categoryRoots,
      fetchCategoryChildren,
      navigateToCategoryProducts,
      onNavigateToProducts,
      openPickerForCategory,
      reportChildrenLoadError,
    ],
  );

  const handleSubcategoryPickerBack = useCallback(() => {
    setPickerLoadError(null);
    setPickerTrail((prev) => (prev.length <= 1 ? [] : prev.slice(0, -1)));
  }, []);

  const handleSubcategoryPickerViewAll = useCallback(
    (categoryId: string) => {
      navigateToCategoryProducts(categoryId);
    },
    [navigateToCategoryProducts],
  );

  const handleSubcategoryPickerCategoryClick = useCallback(
    async (node: ProductCategoryChildNode) => {
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
