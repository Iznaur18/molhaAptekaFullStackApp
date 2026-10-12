import { isCardPrepaidAvailableForSellers } from "@izibuy/shared-lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createLoyaltyPointsPayment,
  createOrderPayment,
  createUsersMonthlyDonationPayment,
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

export function useCreateUsersMonthlyDonationPaymentMutation() {
  return useMutation({ mutationFn: createUsersMonthlyDonationPayment });
}

export function useCreateOrderPaymentMutation() {
  return useMutation({ mutationFn: createOrderPayment });
}

/**
 * Можно ли платить картой заранее за эту корзину.
 *
 * Пока деньги идут на счёт площадки, предоплата доступна только за её
 * собственный товар: за чужой это уже сплит.
 *
 * @param {{ sellerIds: string[] }} params
 */
export function useCardPrepaidAvailable({ sellerIds }) {
  const configQuery = usePaymentConfigQuery();
  return isCardPrepaidAvailableForSellers(
    configQuery.data?.cardPrepaidSellerIds,
    sellerIds,
  );
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
        void queryClient.invalidateQueries({ queryKey: ["users-monthly-loyalty"] });
      }
      return payment;
    },
    enabled: Boolean(paymentId),
    refetchInterval: (query) =>
      query.state.data?.status === "created" ? 3_000 : false,
  });
}
