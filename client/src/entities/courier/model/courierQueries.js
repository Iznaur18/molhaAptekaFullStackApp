import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchCourierApplications,
  fetchMyCourierProfile,
  reviewCourierApplication,
  submitCourierApplication,
  fetchCourierOverview,
  fetchMyCourierDeliveries,
  acceptCourierShipment,
  confirmCourierHandover,
  startCourierDelivery,
  markCourierArrived,
  completeCourierDelivery,
  issueHandoverCode,
  raiseShipmentDeliveryFee,
  replaceShipmentCourier,
  setShipmentPaymentConfirmed,
} from "../api/courierApi.js";

export const courierQueryKeys = {
  me: () => ["courier", "me"],
  /** @param {string} status */
  queue: (status) => ["courier", "queue", status],
};

/** @param {{ enabled?: boolean }} [options] */
export function useMyCourierProfileQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: courierQueryKeys.me(),
    queryFn: fetchMyCourierProfile,
    enabled,
    staleTime: 30_000,
  });
}

export function useSubmitCourierApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitCourierApplication,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courierQueryKeys.me() });
    },
  });
}

/** @param {{ status: string; enabled?: boolean }} params */
export function useCourierApplicationsQuery({ status, enabled = true }) {
  return useQuery({
    queryKey: courierQueryKeys.queue(status),
    queryFn: () => fetchCourierApplications({ status }),
    enabled,
    staleTime: 10_000,
  });
}

export function useReviewCourierApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewCourierApplication,
    onSuccess: () => {
      // Решение переносит заявку между вкладками очереди — инвалидируем все.
      void queryClient.invalidateQueries({ queryKey: ["courier", "queue"] });
    },
  });
}

/** Ключи курьерских списков — оба инвалидируются после любого шага. */
export const courierListKeys = {
  overview: () => ["courier", "overview"],
  myDeliveries: () => ["courier", "my-deliveries"],
};

/** @param {{ enabled?: boolean; coords?: { lat: number; lon: number } | null }} [options] */
export function useCourierOverviewQuery({ enabled = true, coords = null } = {}) {
  return useQuery({
    queryKey: [...courierListKeys.overview(), coords?.lat ?? null, coords?.lon ?? null],
    queryFn: () => fetchCourierOverview(coords ?? {}),
    enabled,
    staleTime: 15_000,
  });
}

/** @param {{ enabled?: boolean }} [options] */
export function useMyCourierDeliveriesQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: courierListKeys.myDeliveries(),
    queryFn: fetchMyCourierDeliveries,
    enabled,
    staleTime: 10_000,
  });
}

/**
 * Любой шаг курьера двигает отправление между «Обзором» и «Моими доставками»,
 * поэтому оба списка инвалидируются вместе.
 *
 * @param {(input: any) => Promise<unknown>} mutationFn
 */
function useCourierStepMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["courier"] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export const useAcceptCourierShipmentMutation = () =>
  useCourierStepMutation(acceptCourierShipment);
export const useConfirmCourierHandoverMutation = () =>
  useCourierStepMutation(confirmCourierHandover);
export const useStartCourierDeliveryMutation = () =>
  useCourierStepMutation(startCourierDelivery);
export const useMarkCourierArrivedMutation = () =>
  useCourierStepMutation(markCourierArrived);
export const useCompleteCourierDeliveryMutation = () =>
  useCourierStepMutation(completeCourierDelivery);
export const useIssueHandoverCodeMutation = () =>
  useCourierStepMutation(issueHandoverCode);
export const useSetShipmentPaymentConfirmedMutation = () =>
  useCourierStepMutation(setShipmentPaymentConfirmed);
export const useReplaceShipmentCourierMutation = () =>
  useCourierStepMutation(replaceShipmentCourier);
export const useRaiseDeliveryFeeMutation = () =>
  useCourierStepMutation(raiseShipmentDeliveryFee);
