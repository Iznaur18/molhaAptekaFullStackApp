import {
  productShipsToBuyer,
  resolveProductDeliveryCarrier,
} from "@molha/api-contract";

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
 *   groupKey: string;
 *   sellerId: string;
 *   splitCarrier: string | null;
 *   sellerName: string;
 *   sellerAvatarUrl: string;
 *   sellerAvatarFocus: { x?: number; y?: number } | null;
 *   isPremiumUser: boolean;
 *   isUserDataConfirmed: boolean;
 *   sellerPaymentMethods: string[];
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
const resolveSellerProfile = (line) => {
  const seller = line?.product?.productSeller;
  if (!seller || typeof seller !== "object") {
    return {
      sellerName: String(line?.productSellerName ?? "").trim(),
      sellerAvatarUrl: "",
      sellerAvatarFocus: null,
      isPremiumUser: false,
      isUserDataConfirmed: false,
      sellerPaymentMethods: [],
    };
  }

  return {
    sellerName: String(seller.userName ?? line?.productSellerName ?? "").trim(),
    sellerAvatarUrl: String(seller.userAvatarUrl ?? "").trim(),
    sellerAvatarFocus: seller.userAvatarFocus ?? null,
    isPremiumUser: seller.isPremiumUser === true,
    isUserDataConfirmed: seller.isUserDataConfirmed === true,
    sellerPaymentMethods: Array.isArray(seller.sellerPaymentMethods)
      ? seller.sellerPaymentMethods
      : [],
  };
};

/** Ключ группы товаров продавца без службы доставки (только самовывоз). */
const PICKUP_ONLY_BUCKET = "pickup";

/**
 * Службы доставки товаров каждого продавца.
 *
 * @param {CartLine[]} lines
 * @returns {Map<string, Set<string>>}
 */
const collectCarriersBySeller = (lines) => {
  /** @type {Map<string, Set<string>>} */
  const result = new Map();
  for (const line of lines) {
    const carrier = resolveProductDeliveryCarrier(line?.product ?? {});
    if (!carrier) continue;
    const sellerId = resolveSellerId(line);
    const set = result.get(sellerId) ?? new Set();
    set.add(carrier);
    result.set(sellerId, set);
  }
  return result;
};

/**
 * Отправление едет одним способом целиком, поэтому способ доступен, только
 * если его поддерживают ВСЕ товары продавца в корзине.
 *
 * Если товары одного продавца везут разные службы (свой курьер, курьеры
 * Gitorg, ЛОБО), одним заказом их не оформить — сервер не знает, кому
 * отдавать отправление. Тогда корзина сразу делит продавца на группы по
 * службе: каждая оформляется своим заказом. Обычного продавца с одной
 * службой это не касается — у него по-прежнему одна группа.
 *
 * @param {CartLine[]} visibleLines
 * @returns {CartSellerGroup[]}
 */
