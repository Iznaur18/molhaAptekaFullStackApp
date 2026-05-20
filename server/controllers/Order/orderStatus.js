import {
    ORDER_STATUS_CANCELLED,
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_DELIVERED,
    ORDER_STATUS_PENDING,
    ORDER_STATUS_SHIPPED,
} from '../../constants/orderConstants.js';

const EVERY_IN = (items, allowedSet) =>
    items.length > 0 && items.every((item) => allowedSet.has(item.status));

const ITEM_RUNTIME_DEFAULTS = Object.freeze({
    status: ORDER_STATUS_PENDING,
    deliveredAt: null,
    confirmedAt: null,
    deliveredBy: null,
    confirmedBy: null,
});

/** Подкладывает обязательные поля адреса для заказов, созданных до `deliveryAddressFlat`. */
export const normalizeOrderDocumentForRuntime = (order) => {
    if (!order || typeof order !== 'object') return order;

    const flat = order.deliveryAddressFlat;
    if (flat == null || String(flat).trim() === '') {
        order.deliveryAddressFlat = order.deliveryAddress ?? '';
    }
    if (order.deliveryAddressFiasId == null) {
        order.deliveryAddressFiasId = '';
    }

    return order;
};

/** Подкладывает дефолты item-level полей для совместимости со старыми документами. */
export const normalizeOrderItemsForRuntime = (items) => {
    if (!Array.isArray(items)) return [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
        const item = items[itemIndex];
        if (!item || typeof item !== 'object') continue;

        item.status =
            typeof item.status === 'string' && item.status.trim() !== ''
                ? item.status
                : ITEM_RUNTIME_DEFAULTS.status;
        item.deliveredAt = item.deliveredAt ?? ITEM_RUNTIME_DEFAULTS.deliveredAt;
        item.confirmedAt = item.confirmedAt ?? ITEM_RUNTIME_DEFAULTS.confirmedAt;
        item.deliveredBy = item.deliveredBy ?? ITEM_RUNTIME_DEFAULTS.deliveredBy;
        item.confirmedBy = item.confirmedBy ?? ITEM_RUNTIME_DEFAULTS.confirmedBy;
        if (item.itemIndex === undefined) {
            item.itemIndex = itemIndex;
        }
    }

    return items;
};

/**
 * Собирает общий статус заказа на основе item-level статусов.
 * Приоритет от "самого завершённого" к "наименее завершённому".
 */
export const buildOrderStatusFromItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) return ORDER_STATUS_PENDING;

    if (EVERY_IN(items, new Set([ORDER_STATUS_CONFIRMED]))) {
        return ORDER_STATUS_CONFIRMED;
    }
    if (EVERY_IN(items, new Set([ORDER_STATUS_DELIVERED, ORDER_STATUS_CONFIRMED]))) {
        return ORDER_STATUS_DELIVERED;
    }
    if (
        EVERY_IN(
            items,
            new Set([ORDER_STATUS_SHIPPED, ORDER_STATUS_DELIVERED, ORDER_STATUS_CONFIRMED]),
        )
    ) {
        return ORDER_STATUS_SHIPPED;
    }
    if (EVERY_IN(items, new Set([ORDER_STATUS_CANCELLED]))) {
        return ORDER_STATUS_CANCELLED;
    }
    return ORDER_STATUS_PENDING;
};
