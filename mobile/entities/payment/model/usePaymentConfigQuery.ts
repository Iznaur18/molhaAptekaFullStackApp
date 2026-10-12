import { isCardPrepaidAvailableForSellers } from "@izibuy/shared-lib";
import { useQuery } from "@tanstack/react-query";

import { fetchPaymentConfig } from "@/entities/payment/api/paymentApi";

import { paymentQueryKeys } from "./paymentQueryKeys";

export const usePaymentConfigQuery = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: paymentQueryKeys.config(),
    queryFn: fetchPaymentConfig,
    enabled,
    // Конфиг меняется только вместе с деплоем — дёргать его чаще незачем.
    staleTime: 10 * 60_000,
  });

/**
 * Можно ли платить по СБП заранее за товары этих продавцов.
 *
 * Конфиг не загрузился — предоплаты нет: покупателю остаются способы, для
 * которых площадка не нужна, а заказ оформить всё равно можно.
 */
export const useCardPrepaidAvailable = ({
  sellerIds,
  enabled = true,
}: {
  sellerIds: readonly string[];
  enabled?: boolean;
}): boolean => {
  const configQuery = usePaymentConfigQuery({ enabled });
  return isCardPrepaidAvailableForSellers(
    configQuery.data?.cardPrepaidSellerIds,
    sellerIds,
  );
};