export function groupCartLinesBySeller(visibleLines) {
  const allLines = Array.isArray(visibleLines) ? visibleLines : [];
  const carriersBySeller = collectCarriersBySeller(allLines);
  /** @type {Map<string, CartSellerGroup>} */
  const bySeller = new Map();

  for (const line of allLines) {
    const sellerId = resolveSellerId(line);
    const product = line?.product ?? {};
    const profile = resolveSellerProfile(line);
    const splitByCarrier = (carriersBySeller.get(sellerId)?.size ?? 0) > 1;
    const lineCarrier = resolveProductDeliveryCarrier(product);
    const groupKey = splitByCarrier
      ? `${sellerId}:${lineCarrier ?? PICKUP_ONLY_BUCKET}`
      : sellerId;
    const group = bySeller.get(groupKey) ?? {
      groupKey,
      sellerId,
      /**
       * Служба, по которой продавец разделён; `null` — не разделён.
       * Для группы без доставки — `"pickup"`.
       */
      splitCarrier: splitByCarrier ? (lineCarrier ?? PICKUP_ONLY_BUCKET) : null,
      sellerName: profile.sellerName,
      sellerAvatarUrl: profile.sellerAvatarUrl,
      sellerAvatarFocus: profile.sellerAvatarFocus,
      isPremiumUser: profile.isPremiumUser,
      isUserDataConfirmed: profile.isUserDataConfirmed,
      sellerPaymentMethods: profile.sellerPaymentMethods,
      lines: [],
      pickupAvailable: true,
      deliveryAvailable: true,
      // Курьеры Gitorg и доставка продавцом взаимоисключающи на товаре,
      // но у продавца могут быть товары обоих видов — тогда группа не
      // курьерская, и суммы курьеру в ней нет.
      courierDelivery: true,
      /** Кто везёт товары группы: один перевозчик на всех или "mixed". */
      deliveryCarrier: /** @type {string | null} */ (undefined),
      defaultMethod: /** @type {"pickup" | "delivery" | null} */ ("pickup"),
    };

    group.lines.push(line);
    if (product.productPickupEnabled === false) {
      group.pickupAvailable = false;
    }
    // Перевозчик — из поля товара: у ЛОБО старые флаги сняты.
    if (!productShipsToBuyer(product)) {
      group.deliveryAvailable = false;
    }
    if (group.deliveryCarrier === undefined) {
      group.deliveryCarrier = lineCarrier;
    } else if (group.deliveryCarrier !== lineCarrier) {
      group.deliveryCarrier = "mixed";
    }
    if (product.productCourierDeliveryEnabled !== true) {
      group.courierDelivery = false;
    }
    if (!group.sellerName && profile.sellerName) {
      group.sellerName = profile.sellerName;
    }
    if (!group.sellerAvatarUrl && profile.sellerAvatarUrl) {
      group.sellerAvatarUrl = profile.sellerAvatarUrl;
      group.sellerAvatarFocus = profile.sellerAvatarFocus;
    }
    if (!group.isPremiumUser && profile.isPremiumUser) {
      group.isPremiumUser = true;
    }
    if (!group.isUserDataConfirmed && profile.isUserDataConfirmed) {
      group.isUserDataConfirmed = true;
    }
    if (
      group.sellerPaymentMethods.length === 0 &&
      profile.sellerPaymentMethods.length > 0
    ) {
      group.sellerPaymentMethods = profile.sellerPaymentMethods;
    }

    bySeller.set(groupKey, group);
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
 * Способ для каждой группы корзины: что выбрал покупатель, иначе дефолт.
 *
 * Ключ — `groupKey`: у продавца, разделённого по службам, у каждой группы
 * свой способ.
 *
 * Недоступный выбор игнорируем — иначе сохранённый в состоянии способ пережил
 * бы удаление товара, который его разрешал, и заказ ушёл бы с 400.
 *
 * @param {CartSellerGroup[]} groups
 * @param {Record<string, "pickup" | "delivery">} chosenByGroupKey
 * @returns {Record<string, "pickup" | "delivery">}
 */
export function resolveCartFulfillmentByGroup(groups, chosenByGroupKey = {}) {
  /** @type {Record<string, "pickup" | "delivery">} */
  const result = {};

  for (const group of groups) {
    if (!group.sellerId || !group.defaultMethod) continue;

    const chosen = chosenByGroupKey[group.groupKey];
    const allowed =
      (chosen === "pickup" && group.pickupAvailable) ||
      (chosen === "delivery" && group.deliveryAvailable);

    result[group.groupKey] = allowed ? chosen : group.defaultMethod;
  }

  return result;
}

/**
 * Способы групп по продавцам — в том виде, в каком их ждёт сервер.
 *
 * Оформляется всегда одна группа, поэтому столкновения ключей у разделённого
 * продавца на оформлении нет; в общем списке берётся последняя группа.
 *
 * @param {CartSellerGroup[]} groups
 * @param {Record<string, "pickup" | "delivery">} fulfillmentByGroupKey
 * @returns {Record<string, "pickup" | "delivery">}
 */
export function mapCartFulfillmentToSellers(groups, fulfillmentByGroupKey) {
  /** @type {Record<string, "pickup" | "delivery">} */
  const result = {};
  for (const group of groups) {
    const method = fulfillmentByGroupKey[group.groupKey];
    if (group.sellerId && method) {
      result[group.sellerId] = method;
    }
  }
  return result;
}
