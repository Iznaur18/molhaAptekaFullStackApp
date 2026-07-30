type OrderSeller = {
  _id: string;
  userName?: string;
  email?: string;
  userPhoneNumber?: string;
};

type OrderLike = {
  items?: Array<{
    productId?:
      | string
      | {
          productSeller?:
            | string
            | {
                _id?: string;
                userName?: string;
                email?: string;
                userPhoneNumber?: string;
              }
            | null;
        }
      | null;
  }>;
};

/** Уникальные продавцы по позициям заказа (после populate productSeller). */
export function resolveOrderSellers(order: OrderLike | null | undefined): OrderSeller[] {
  const byId = new Map<string, OrderSeller>();

  for (const item of order?.items ?? []) {
    const product = item?.productId;
    if (product == null || typeof product === "string") {
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
    const id = seller._id != null ? String(seller._id) : "";
    if (!id || byId.has(id)) {
      continue;
    }
    byId.set(id, {
      _id: id,
      userName: seller.userName,
      email: seller.email,
      userPhoneNumber: seller.userPhoneNumber,
    });
  }

  return [...byId.values()];
}
