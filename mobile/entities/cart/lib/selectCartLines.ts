import {
  resolveProductUnitPriceWithPromo,
  resolveProductWholesaleOffer,
} from "@izibuy/shared-lib";

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

export type AppliedPromo = {
  productId: string;
  code?: string;
  discountPercent?: number;
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
  promoDiscountPercent: number | null;
  promoCode: string | null;
  isPromoApplied: boolean;
};

export const selectCartLines = (
  cartItems: CartItemsByProductId,
  products: CatalogProduct[],
  appliedPromos: AppliedPromo[] = [],
): { lines: CartLine[]; total: number } => {
  const productById = new Map(products.map((product) => [String(product._id), product]));
  const promoByProductId = new Map(
    appliedPromos.map((row) => [String(row.productId), row]),
  );

  const lines = Object.entries(cartItems).map(([productId, quantity]) => {
    const product = productById.get(productId) ?? null;
    const qty = Math.floor(Number(quantity)) || 0;
    const promo = promoByProductId.get(productId) ?? null;
    const promoDiscountPercent =
      promo != null ? Math.floor(Number(promo.discountPercent)) || null : null;
    const unitPrice = resolveProductUnitPriceWithPromo({
      productPrice: product?.productPrice,
      productWholesaleEnabled: product?.productWholesaleEnabled,
      productWholesaleMinQty: product?.productWholesaleMinQty,
      productWholesalePrice: product?.productWholesalePrice,
      quantity: qty,
      promoDiscountPercent,
    });
    const offer = resolveProductWholesaleOffer(product);
    const isWholesaleApplied = offer != null && qty >= offer.minQty;
    const wholesaleSavings = isWholesaleApplied
      ? (offer.retailPrice - offer.wholesalePrice) * qty
      : 0;
    const isPromoApplied =
      promoDiscountPercent != null &&
      promoDiscountPercent >= 1 &&
      promoDiscountPercent <= 99;
    return {
      productId,
      quantity: qty,
      product,
      unitPrice,
      lineTotal: unitPrice * qty,
      isMissing: product == null,
      isWholesaleApplied,
      wholesaleSavings,
      promoDiscountPercent: isPromoApplied ? promoDiscountPercent : null,
      promoCode: isPromoApplied ? String(promo?.code ?? "") : null,
      isPromoApplied,
    };
  });

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { lines, total };
};
