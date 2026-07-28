import { useMemo } from "react";

import { useViewerRegion } from "@/entities/region/model/ViewerRegionProvider";
import { buildCategoryFilterChips } from "@/entities/product-category-display/lib/buildCategoryFilterChips";
import { resolveActiveCatalogFeedLabel } from "@/entities/product-category-display/lib/resolveActiveCatalogFeedLabel";
import { useProductCategoryDisplaysQuery } from "@/entities/product-category-display/model/useProductCategoryDisplaysQuery";
import { useProductCategoryBreadcrumbQuery } from "@/entities/product-category-tree/model/useProductCategoryBreadcrumbQuery";
import { useProductCategoryRootsQuery } from "@/entities/product-category-tree/model/useProductCategoryRootsQuery";
import { useSellerPersonalCategoryCatalogTilesQuery } from "@/entities/seller-personal-category/model/useSellerPersonalCategoryCatalogTilesQuery";
import type { HomeCatalogFeedFiltersState } from "@/features/home-feed/model/homeCatalogFeedFilters";

type UseCatalogBreadcrumbLabelParams = {
  enabled: boolean;
  search: string;
  selectedRootSlug: string | null;
  selectedSubcategoryId: string | null;
  selectedSellerPersonalCategoryId: string | null;
  feedFilters: HomeCatalogFeedFiltersState;
};

export const useCatalogBreadcrumbLabel = ({
  enabled,
  search,
  selectedRootSlug,
  selectedSubcategoryId,
  selectedSellerPersonalCategoryId,
  feedFilters,
}: UseCatalogBreadcrumbLabelParams): string | null => {
  const { viewerRegionCode } = useViewerRegion();
  const categoryDisplaysQuery = useProductCategoryDisplaysQuery();
  const categoryRootsQuery = useProductCategoryRootsQuery(enabled);
  const personalTilesQuery = useSellerPersonalCategoryCatalogTilesQuery({
    enabled: enabled && Boolean(selectedSellerPersonalCategoryId),
    regionCode: viewerRegionCode,
  });
  const breadcrumbQuery = useProductCategoryBreadcrumbQuery({
    categoryId: selectedSubcategoryId,
    enabled: enabled && Boolean(selectedSubcategoryId),
  });

  const categoryChips = useMemo(
    () => buildCategoryFilterChips(categoryDisplaysQuery.data ?? []),
    [categoryDisplaysQuery.data],
  );

  return useMemo(() => {
    if (!enabled || search.trim().length > 0) {
      return null;
    }

    if (selectedSellerPersonalCategoryId) {
      const tile = (personalTilesQuery.data ?? []).find(
        (item) => item._id === selectedSellerPersonalCategoryId,
      );
      return tile?.labelRu ?? null;
    }

    if (selectedSubcategoryId) {
      const breadcrumb = breadcrumbQuery.data;
      if (breadcrumb) {
        const trail = breadcrumb.items.map((item) => item.labelRu).join(" › ");
        return trail || breadcrumb.labelRu;
      }

      const root = (categoryRootsQuery.data ?? []).find(
        (item) => item.id === selectedSubcategoryId,
      );
      if (root) {
        return root.labelRu;
      }
    }

    if (selectedRootSlug) {
      const chip = categoryChips.find((item) => item.slug === selectedRootSlug);
      return chip?.label ?? null;
    }

    return resolveActiveCatalogFeedLabel({
      sort: feedFilters.sort,
      followingOnly: feedFilters.followingOnly,
      auctionOnly: feedFilters.auctionOnly,
      installmentOnly: feedFilters.installmentOnly,
      saleOnly: feedFilters.saleOnly,
    });
  }, [
    breadcrumbQuery.data,
    categoryChips,
    categoryRootsQuery.data,
    enabled,
    feedFilters.auctionOnly,
    feedFilters.followingOnly,
    feedFilters.installmentOnly,
    feedFilters.saleOnly,
    feedFilters.sort,
    personalTilesQuery.data,
    search,
    selectedRootSlug,
    selectedSellerPersonalCategoryId,
    selectedSubcategoryId,
  ]);
};
