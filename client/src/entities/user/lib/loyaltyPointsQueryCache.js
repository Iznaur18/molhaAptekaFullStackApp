import { authMeQueryKeys } from "../model/authMeQueryKeys.js";
import { loyaltyPointsQueryKeys } from "../model/loyaltyPointsQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateLoyaltyPointsStatus(queryClient) {
  return queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
}

/**
 * Баланс баллов живёт в ДВУХ кэшах: `/user/me/loyalty-points/status` и
 * `/auth/me` (шелл читает `user.userLoyaltyPoints` через `useAuthSession` —
 * лимиты продавца, модалки баллов, промо). Денежная мутация обязана освежить
 * оба: инвалидация только loyalty-status оставляла в шапке протухший баланс
 * до перезагрузки вкладки. На мобилке это уже сделано так же.
 *
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateLoyaltyPointsBalances(queryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: authMeQueryKeys.all }),
  ]);
}
