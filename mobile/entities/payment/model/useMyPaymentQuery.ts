import { PAYMENT_STATUS_SUCCEEDED } from "@molha/api-contract";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchMyPayment } from "@/entities/payment/api/paymentApi";
import { authMeQueryKeys, loyaltyPointsQueryKeys } from "@/shared/api";

import { paymentQueryKeys } from "./paymentQueryKeys";

export const useMyPaymentQuery = ({ paymentId }: { paymentId: string | null }) => {
  const queryClient = useQueryClient();
  const id = paymentId?.trim() ? String(paymentId) : "";

  return useQuery({
    queryKey: paymentQueryKeys.one(id),
    queryFn: async () => {
      const payment = await fetchMyPayment(id);
      if (payment?.status === PAYMENT_STATUS_SUCCEEDED) {
        void queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
        void queryClient.invalidateQueries({ queryKey: authMeQueryKeys.all });
      }
      return payment;
    },
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data?.status === "created" ? 3_000 : false,
  });
};
