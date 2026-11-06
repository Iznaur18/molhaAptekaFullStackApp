import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  fetchProductReviewSummary,
  fetchProductReviewsPage,
} from "../api/productReviewApi";
import { productReviewQueryKeys } from "./productReviewQueryKeys";

export const useProductReviewSummaryQuery = (productId: string, enabled = true) =>
  useQuery({
    queryKey: productReviewQueryKeys.summary(productId),
    queryFn: () => fetchProductReviewSummary(productId),
    enabled: Boolean(productId) && enabled,
  });

/**
 * Отзывы страницами — паритет web `useProductReviewsQuery` («Показать ещё»).
 * Раньше приложение брало только первую страницу и молча прятало остальные.
 */
export const useProductReviewsInfiniteQuery = (productId: string, enabled = true) =>
  useInfiniteQuery({
    queryKey: productReviewQueryKeys.pages(productId),
    queryFn: ({ pageParam }) => fetchProductReviewsPage(productId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = lastPage.pagination?.page ?? 1;
      const totalPages = lastPage.pagination?.totalPages ?? 1;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(productId) && enabled,
  });
