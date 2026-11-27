import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  acceptCourierShipment,
  completeCourierDelivery,
  confirmCourierHandover,
  declineCourierShipment,
  fetchCourierOverview,
  fetchMyCourierDeliveries,
  fetchMyCourierProfile,
  markCourierArrived,
  startCourierDelivery,
  submitCourierApplication,
} from "@/entities/courier/api/courierApi";

export const courierQueryKeys = {
  me: ["courier", "me"] as const,
  overview: (coords: { lat: number; lon: number } | null) =>
    ["courier", "overview", coords?.lat ?? null, coords?.lon ?? null] as const,
  myDeliveries: ["courier", "my-deliveries"] as const,
};

export const useMyCourierProfileQuery = (enabled = true) =>
  useQuery({
    queryKey: courierQueryKeys.me,
    queryFn: fetchMyCourierProfile,
    enabled,
    staleTime: 30_000,
  });

export const useSubmitCourierApplicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitCourierApplication,
    onSuccess: (courier) => {
      queryClient.setQueryData(courierQueryKeys.me, courier);
      void queryClient.invalidateQueries({ queryKey: courierQueryKeys.me });
    },
  });
};

export const useCourierOverviewQuery = ({
  enabled = true,
  coords = null,
}: {
  enabled?: boolean;
  coords?: { lat: number; lon: number } | null;
} = {}) =>
  useQuery({
    queryKey: courierQueryKeys.overview(coords),
    queryFn: () =>
      fetchCourierOverview({
        lat: coords?.lat ?? null,
        lon: coords?.lon ?? null,
      }),
    enabled,
    staleTime: 15_000,
  });

export const useMyCourierDeliveriesQuery = (enabled = true) =>
  useQuery({
    queryKey: courierQueryKeys.myDeliveries,
    queryFn: fetchMyCourierDeliveries,
    enabled,
    staleTime: 10_000,
  });

const useInvalidateCourierLists = () => {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: ["courier", "overview"] });
    await queryClient.invalidateQueries({ queryKey: courierQueryKeys.myDeliveries });
  };
};

export const useAcceptCourierShipmentMutation = () => {
  const invalidate = useInvalidateCourierLists();
  return useMutation({
    mutationFn: acceptCourierShipment,
    onSuccess: () => void invalidate(),
  });
};

export const useConfirmCourierHandoverMutation = () => {
  const invalidate = useInvalidateCourierLists();
  return useMutation({
    mutationFn: confirmCourierHandover,
    onSuccess: () => void invalidate(),
  });
};

export const useStartCourierDeliveryMutation = () => {
  const invalidate = useInvalidateCourierLists();
  return useMutation({
    mutationFn: startCourierDelivery,
    onSuccess: () => void invalidate(),
  });
};

export const useMarkCourierArrivedMutation = () => {
  const invalidate = useInvalidateCourierLists();
  return useMutation({
    mutationFn: markCourierArrived,
    onSuccess: () => void invalidate(),
  });
};

export const useCompleteCourierDeliveryMutation = () => {
  const invalidate = useInvalidateCourierLists();
  return useMutation({
    mutationFn: completeCourierDelivery,
    onSuccess: () => void invalidate(),
  });
};

export const useDeclineCourierShipmentMutation = () => {
  const invalidate = useInvalidateCourierLists();
  return useMutation({
    mutationFn: declineCourierShipment,
    onSuccess: () => void invalidate(),
  });
};
