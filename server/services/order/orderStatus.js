import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_DISPUTED,
  ORDER_STATUS_LADDER_RANK,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_RETURNED,
} from "../../constants/orderConstants.js";

const EVERY_IN = (items, allowedSet) =>
  items.length > 0 && items.every((item) => allowedSet.has(item.status));

const ITEM_RUNTIME_DEFAULTS = Object.freeze({
  status: ORDER_STATUS_PENDING,
  sellerIdAtOrder: null,
  deliveredAt: null,
  confirmedAt: null,
  deliveredBy: null,
  confirmedBy: null,
  loyaltyPointsAwarded: false,
  loyaltyPointsEarned: 0,
  loyaltyPointsPerUnitAtOrder: 0,
  loyaltyPointsReservedTotal: 0,
  loyaltyPointsReserveReleased: false,
  affiliateReferrerUserId: null,
  affiliateStatus: "none",
  affiliateAmount: 0,
  affiliatePercentUsed: null,
  affiliatePaidAt: null,
  buyNFreeUnitsAtOrder: 0,
  buyNFreeProgressApplied: false,
  buyNFreeProgressAction: null,
  buyNFreeProgressCountBefore: 0,
});

/** Подкладывает обязательные поля адреса для заказов, созданных до `deliveryAddressFlat`. */
export const normalizeOrderDocumentForRuntime = (order) => {
  if (!order || typeof order !== "object") return order;

  const flat = order.deliveryAddressFlat;
  if (flat == null || String(flat).trim() === "") {
    order.deliveryAddressFlat = order.deliveryAddress ?? "";
  }
  if (order.deliveryAddressFiasId == null) {
    order.deliveryAddressFiasId = "";
  }

  return order;
};

/** Подкладывает дефолты item-level полей для совместимости со старыми документами. */
export const normalizeOrderItemsForRuntime = (items) => {
  if (!Array.isArray(items)) return [];

  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    const item = items[itemIndex];
    if (!item || typeof item !== "object") continue;

    item.status =
      typeof item.status === "string" && item.status.trim() !== ""
        ? item.status
        : ITEM_RUNTIME_DEFAULTS.status;
    item.sellerIdAtOrder =
      item.sellerIdAtOrder ?? ITEM_RUNTIME_DEFAULTS.sellerIdAtOrder;
    item.deliveredAt = item.deliveredAt ?? ITEM_RUNTIME_DEFAULTS.deliveredAt;
    item.confirmedAt = item.confirmedAt ?? ITEM_RUNTIME_DEFAULTS.confirmedAt;
    item.deliveredBy = item.deliveredBy ?? ITEM_RUNTIME_DEFAULTS.deliveredBy;
    item.confirmedBy = item.confirmedBy ?? ITEM_RUNTIME_DEFAULTS.confirmedBy;
    item.loyaltyPointsAwarded =
      item.loyaltyPointsAwarded ?? ITEM_RUNTIME_DEFAULTS.loyaltyPointsAwarded;
    item.loyaltyPointsEarned =
      item.loyaltyPointsEarned ?? ITEM_RUNTIME_DEFAULTS.loyaltyPointsEarned;
    item.loyaltyPointsPerUnitAtOrder =
      item.loyaltyPointsPerUnitAtOrder ??
      ITEM_RUNTIME_DEFAULTS.loyaltyPointsPerUnitAtOrder;
    item.loyaltyPointsReservedTotal =
      item.loyaltyPointsReservedTotal ??
      ITEM_RUNTIME_DEFAULTS.loyaltyPointsReservedTotal;
    item.loyaltyPointsReserveReleased =
      item.loyaltyPointsReserveReleased ??
      ITEM_RUNTIME_DEFAULTS.loyaltyPointsReserveReleased;
    item.affiliateReferrerUserId =
      item.affiliateReferrerUserId ?? ITEM_RUNTIME_DEFAULTS.affiliateReferrerUserId;
    item.affiliateStatus =
      typeof item.affiliateStatus === "string" && item.affiliateStatus.trim() !== ""
        ? item.affiliateStatus
        : ITEM_RUNTIME_DEFAULTS.affiliateStatus;
    item.affiliateAmount =
      item.affiliateAmount ?? ITEM_RUNTIME_DEFAULTS.affiliateAmount;
    item.affiliatePercentUsed =
      item.affiliatePercentUsed ?? ITEM_RUNTIME_DEFAULTS.affiliatePercentUsed;
    item.affiliatePaidAt =
      item.affiliatePaidAt ?? ITEM_RUNTIME_DEFAULTS.affiliatePaidAt;
    if (item.itemIndex === undefined) {
      item.itemIndex = itemIndex;
    }
    if (
      typeof item.productNameAtOrder !== "string" ||
      item.productNameAtOrder.trim() === ""
    ) {
      item.productNameAtOrder = "";
    } else {
      item.productNameAtOrder = item.productNameAtOrder.trim();
    }
  }

  return items;
};

/**
 * Собирает общий статус заказа на основе item-level статусов.
 *
 * Статус заказа — это статус самой отстающей активной позиции: пока продавец
 * не довёл до конца всё, заказ целиком не считается доведённым. Сравниваем по
 * рангу, а не перебором наборов, иначе каждая новая ступень лестницы требует
 * ещё одной ветки.
 *
 * Возвращаем всегда чей-то реальный статус, а не синтезированный: у ступени
 * «готов» две параллельные ветки (`ready_for_pickup` / `ready_to_ship`), и
 * придумывать для их смеси третье значение было бы враньём.
 */
export const buildOrderStatusFromItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return ORDER_STATUS_PENDING;

  // Спор поднимается наверх: товар вне контроля, и это важнее того, на
  // какой ступени стоят остальные позиции.
  if (items.some((item) => item?.status === ORDER_STATUS_DISPUTED)) {
    return ORDER_STATUS_DISPUTED;
  }

  if (EVERY_IN(items, new Set([ORDER_STATUS_RETURNED]))) {
    return ORDER_STATUS_RETURNED;
  }
  if (EVERY_IN(items, new Set([ORDER_STATUS_CANCELLED]))) {
    return ORDER_STATUS_CANCELLED;
  }
  // Часть отменили до отправки, часть вернулась: сделка не состоялась целиком,
  // и для покупателя это «отменён» — так же, как если бы всё отменили сразу.
  if (EVERY_IN(items, new Set([ORDER_STATUS_CANCELLED, ORDER_STATUS_RETURNED]))) {
    return ORDER_STATUS_CANCELLED;
  }

  // Терминальная позиция рядом с активной означает, что заказ ещё в работе и
  // закрывать его рано.
  let leader = null;
  let leaderRank = Number.POSITIVE_INFINITY;
  for (const item of items) {
    const rank = ORDER_STATUS_LADDER_RANK[item?.status];
    if (rank === undefined) return ORDER_STATUS_PENDING;
    if (rank < leaderRank) {
      leaderRank = rank;
      leader = item.status;
    }
  }

  return leader ?? ORDER_STATUS_PENDING;
};

/**
 * Актуализирует `order.status` по позициям (ответ API / legacy-документы).
 *
 * @param {Record<string, unknown> | null | undefined} order
 */
export const syncOrderStatusFromItems = (order) => {
  if (!order || typeof order !== "object") {
    return order;
  }
  normalizeOrderDocumentForRuntime(order);
  const items = normalizeOrderItemsForRuntime(order.items);
  order.status = buildOrderStatusFromItems(items);
  return order;
};
