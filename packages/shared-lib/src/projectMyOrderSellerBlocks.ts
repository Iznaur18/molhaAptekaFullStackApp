import {
  buildOrderStatusFromItems,
  calculateOrderItemsTotalAmount,
} from "./orderStatus.js";

/** Seller id для позиций без productSeller (legacy / удалённый товар). */
export const MY_ORDER_UNKNOWN_SELLER_ID = "__unknown__";

export type MyOrderSellerBlockOrderLine = {
  productId?: unknown;
  status?: string;
  quantity?: number;
  unitPriceAtOrder?: number;
  itemIndex?: number;
  [key: string]: unknown;
};

export type MyOrderSellerBlockSource = {
  _id?: unknown;
  items?: MyOrderSellerBlockOrderLine[] | null;
  status?: string;
  totalAmount?: number;
  [key: string]: unknown;
};

export type MyOrderSellerBlock<T extends MyOrderSellerBlockSource = MyOrderSellerBlockSource> = {
  blockKey: string;
  sellerId: string;
  order: T;
};

/**
 * Id продавца позиции (после populate productSeller или raw id).
 */
export function resolveOrderLineSellerId(
  item: { productId?: unknown } | null | undefined,
): string {
  const product = item?.productId;
  if (product == null || typeof product === "string") {
    return MY_ORDER_UNKNOWN_SELLER_ID;
  }
  const seller = (product as { productSeller?: unknown }).productSeller;
  if (seller == null) {
    return MY_ORDER_UNKNOWN_SELLER_ID;
  }
  if (typeof seller === "string") {
    const id = seller.trim();
    return id || MY_ORDER_UNKNOWN_SELLER_ID;
  }
  const id =
    (seller as { _id?: unknown })._id != null
      ? String((seller as { _id?: unknown })._id)
      : "";
  return id || MY_ORDER_UNKNOWN_SELLER_ID;
}

/**
 * Один checkout → N блоков по продавцу (UI «Мои покупки»).
 * Статус и сумма — только по позициям блока.
 */
export function projectMyOrderSellerBlocks<T extends MyOrderSellerBlockSource>(
  order: T,
): Array<MyOrderSellerBlock<T>> {
  const orderId = order?._id != null ? String(order._id) : "";
  const items = Array.isArray(order?.items) ? order.items : [];

  if (items.length === 0) {
    return [
      {
        blockKey: `${orderId}:${MY_ORDER_UNKNOWN_SELLER_ID}`,
        sellerId: MY_ORDER_UNKNOWN_SELLER_ID,
        order: {
          ...order,
          items: [],
          status: buildOrderStatusFromItems([]),
          totalAmount: 0,
        },
      },
    ];
  }

  /** @type {Map<string, MyOrderSellerBlockOrderLine[]>} */
  const itemsBySeller = new Map();

  for (const item of items) {
    const sellerId = resolveOrderLineSellerId(item);
    const bucket = itemsBySeller.get(sellerId);
    if (bucket) {
      bucket.push(item);
    } else {
      itemsBySeller.set(sellerId, [item]);
    }
  }

  const blocks: Array<MyOrderSellerBlock<T>> = [];
  for (const [sellerId, sellerItems] of itemsBySeller) {
    blocks.push({
      blockKey: `${orderId}:${sellerId}`,
      sellerId,
      order: {
        ...order,
        items: sellerItems,
        status: buildOrderStatusFromItems(sellerItems),
        totalAmount: calculateOrderItemsTotalAmount(sellerItems),
      },
    });
  }

  return blocks;
}

/**
 * Плоский список seller-блоков для buyer list / фильтров / overview.
 */
export function projectMyOrdersSellerBlocks<T extends MyOrderSellerBlockSource>(
  orders: T[] | null | undefined,
): Array<MyOrderSellerBlock<T>> {
  if (!Array.isArray(orders) || orders.length === 0) {
    return [];
  }
  const blocks: Array<MyOrderSellerBlock<T>> = [];
  for (const order of orders) {
    blocks.push(...projectMyOrderSellerBlocks(order));
  }
  return blocks;
}
