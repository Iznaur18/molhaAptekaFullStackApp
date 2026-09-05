/**
 * Комиссия площадки: сколько от заказа остаётся Gitorg.
 *
 * Живёт в контракте, потому что сумму видят обе стороны: продавец — в своём
 * кабинете, покупатель — никогда (для него цена одна). Считать её на сервере
 * и «примерно так же» на клиенте нельзя: это деньги.
 */

/** Ставка по умолчанию. Индивидуальная ставка продавца перекрывает её. */
export const PLATFORM_COMMISSION_PERCENT_DEFAULT = 2;

/** Выше этого ставку не принимаем: почти наверняка опечатка в админке. */
export const PLATFORM_COMMISSION_PERCENT_MAX = 50;

/**
 * Комиссия берётся со стоимости товаров и НЕ берётся с доставки продавца.
 *
 * Доставка по его тарифу — это компенсация бензина и времени, а не выручка;
 * удерживать с неё процент значит заставить продавца доплачивать за то, что
 * он сам съездил. Если решите брать и с доставки — здесь один флаг, но это
 * меняет обещание, которое продавец видел, когда ставил тариф.
 */
export const PLATFORM_COMMISSION_ON_DELIVERY = false;

/**
 * @param {unknown} raw
 * @returns {number}
 */
export function normalizePlatformCommissionPercent(raw) {
  // `Number(null)` и `Number("")` дают 0, а ноль здесь — валидная ставка
  // «работаем бесплатно». Без явной проверки на пустое значение отсутствие
  // ставки молча означало бы нулевую комиссию, и площадка не заработала бы
  // ничего, ничего об этом не узнав.
  if (raw === null || raw === undefined || raw === "") {
    return PLATFORM_COMMISSION_PERCENT_DEFAULT;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return PLATFORM_COMMISSION_PERCENT_DEFAULT;
  }
  return Math.min(value, PLATFORM_COMMISSION_PERCENT_MAX);
}

/**
 * Делит сумму отправления на долю площадки и долю продавца.
 *
 * Два правила, за которыми стоят деньги:
 *
 * 1. Комиссия округляется ВНИЗ. Копейка спора достаётся продавцу — площадка
 *    может недобрать рубль, продавец недополучить не может.
 * 2. `commissionRub + sellerRub` всегда равно исходной сумме. Доля продавца
 *    считается вычитанием, а не вторым независимым округлением: иначе на
 *    больших объёмах копейки расходятся и сходить баланс перестаёт.
 *
 * @param {{
 *   goodsRub: number;
 *   deliveryRub?: number;
 *   commissionPercent?: number;
 * }} input
 * @returns {{
 *   totalRub: number;
 *   goodsRub: number;
 *   deliveryRub: number;
 *   commissionPercent: number;
 *   commissionBaseRub: number;
 *   commissionRub: number;
 *   sellerRub: number;
 * }}
 */
export function splitOrderAmountForPlatform({
  goodsRub,
  deliveryRub = 0,
  commissionPercent = PLATFORM_COMMISSION_PERCENT_DEFAULT,
}) {
  const goods = Math.max(0, Math.round(Number(goodsRub) || 0));
  const delivery = Math.max(0, Math.round(Number(deliveryRub) || 0));
  const percent = normalizePlatformCommissionPercent(commissionPercent);

  const commissionBaseRub = PLATFORM_COMMISSION_ON_DELIVERY ? goods + delivery : goods;
  const commissionRub = Math.floor((commissionBaseRub * percent) / 100);
  const totalRub = goods + delivery;

  return {
    totalRub,
    goodsRub: goods,
    deliveryRub: delivery,
    commissionPercent: percent,
    commissionBaseRub,
    commissionRub,
    sellerRub: totalRub - commissionRub,
  };
}
