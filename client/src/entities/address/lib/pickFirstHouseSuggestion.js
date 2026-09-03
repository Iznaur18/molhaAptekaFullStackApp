/**
 * Первая подсказка, точная до адреса — дома или участка.
 *
 * Участок («уч 27а») дом не имеет: DaData кладёт его идентификатор в
 * `stead_fias_id`, а `house_fias_id` оставляет пустым. Сервер такие адреса
 * принимает давно (utils/dadata/verifyRuDeliveryAddress.js), а здесь они
 * отбрасывались — и адрес на участке не мог получить координаты. Без них
 * точку самовывоза не сохранить, так что выбрать такой сохранённый адрес в
 * форме товара было невозможно, причём молча.
 *
 * @param {import('../model/types.js').AddressSuggestionDto[]} suggestions
 * @returns {import('../model/types.js').AddressSuggestionDto | null}
 */
export function pickFirstHouseSuggestion(suggestions) {
  if (!Array.isArray(suggestions)) {
    return null;
  }
  for (const item of suggestions) {
    // У участка `house_fias_id` приходит пустой строкой, а не отсутствует,
    // поэтому берём первый непустой из двух, а не `??`.
    const fiasId =
      [item?.data?.house_fias_id, item?.data?.stead_fias_id]
        .map((value) => String(value ?? "").trim())
        .find((value) => value.length > 0) ?? "";
    if (fiasId.length > 0) {
      return item;
    }
  }
  return null;
}
