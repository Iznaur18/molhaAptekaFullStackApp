import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { seedCatalogProductQueryCache } from "@/entities/product/lib/seedCatalogProductQueryCache";

import { USER_PROFILE_PRODUCTS_PAGE_SIZE } from "@/entities/user/model/constants";
import { useUserProfileProductsAllPagesQuery } from "@/entities/user/model/useUserProfileProductsAllPagesQuery";
import { useUserProfileProductsQuery } from "@/entities/user/model/useUserProfileProductsQuery";
import type { UserProfileThumbItem } from "@/entities/user/model/userProfileThumbTypes";
import { UserProfileThumbSection } from "@/entities/user/ui/UserProfileThumbSection";
import {
  API_CLIENT_UI,
  USER_PROFILE_PRODUCTS_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

type UserProfileProductsListProps = {
  targetUserId: string;
  onViewAllProducts?: () => void;
};

export const UserProfileProductsList = ({
  targetUserId,
  onViewAllProducts,
}: UserProfileProductsListProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previewQuery = useUserProfileProductsQuery({ userId: targetUserId });
  const [loadAllPages, setLoadAllPages] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState("");
  const allPagesQuery = useUserProfileProductsAllPagesQuery({
    userId: targetUserId,
    enabled: loadAllPages,
  });

  useEffect(() => {
    setIsExpanded(false);
    setLoadAllPages(false);
    setError("");
  }, [targetUserId]);

  useEffect(() => {
    if (allPagesQuery.isSuccess && loadAllPages) {
      setIsExpanded(true);
    }
  }, [allPagesQuery.isSuccess, loadAllPages]);

  useEffect(() => {
    if (allPagesQuery.isError) {
      setError(formatApiErrorMessage(allPagesQuery.error, API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK));
    }
  }, [allPagesQuery.error, allPagesQuery.isError]);

  const previewItems = (previewQuery.data?.items ?? []) as UserProfileThumbItem[];
  const previewTotal = previewQuery.data?.pagination?.total ?? previewItems.length;
  const expandedItems = (allPagesQuery.data?.items ?? previewItems) as UserProfileThumbItem[];
  const expandedTotal = allPagesQuery.data?.pagination?.total ?? previewTotal;
  const items = isExpanded ? expandedItems : previewItems;
  const total = isExpanded ? expandedTotal : previewTotal;

  const phase = previewQuery.isPending
    ? "loading"
    : previewQuery.isError && previewItems.length === 0
      ? "error"
      : "success";

  const fetchError = formatApiErrorMessage(
    previewQuery.error,
    API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK,
  );
  const displayError = error || (phase === "error" ? fetchError : "");

  const canExpand = total > USER_PROFILE_PRODUCTS_PAGE_SIZE;

  const handleShowMore = () => {
    if (!canExpand || allPagesQuery.isFetching) {
      return;
    }
    setError("");
    if (previewItems.length >= previewTotal) {
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
      heading={USER_PROFILE_PRODUCTS_UI.HEADING}
      phase={phase}
      items={items}
      loadingText={USER_PROFILE_PRODUCTS_UI.LOADING}
      emptyText={USER_PROFILE_PRODUCTS_UI.EMPTY}
      errorText={displayError}
      unavailableText={USER_PROFILE_PRODUCTS_UI.UNAVAILABLE}
      onItemPress={handleProductPress}
      onHeadingPress={onViewAllProducts}
      viewAllLabel={USER_PROFILE_PRODUCTS_UI.VIEW_ALL}
      onViewAllPress={onViewAllProducts}
      showMoreLabel={USER_PROFILE_PRODUCTS_UI.SHOW_MORE}
      showLessLabel={USER_PROFILE_PRODUCTS_UI.SHOW_LESS}
      loadingMoreLabel={USER_PROFILE_PRODUCTS_UI.LOADING_MORE}
      canExpand={canExpand}
      isExpanded={isExpanded}
      isLoadingMore={allPagesQuery.isFetching}
      onShowMore={handleShowMore}
      onShowLess={() => setIsExpanded(false)}
    />
  );
};
