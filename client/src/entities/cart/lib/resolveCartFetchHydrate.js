/**
 * Решение после fetch корзины: гидрировать только после успешного ответа.
 * На ошибке не трогаем локальное состояние и не включаем remote sync
 * (иначе replaceCart({}) сотрёт серверную корзину).
 *
 * @param {{ isSuccess: boolean; isError: boolean }} status
 * @returns {"hydrate" | "block-sync" | "wait"}
 */
export function resolveCartFetchHydrate({ isSuccess, isError }) {
  if (isSuccess) {
    return "hydrate";
  }
  if (isError) {
    return "block-sync";
  }
  return "wait";
}
