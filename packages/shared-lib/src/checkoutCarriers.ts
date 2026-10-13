/**
 * Служба внутри «Доставки», которой поедет заказ.
 *
 * Способ получения всегда один из двух — самовывоз или доставка. СДЭК и
 * Яндекс — это службы внутри доставки. `null` — своя доставка продавца.
 *
 * Выбор покупателя уважаем, пока служба доступна. Если своей доставки у
 * продавца нет, первая доступная служба — единственный вариант, и ждать
 * нажатия незачем.
 */
export function resolveCheckoutChosenCarrier({
  needsDelivery,
  needsPickup = false,
  carrierOptions,
  carrierChoice,
  sellerDeliveryAvailable,
}: {
  needsDelivery: boolean;
  needsPickup?: boolean;
  carrierOptions: readonly string[];
  carrierChoice: string | null | undefined;
  sellerDeliveryAvailable: boolean;
}): string | null {
  if (!needsDelivery || needsPickup || carrierOptions.length === 0) {
    return null;
  }
  if (carrierChoice && carrierOptions.includes(carrierChoice)) {
    return carrierChoice;
  }
  return sellerDeliveryAvailable ? null : carrierOptions[0];
}

export type CdekOrderSelection = {
  tariffCode: number;
  pickupPointCode: string;
  toCityCode: number;
  recipient: { name: string; phone: string };
};

/** Минимум для имени и телефона получателя — точную проверку делает контракт. */
const CDEK_RECIPIENT_NAME_MIN_LENGTH = 2;
const CDEK_RECIPIENT_PHONE_MIN_LENGTH = 10;

/**
 * Выбор СДЭК, который уйдёт в заказ, или `null`, пока он неполный.
 *
 * Цены здесь нет намеренно: её считает сервер по ключу продавца. Телефон
 * обязателен — без него СДЭК отправление не примет.
 */
export function buildCdekOrderSelection({
  pointCode,
  tariffCode,
  cityCode,
  recipientName,
  recipientPhone,
}: {
  pointCode: string | null | undefined;
  tariffCode: number | null | undefined;
  cityCode: number | null | undefined;
  recipientName: string | null | undefined;
  recipientPhone: string | null | undefined;
}): CdekOrderSelection | null {
  const name = String(recipientName ?? "").trim();
  const phone = String(recipientPhone ?? "").trim();
  if (
    !pointCode ||
    !tariffCode ||
    !cityCode ||
    name.length < CDEK_RECIPIENT_NAME_MIN_LENGTH ||
    phone.length < CDEK_RECIPIENT_PHONE_MIN_LENGTH
  ) {
    return null;
  }
  return {
    tariffCode,
    pickupPointCode: pointCode,
    toCityCode: cityCode,
    recipient: { name, phone },
  };
}

/**
 * Срок доставки для подписи тарифа: «3 дн.» или «3–5 дн.». Пусто, если
 * служба срок не назвала.
 */
export function formatCarrierPeriodDays(
  minDays: number | null | undefined,
  maxDays: number | null | undefined,
): string {
  const min = minDays ?? maxDays;
  const max = maxDays ?? minDays;
  if (min == null || max == null) return "";
  return min === max ? `${min} дн.` : `${min}–${max} дн.`;
}
