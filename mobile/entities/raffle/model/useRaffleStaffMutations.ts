import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveRaffle,
  fetchStaffRafflesQueue,
  rejectRaffle,
} from "@/entities/raffle/api/raffleStaffApi";
import { raffleQueryKeys } from "@/shared/api";

export const useStaffRafflesQueueQuery = (enabled = true) =>
  useQuery({
    queryKey: raffleQueryKeys.staffQueue(),
    queryFn: fetchStaffRafflesQueue,
    enabled,
  });

export const useRaffleStaffMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: raffleQueryKeys.all });
  };

  const approveMutation = useMutation({
    mutationFn: (raffleId: string) => approveRaffle(raffleId),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: (raffleId: string) => rejectRaffle(raffleId),
    onSuccess: invalidate,
  });

  return { approveMutation, rejectMutation };
};
