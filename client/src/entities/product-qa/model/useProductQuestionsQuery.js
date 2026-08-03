import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchProductQuestionSummary } from "../api/fetchProductQuestionSummary.js";
import { fetchProductQuestionsPage } from "../api/fetchProductQuestionsPage.js";
import { productQuestionQueryKeys } from "./productQuestionQueryKeys.js";

/**
 * @param {{ productId: string; enabled?: boolean }} params
 */
export function useProductQuestionsQuery({ productId, enabled = true }) {
  const isEnabled = enabled && Boolean(productId);

  const summaryQuery = useQuery({
    queryKey: productQuestionQueryKeys.summary(productId),
    enabled: isEnabled,
    queryFn: () => fetchProductQuestionSummary(productId),
  });

  const questionsQuery = useInfiniteQuery({
    queryKey: productQuestionQueryKeys.list(productId),
    enabled: isEnabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchProductQuestionsPage(productId, { page: Number(pageParam) }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const questions = useMemo(
    () => questionsQuery.data?.pages.flatMap((page) => page.questions) ?? [],
    [questionsQuery.data],
  );

  const totalPages = questionsQuery.data?.pages.at(-1)?.pagination.totalPages ?? 0;
  const currentPage = questionsQuery.data?.pages.at(-1)?.pagination.page ?? 0;

  return {
    summaryQuery,
    questionsQuery,
    questions,
    totalPages,
    currentPage,
    isLoading: summaryQuery.isLoading || questionsQuery.isLoading,
    isLoadingMore: questionsQuery.isFetchingNextPage,
    error: summaryQuery.error ?? questionsQuery.error,
  };
}
