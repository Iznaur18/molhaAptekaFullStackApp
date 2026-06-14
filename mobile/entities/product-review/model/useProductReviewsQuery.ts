import { useQuery } from "@tanstack/react-query";

import { fetchProductReviewSummary, fetchProductReviewsPage } from "../api/productReviewApi";
import { productReviewQueryKeys } from "./productReviewQueryKeys";

export const useProductReviewSummaryQuery = (productId: string, enabled = true) =>
  useQuery({
    queryKey: productReviewQueryKeys.summary(productId),
    queryFn: () => fetchProductReviewSummary(productId),
    enabled: Boolean(productId) && enabled,
  });

export const useProductReviewsPageQuery = (productId: string, enabled = true) =>
  useQuery({
    queryKey: productReviewQueryKeys.list(productId, 1),
    queryFn: () => fetchProductReviewsPage(productId, 1),
    enabled: Boolean(productId) && enabled,
  });
