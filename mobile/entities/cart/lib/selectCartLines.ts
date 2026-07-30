import { resolveProductUnitPrice, resolveProductWholesaleOffer } from "@izibuy/shared-lib";

import type { CartItemsByProductId } from "../model/types";

type CatalogProduct = {
  _id: string;
  productName?: string | null;
  productPrice?: number | null;
  productOldPrice?: number | null;
  productIsAvailable?: boolean | null;
  productPickupAddress?: string | null;
  productPickupEnabled?: boolean | null;
  productDeliveryEnabled?: boolean | null;
  productWholesaleEnabled?: boolean | null;
  productWholesaleMinQty?: number | null;
  productWholesalePrice?: number | null;
};

export type CartLine = {
  productId: string;
  quantity: number;
  product: CatalogProduct | null;
  unitPrice: number;
  lineTotal: number;
  isMissing: boolean;
  isWholesaleApplied: boolean;
  wholesaleSavings: number;
};

export const selectCartLines = (
  cartItems: CartItemsByProductId,
  products: CatalogProduct[],
): { lines: CartLine[]; total: number } => {
  const productById = new Map(products.map((product) => [String(product._id), product]));

  const lines = Object.entries(cartItems).map(([productId, quantity]) => {
    const product = productById.get(productId) ?? null;
    const qty = Math.floor(Number(quantity)) || 0;
    const unitPrice = resolveProductUnitPrice({
      productPrice: product?.productPrice,
      productWholesaleEnabled: product?.productWholesaleEnabled,
      productWholesaleMinQty: product?.productWholesaleMinQty,
      productWholesalePrice: product?.productWholesalePrice,
      quantity: qty,
    });
    const offer = resolveProductWholesaleOffer(product);
    const isWholesaleApplied = offer != null && qty >= offer.minQty;
    const wholesaleSavings = isWholesaleApplied
      ? (offer.retailPrice - offer.wholesalePrice) * qty
      : 0;
    return {
      productId,
      quantity: qty,
      product,
      unitPrice,
      lineTotal: unitPrice * qty,
      isMissing: product == null,
      isWholesaleApplied,
      wholesaleSavings,
    };
  });

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { lines, total };
};
