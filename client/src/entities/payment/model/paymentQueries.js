import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createLoyaltyPointsPayment,
  fetchMyPayment,
  fetchPaymentConfig,
} from "../api/paymentApi.js";

export const paymentQueryKeys = {
  config: () => ["payment", "config"],
  /** @param {string} paymentId */
  one: (paymentId) => ["payment", "one", paymentId],
};

/** Настроен ли приём платежей: пока нет — показываем прежнюю заглушку. */
export function usePaymentConfigQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: paymentQueryKeys.config(),
    queryFn: fetchPaymentConfig,
    enabled,
    // Конфиг меняется только вместе с деплоем — дёргать его чаще незачем.
    staleTime: 10 * 60_000,
  });
}

export function useCreateLoyaltyPointsPaymentMutation() {
  return useMutation({ mutationFn: createLoyaltyPointsPayment });
}

/**
 * Статус платежа после возврата с формы оплаты.
 *
 * Пока платёж висит в `created`, опрашиваем: уведомление от банка обычно
 * успевает раньше, но покупатель не должен смотреть на «ожидает оплаты» с
 * уже списанными деньгами.
 *
 * @param {{ paymentId: string | null }} params
 */
export function useMyPaymentQuery({ paymentId }) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: paymentQueryKeys.one(String(paymentId ?? "")),
    queryFn: async () => {
      const payment = await fetchMyPayment(String(paymentId));
      if (payment?.status === "succeeded") {
        // Баланс в шапке и на странице обновится сам.
        void queryClient.invalidateQueries({ queryKey: ["loyalty-points"] });
        void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
      return payment;
    },
    enabled: Boolean(paymentId),
    refetchInterval: (query) =>
      query.state.data?.status === "created" ? 3_000 : false,
  });
}
