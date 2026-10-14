import { useQuery } from "@tanstack/react-query";

import { fetchCdekAvailability } from "@/entities/cdek/api/cdekCheckoutApi";

export const cdekQueryKeys = {
  all: ["cdek"] as const,
  availability: (sellerId: string) =>
    [...cdekQueryKeys.all, "availability", sellerId] as const,
};

/**
 * Предлагать ли СДЭК у этого продавца. Спрашиваем дёшево — из базы, без
 * похода в саму службу.
 *
 * Не смогли узнать — вариант просто не показываем: оформление с самовывозом
 * или доставкой продавцом из-за этого ломаться не должно. Ошибка остаётся в
 * `query.error` и в журнале запросов.
 */
export const useCdekAvailabilityQuery = (sellerId: string, { enabled = true } = {}) =>
  useQuery({
    queryKey: cdekQueryKeys.availability(sellerId),
    queryFn: () => fetchCdekAvailability(sellerId),
    enabled: enabled && sellerId.length > 0,
    staleTime: 60_000,
    retry: false,
  });
