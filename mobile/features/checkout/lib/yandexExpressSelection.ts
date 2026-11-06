/**
 * Выбор «Экспресса» Яндекса для заказа. Модуль без alias-импортов —
 * проверяется напрямую в `node --test` (scripts/checkout-express-lobo.test.mjs).
 */

/** Выбор «Экспресса» в заказе: только получатель — адрес идёт обычным путём. */
export type YandexExpressOrderSelection = {
  recipient: { name: string; phone: string };
};

/**
 * Получатель годится для заказа — те же пороги, что у web `YandexExpressPanel`:
 * Яндекс посчитал цену, имя от двух букв, телефон от десяти знаков.
 */
export const buildYandexExpressOrderSelection = ({
  quoteAvailable,
  recipientName,
  recipientPhone,
}: {
  quoteAvailable: boolean;
  recipientName: string;
  recipientPhone: string;
}): YandexExpressOrderSelection | null => {
  const name = recipientName.trim();
  const phone = recipientPhone.trim();
  return quoteAvailable && name.length >= 2 && phone.length >= 10
    ? { recipient: { name, phone } }
    : null;
};

/** Точка адреса для заказа: та, что выбрал покупатель (подсказка или карта). */
export const resolveOrderDeliveryGeo = (address: {
  geo: { lat: number; lon: number } | null;
}): { lat: number; lon: number } | null => {
  const lat = Number(address.geo?.lat);
  const lon = Number(address.geo?.lon);
  return address.geo && Number.isFinite(lat) && Number.isFinite(lon)
    ? { lat, lon }
    : null;
};
