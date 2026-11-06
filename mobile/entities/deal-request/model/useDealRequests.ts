import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { dealRequestQueryKeys } from "@/shared/api";

import {
  createDealRequest,
  fetchMyDealRequests,
  postDealRequestAction,
  type DealRequestRole,
} from "../api/dealRequestApi";

export const DEAL_REQUESTS_PAGE_SIZE = 20;

/** Заявки постранично — паритет web `useMyDealRequestsQuery`. */
export const useMyDealRequestsQuery = ({
  role,
  enabled = true,
}: {
  role: DealRequestRole;
  enabled?: boolean;
}) =>
  useInfiniteQuery({
    queryKey: dealRequestQueryKeys.mine(role),
    queryFn: ({ pageParam }) =>
      fetchMyDealRequests({ role, page: pageParam, limit: DEAL_REQUESTS_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    enabled,
    staleTime: 15_000,
  });

export const useCreateDealRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDealRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: dealRequestQueryKeys.all }),
  });
};

/**
 * Любое действие над заявкой. Списки перечитываются и после ошибки: «заявка
 * уже изменилась» значит, что на экране устаревшие кнопки.
 */
export const useDealRequestActionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postDealRequestAction,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: dealRequestQueryKeys.all }),
  });
};
