import { useQuery } from "@tanstack/react-query";

import { fetchYandexDeliveryAvailability } from "@/entities/yandex-delivery/api/yandexDeliveryCheckoutApi";

export const yandexDeliveryQueryKeys = {
  all: ["yandex-delivery"] as const,
  availability: (sellerId: string) =>
    [...yandexDeliveryQueryKeys.all, "availability", sellerId] as const,
};

/**
 * Предлагать ли Яндекс Доставку у этого продавца — по его договору.
 *
 * Не смогли узнать — вариант просто не показываем: оформление с самовывозом
 * или другой службой из-за этого ломаться не должно. Ошибка остаётся в
 * `query.error` и в журнале запросов.
 */
export const useYandexDeliveryAvailabilityQuery = (
  sellerId: string,
  { enabled = true } = {},
) =>
  useQuery({
    queryKey: yandexDeliveryQueryKeys.availability(sellerId),
    queryFn: () => fetchYandexDeliveryAvailability(sellerId),
    enabled: enabled && sellerId.length > 0,
    staleTime: 60_000,
    retry: false,
  });
