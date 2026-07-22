import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { seedCatalogProductQueryCache } from "@/entities/product/lib/seedCatalogProductQueryCache";

import { USER_PROFILE_PRODUCTS_API_LIMIT_MAX } from "@/entities/user/model/constants";
import { useUserProfileProductsAllPagesQuery } from "@/entities/user/model/useUserProfileProductsAllPagesQuery";
import { useUserProfileProductsQuery } from "@/entities/user/model/useUserProfileProductsQuery";
import type { UserProfileThumbItem } from "@/entities/user/model/userProfileThumbTypes";
import {
  UserProfileThumbSection,
  type UserProfileThumbSectionLayout,
} from "@/entities/user/ui/UserProfileThumbSection";
import {
  API_CLIENT_UI,
  USER_PROFILE_PRODUCTS_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

type UserProfileProductsListProps = {
  targetUserId: string;
  onViewAllProducts?: () => void;
  hideWhenEmpty?: boolean;
  heading?: string;
  layout?: UserProfileThumbSectionLayout;
};

export const UserProfileProductsList = ({
  targetUserId,
  onViewAllProducts,
  hideWhenEmpty = false,
  heading = USER_PROFILE_PRODUCTS_UI.HEADING,
  layout = "grid",
}: UserProfileProductsListProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isHorizontal = layout === "horizontal";
  const previewQuery = useUserProfileProductsQuery({
    userId: targetUserId,
    limit: USER_PROFILE_PRODUCTS_API_LIMIT_MAX,
    enabled: !isHorizontal,
  });
  const [loadAllPages, setLoadAllPages] = useState(isHorizontal);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState("");
  const allPagesQuery = useUserProfileProductsAllPagesQuery({
    userId: targetUserId,
    enabled: loadAllPages || isHorizontal,
  });

  useEffect(() => {
    setIsExpanded(false);
    setLoadAllPages(isHorizontal);
    setError("");
  }, [isHorizontal, targetUserId]);

  useEffect(() => {
    if (allPagesQuery.isSuccess && loadAllPages && !isHorizontal) {
      setIsExpanded(true);
    }
  }, [allPagesQuery.isSuccess, isHorizontal, loadAllPages]);

  useEffect(() => {
    if (allPagesQuery.isError) {
      setError(formatApiErrorMessage(allPagesQuery.error, API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK));
    }
  }, [allPagesQuery.error, allPagesQuery.isError]);

  const previewItems = (previewQuery.data?.items ?? []) as UserProfileThumbItem[];
  const previewTotal = previewQuery.data?.pagination?.total ?? previewItems.length;
  const allItems = (allPagesQuery.data?.items ?? []) as UserProfileThumbItem[];
  const allTotal = allPagesQuery.data?.pagination?.total ?? allItems.length;

  const items = isHorizontal
    ? allItems.length > 0
      ? allItems
      : previewItems
    : isExpanded
      ? allItems.length > 0
        ? allItems
        : previewItems
      : previewItems;
  const total = isHorizontal
    ? allTotal || previewTotal
    : isExpanded
      ? allTotal || previewTotal
      : previewTotal;

  const isPending = isHorizontal ? allPagesQuery.isPending : previewQuery.isPending;
  const isError = isHorizontal
    ? allPagesQuery.isError && items.length === 0
    : previewQuery.isError && previewItems.length === 0;
  const phase = isPending ? "loading" : isError ? "error" : "success";

  const fetchError = formatApiErrorMessage(
    isHorizontal ? allPagesQuery.error : previewQuery.error,
    API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK,
  );
  const displayError = error || (phase === "error" ? fetchError : "");

  if (hideWhenEmpty && phase === "success" && total === 0) {
    return null;
  }

  const handleShowMore = () => {
    if (isHorizontal || allPagesQuery.isFetching) {
      return;
    }
    setError("");
    if (allPagesQuery.data != null || previewItems.length >= previewTotal) {
      setIsExpanded(true);
      return;
    }
    setLoadAllPages(true);
  };

  const handleProductPress = (item: UserProfileThumbItem) => {
    if (!item.product?._id) {
      return;
    }
    const productId = String(item.product._id);
    seedCatalogProductQueryCache(queryClient, item.product as Record<string, unknown>);
    router.push({ pathname: "/product/[id]", params: { id: productId } });
  };

  return (
    <UserProfileThumbSection
      heading={heading}
      phase={phase}
      items={items}
      totalCount={total}
      layout={layout}
      loadingText={USER_PROFILE_PRODUCTS_UI.LOADING}
      emptyText={USER_PROFILE_PRODUCTS_UI.EMPTY}
      errorText={displayError}
      unavailableText={USER_PROFILE_PRODUCTS_UI.UNAVAILABLE}
      onItemPress={handleProductPress}
      onHeadingPress={onViewAllProducts}
      viewAllLabel={USER_PROFILE_PRODUCTS_UI.VIEW_ALL}
      onViewAllPress={onViewAllProducts}
      showMoreLabel={isHorizontal ? undefined : USER_PROFILE_PRODUCTS_UI.SHOW_MORE}
      showLessLabel={isHorizontal ? undefined : USER_PROFILE_PRODUCTS_UI.SHOW_LESS}
      loadingMoreLabel={USER_PROFILE_PRODUCTS_UI.LOADING_MORE}
      isExpanded={isExpanded}
      isLoadingMore={allPagesQuery.isFetching}
      onShowMore={isHorizontal ? undefined : handleShowMore}
      onShowLess={isHorizontal ? undefined : () => setIsExpanded(false)}
    />
  );
};
