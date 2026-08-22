import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  fetchProductQuestionSummary,
  fetchProductQuestionsPage,
} from "../api/productQuestionApi";
import { productQuestionQueryKeys } from "./productQuestionQueryKeys";

type UseProductQuestionsQueryOptions = {
  productId: string;
  enabled?: boolean;
};

export const useProductQuestionsQuery = ({
  productId,
  enabled = true,
}: UseProductQuestionsQueryOptions) => {
  const isEnabled = enabled && Boolean(productId);

  const summaryQuery = useQuery({
    queryKey: productQuestionQueryKeys.summary(productId),
    queryFn: () => fetchProductQuestionSummary(productId),
    enabled: isEnabled,
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

  const lastPagination = questionsQuery.data?.pages.at(-1)?.pagination;

  return {
    summaryQuery,
    questionsQuery,
    questions,
    totalPages: lastPagination?.totalPages ?? 0,
    currentPage: lastPagination?.page ?? 0,
    hasNextPage: questionsQuery.hasNextPage,
    isLoading: summaryQuery.isPending || questionsQuery.isPending,
    isLoadingMore: questionsQuery.isFetchingNextPage,
    isError: summaryQuery.isError || questionsQuery.isError,
    error: summaryQuery.error ?? questionsQuery.error,
  };
};
