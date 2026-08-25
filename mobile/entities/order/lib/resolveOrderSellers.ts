type OrderSeller = {
  _id: string;
  userName?: string;
  email?: string;
  userPhoneNumber?: string;
};

/**
 * `productId` приходит из контракта как `unknown`: сервер отдаёт либо строку-id,
 * либо populate-объект товара. Сужаем здесь, а не в типе, — иначе каждый экран
 * заказов приходится кастовать (из-за этого падал tsc в MyOrders, MySales,
 * AdminOrders и AddressPromptHost).
 */
export type OrderLineLike = {
  status?: string;
  productId?: unknown;
};

type OrderLike = {
  items?: OrderLineLike[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string =>
  typeof value === "string" ? value : "";

/** Уникальные продавцы по позициям заказа (после populate productSeller). */
export function resolveOrderSellers(order: OrderLike | null | undefined): OrderSeller[] {
  const byId = new Map<string, OrderSeller>();

  for (const item of order?.items ?? []) {
    const product = item?.productId;
    if (!isRecord(product)) {
      continue;
    }
    const seller = product.productSeller;
    if (seller == null) {
      continue;
    }
    if (typeof seller === "string") {
      const id = seller.trim();
      if (id && !byId.has(id)) {
        byId.set(id, { _id: id });
      }
      continue;
    }
    if (!isRecord(seller)) {
      continue;
    }
    const id = seller._id != null ? String(seller._id) : "";
    if (!id || byId.has(id)) {
      continue;
    }
    byId.set(id, {
      _id: id,
      userName: readString(seller.userName) || undefined,
      email: readString(seller.email) || undefined,
      userPhoneNumber: readString(seller.userPhoneNumber) || undefined,
    });
  }

  return [...byId.values()];
}
