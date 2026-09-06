import { normalizeGeoCoord } from "@molha/api-contract";

/**
 * Координаты адреса доставки: что храним и что считаем деньгами.
 *
 * Различие принципиальное, поэтому вынесено отдельной функцией.
 *
 * Координаты приходят из двух источников. Проверенные — те, что сервер сам
 * получил из DaData по адресу покупателя. Клиентские — те, что прислал браузер
 * в теле запроса; их выбирал человек на карте, и подменить их не сложнее, чем
 * открыть devtools.
 *
 * **Для тарифа берём только проверенные.** Собственная доставка продавца
 * считается как вызов плюс километраж, и километраж меряется до этой точки.
 * Пока в счёт шли клиентские координаты, покупателю достаточно было прислать
 * точку рядом со складом продавца, чтобы километраж обнулился — а в
 * предоплаченном заказе это ещё и напрямую уменьшало сумму к списанию.
 * Считать расстояние по числу, которое назвал плательщик, нельзя.
 *
 * **Для доставки клиентские идут первыми, и намеренно.** Их читают службы
 * доставки и карта в заказе. Точка с карты — это подъезд, а проверенная у
 * половины адресов приходит уровнем улицы: у домов без ФИАС (обычное дело за
 * пределами столиц) подсказка отдаёт координаты улицы, а не дома. Подменённая
 * точка тут вредит только тому, кто её прислал, — его посылку увезут не туда,
 * — а деньги от неё уже не зависят. Разница в сотню метров, наоборот, для
 * километража безразлична, поэтому тариф спокойно живёт на проверенных.
 *
 * @param {{
 *   verifiedGeo?: { lat: unknown; lon: unknown } | null;
 *   clientGeo?: { lat: unknown; lon: unknown } | null;
 * }} input
 * @returns {{
 *   storedGeo: { lat: number; lon: number } | null;
 *   tariffGeo: { lat: number; lon: number } | null;
 * }}
 */
export function resolveOrderDeliveryGeo({ verifiedGeo = null, clientGeo = null } = {}) {
  const verified = normalizeGeoPoint(verifiedGeo);
  const client = normalizeGeoPoint(clientGeo);

  return {
    storedGeo: client ?? verified,
    tariffGeo: verified,
  };
}

/**
 * `null`, если точка неполная: половина координат — это не координаты.
 *
 * @param {{ lat: unknown; lon: unknown } | null | undefined} point
 * @returns {{ lat: number; lon: number } | null}
 */
function normalizeGeoPoint(point) {
  if (!point) {
    return null;
  }
  // Через `normalizeGeoCoord`, а не `Number()`: пустая строка и null дают ноль,
  // а ноль — валидная координата (экватор, нулевой меридиан).
  const lat = normalizeGeoCoord(point.lat);
  const lon = normalizeGeoCoord(point.lon);
  if (lat == null || lon == null) {
    return null;
  }
  return { lat, lon };
}
