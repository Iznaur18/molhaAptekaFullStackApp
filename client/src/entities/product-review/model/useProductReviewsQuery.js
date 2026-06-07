import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchProductReviewSummary } from "../api/fetchProductReviewSummary.js";
import { fetchProductReviewsPage } from "../api/fetchProductReviewsPage.js";
import { productReviewQueryKeys } from "./productReviewQueryKeys.js";

/**
 * @param {{ productId: string; enabled?: boolean }} params
 */
export function useProductReviewsQuery({ productId, enabled = true }) {
  const isEnabled = enabled && Boolean(productId);

  const summaryQuery = useQuery({
    queryKey: productReviewQueryKeys.summary(productId),
    enabled: isEnabled,
    queryFn: () => fetchProductReviewSummary(productId),
  });

  const reviewsQuery = useInfiniteQuery({
    queryKey: productReviewQueryKeys.list(productId),
    enabled: isEnabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchProductReviewsPage(productId, { page: Number(pageParam) }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const reviews = useMemo(
    () => reviewsQuery.data?.pages.flatMap((page) => page.reviews) ?? [],
    [reviewsQuery.data],
  );

  const totalPages = reviewsQuery.data?.pages.at(-1)?.pagination.totalPages ?? 0;
  const currentPage = reviewsQuery.data?.pages.at(-1)?.pagination.page ?? 0;

  return {
    summaryQuery,
    reviewsQuery,
    reviews,
    totalPages,
    currentPage,
    isLoading: summaryQuery.isLoading || reviewsQuery.isLoading,
    isLoadingMore: reviewsQuery.isFetchingNextPage,
    error: summaryQuery.error ?? reviewsQuery.error,
  };
}
