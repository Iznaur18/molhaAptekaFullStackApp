import { useMutation, useQuery } from "@tanstack/react-query";

import {
  approveRaffle,
  deleteRaffleByStaff,
  fetchStaffRafflesQueue,
  rejectRaffle,
} from "@/entities/raffle/api/raffleStaffApi";
import { patchRaffleByStaff } from "@/entities/raffle/api/patchRaffleByStaff";
import type { CreateRaffleBody } from "@/entities/raffle/api/createRaffle";
import { raffleQueryKeys } from "@/shared/api";

export const useStaffRafflesQueueQuery = (enabled = true) =>
  useQuery({
    queryKey: raffleQueryKeys.staffQueue(),
    queryFn: fetchStaffRafflesQueue,
    enabled,
  });

export const useRaffleStaffMutations = () => {
  const approveMutation = useMutation({
    mutationFn: (raffleId: string) => approveRaffle(raffleId),
  });

  const rejectMutation = useMutation({
    mutationFn: (raffleId: string) => rejectRaffle(raffleId),
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (raffleId: string) => deleteRaffleByStaff(raffleId),
  });

  const patchStaffMutation = useMutation({
    mutationFn: ({ raffleId, body }: { raffleId: string; body: Partial<CreateRaffleBody> }) =>
      patchRaffleByStaff(raffleId, body),
  });

  return { approveMutation, rejectMutation, deleteStaffMutation, patchStaffMutation };
};
