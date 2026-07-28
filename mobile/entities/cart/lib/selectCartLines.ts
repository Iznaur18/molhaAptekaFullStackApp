import type { CartItemsByProductId } from "../model/types";

type CatalogProduct = {
  _id: string;
  productName?: string | null;
  productPrice?: number | null;
  productIsAvailable?: boolean | null;
  productPickupAddress?: string | null;
};

export type CartLine = {
  productId: string;
  quantity: number;
  product: CatalogProduct | null;
  lineTotal: number;
  isMissing: boolean;
};

export const selectCartLines = (
  cartItems: CartItemsByProductId,
  products: CatalogProduct[],
): { lines: CartLine[]; total: number } => {
  const productById = new Map(products.map((product) => [String(product._id), product]));

  const lines = Object.entries(cartItems).map(([productId, quantity]) => {
    const product = productById.get(productId) ?? null;
    const unitPrice = product?.productPrice ?? 0;
    return {
      productId,
      quantity,
      product,
      lineTotal: unitPrice * quantity,
      isMissing: product == null,
    };
  });

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { lines, total };
};
