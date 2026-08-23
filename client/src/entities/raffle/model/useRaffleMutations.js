import { useMutation, useQueryClient } from "@tanstack/react-query";

import { approveRaffle } from "../api/approveRaffle.js";
import { createRaffle } from "../api/createRaffle.js";
import { deleteMyRaffle } from "../api/deleteMyRaffle.js";
import { deleteRaffleByStaff } from "../api/deleteRaffleByStaff.js";
import { patchMyRaffle } from "../api/patchMyRaffle.js";
import { patchRaffleByStaff } from "../api/patchRaffleByStaff.js";
import { pauseMyRaffle } from "../api/pauseMyRaffle.js";
import { rejectRaffle } from "../api/rejectRaffle.js";
import { setProductRaffleParticipation } from "../api/setProductRaffleParticipation.js";
import { invalidateLoyaltyPointsBalances } from "../../../entities/user/lib/loyaltyPointsQueryCache.js";
import {
  invalidateAllRaffleQueries,
  invalidateMyRaffle,
  invalidateStaffRafflesQueue,
} from "../lib/raffleQueryCache.js";
import { raffleQueryKeys } from "./raffleQueryKeys.js";

export function useRaffleMutations() {
  const queryClient = useQueryClient();

  const invalidateRaffles = () => void invalidateAllRaffleQueries(queryClient);

  const createMutation = useMutation({
    mutationFn: createRaffle,
    onSuccess: invalidateRaffles,
  });

  const patchMyMutation = useMutation({
    mutationFn: ({ raffleId, body }) => patchMyRaffle(raffleId, body),
    onSuccess: () => {
      void invalidateMyRaffle(queryClient);
      invalidateRaffles();
    },
  });

  const patchStaffMutation = useMutation({
    mutationFn: ({ raffleId, body }) => patchRaffleByStaff(raffleId, body),
    onSuccess: () => {
      void invalidateStaffRafflesQueue(queryClient);
      invalidateRaffles();
    },
  });

  const deleteMyMutation = useMutation({
    mutationFn: deleteMyRaffle,
    onSuccess: () => {
      void invalidateMyRaffle(queryClient);
      void queryClient.invalidateQueries({
        queryKey: raffleQueryKeys.createAdvertising(),
      });
      void invalidateLoyaltyPointsBalances(queryClient);
      invalidateRaffles();
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (raffleId) => deleteRaffleByStaff(raffleId),
    onSuccess: () => {
      void invalidateStaffRafflesQueue(queryClient);
      invalidateRaffles();
    },
  });

  const pauseMyMutation = useMutation({
    mutationFn: (raffleId) => pauseMyRaffle(raffleId),
    onSuccess: () => {
      void invalidateMyRaffle(queryClient);
      invalidateRaffles();
    },
  });

  const setParticipationMutation = useMutation({
    mutationFn: ({ productId, enabled }) =>
      setProductRaffleParticipation(productId, enabled),
    onSuccess: invalidateRaffles,
  });

  const approveMutation = useMutation({
    mutationFn: (raffleId) => approveRaffle(raffleId),
    onSuccess: () => {
      void invalidateStaffRafflesQueue(queryClient);
      invalidateRaffles();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (raffleId) => rejectRaffle(raffleId),
    onSuccess: () => {
      void invalidateStaffRafflesQueue(queryClient);
      invalidateRaffles();
    },
  });

  return {
    createMutation,
    patchMyMutation,
    patchStaffMutation,
    deleteMyMutation,
    deleteStaffMutation,
    pauseMyMutation,
    setParticipationMutation,
    approveMutation,
    rejectMutation,
  };
}
