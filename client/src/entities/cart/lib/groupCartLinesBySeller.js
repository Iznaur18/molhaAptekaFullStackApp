/**
 * Корзина по отправлениям: одно на продавца.
 *
 * Раньше корзина делилась на две секции по возможностям товара, и правило
 * «умеет и то и другое → самовывоз» делало доставку у таких товаров
 * недостижимой: покупателя просто не спрашивали. Способ выбирается на
 * отправление, поэтому и группировать надо по продавцу.
 *
 * @typedef {import("./selectCartLines.js").CartLine} CartLine
 * @typedef {{
 *   sellerId: string;
 *   sellerName: string;
 *   lines: CartLine[];
 *   pickupAvailable: boolean;
 *   deliveryAvailable: boolean;
 *   courierDelivery: boolean;
 *   defaultMethod: "pickup" | "delivery" | null;
 * }} CartSellerGroup
 */

/** @param {CartLine} line */
const resolveSellerId = (line) => {
  const raw =
    line?.product?.productSeller?._id ??
    line?.product?.productSeller ??
    line?.productSellerId;
  return raw ? String(raw) : "";
};

/** @param {CartLine} line */
const resolveSellerName = (line) =>
  String(line?.product?.productSeller?.userName ?? line?.productSellerName ?? "").trim();

/**
 * Отправление едет одним способом целиком, поэтому способ доступен, только
 * если его поддерживают ВСЕ товары продавца в корзине.
 *
 * @param {CartLine[]} visibleLines
 * @returns {CartSellerGroup[]}
 */
export function groupCartLinesBySeller(visibleLines) {
  /** @type {Map<string, CartSellerGroup>} */
  const bySeller = new Map();

  for (const line of Array.isArray(visibleLines) ? visibleLines : []) {
    const sellerId = resolveSellerId(line);
    const product = line?.product ?? {};
    const group = bySeller.get(sellerId) ?? {
      sellerId,
      sellerName: resolveSellerName(line),
      lines: [],
      pickupAvailable: true,
      deliveryAvailable: true,
      // Курьеры Gitorg и доставка продавцом взаимоисключающи на товаре,
      // но у продавца могут быть товары обоих видов — тогда группа не
      // курьерская, и суммы курьеру в ней нет.
      courierDelivery: true,
      defaultMethod: /** @type {"pickup" | "delivery" | null} */ ("pickup"),
    };

    group.lines.push(line);
    if (product.productPickupEnabled === false) {
      group.pickupAvailable = false;
    }
    if (
      product.productDeliveryEnabled !== true &&
      product.productCourierDeliveryEnabled !== true
    ) {
      group.deliveryAvailable = false;
    }
    if (product.productCourierDeliveryEnabled !== true) {
      group.courierDelivery = false;
    }
    if (!group.sellerName) {
      group.sellerName = resolveSellerName(line);
    }

    bySeller.set(sellerId, group);
  }

  for (const group of bySeller.values()) {
    group.defaultMethod = group.pickupAvailable
      ? "pickup"
      : group.deliveryAvailable
        ? "delivery"
        : null;
  }

  return [...bySeller.values()];
}

/**
 * Способ для каждого продавца: что выбрал покупатель, иначе дефолт группы.
 *
 * Недоступный выбор игнорируем — иначе сохранённый в состоянии способ пережил
 * бы удаление товара, который его разрешал, и заказ ушёл бы с 400.
 *
 * @param {CartSellerGroup[]} groups
 * @param {Record<string, "pickup" | "delivery">} chosenBySellerId
 * @returns {Record<string, "pickup" | "delivery">}
 */
export function resolveCartFulfillmentBySeller(groups, chosenBySellerId = {}) {
  /** @type {Record<string, "pickup" | "delivery">} */
  const result = {};

  for (const group of groups) {
    if (!group.sellerId || !group.defaultMethod) continue;

    const chosen = chosenBySellerId[group.sellerId];
    const allowed =
      (chosen === "pickup" && group.pickupAvailable) ||
      (chosen === "delivery" && group.deliveryAvailable);

    result[group.sellerId] = allowed ? chosen : group.defaultMethod;
  }

  return result;
}
