import { resolveProductUnitPrice } from "@izibuy/shared-lib";

import type { CartLine } from "./selectCartLines";

/** Каталожная «цена до скидки»: старая × qty, иначе текущая × qty. */
export function sumCartLinesCatalogListTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => {
    const oldPrice = Math.floor(Number(line.product?.productOldPrice));
    const price = Math.floor(Number(line.product?.productPrice));
    const quantity = Math.floor(Number(line.quantity)) || 0;
    if (quantity <= 0) {
      return sum;
    }
    if (
      Number.isFinite(oldPrice) &&
      Number.isFinite(price) &&
      oldPrice > price
    ) {
      return sum + oldPrice * quantity;
    }
    if (Number.isFinite(price) && price >= 0) {
      return sum + price * quantity;
    }
    return sum + (Number(line.lineTotal) || 0);
  }, 0);
}

/** Экономия по каталожной скидке: (старая − новая) × qty. */
export function sumCartLinesCatalogDiscount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => {
    const oldPrice = Math.floor(Number(line.product?.productOldPrice));
    const price = Math.floor(Number(line.product?.productPrice));
    const quantity = Math.floor(Number(line.quantity)) || 0;
    if (
      !Number.isFinite(oldPrice) ||
      !Number.isFinite(price) ||
      oldPrice <= price ||
      quantity <= 0
    ) {
      return sum;
    }
    return sum + (oldPrice - price) * quantity;
  }, 0);
}

/** Экономия по опту: Σ wholesaleSavings по линиям. */
export function sumCartLinesWholesaleDiscount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => {
    const savings = Math.floor(Number(line.wholesaleSavings)) || 0;
    return savings > 0 ? sum + savings : sum;
  }, 0);
}

/** Экономия именно от промокода: цена без промо − цена с промо, × qty. */
export function sumCartLinesPromoDiscount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => {
    if (!line.isPromoApplied || line.product == null) {
      return sum;
    }
    const quantity = Math.floor(Number(line.quantity)) || 0;
    if (quantity <= 0) {
      return sum;
    }
    const withoutPromo = resolveProductUnitPrice({
      productPrice: line.product.productPrice,
      productWholesaleEnabled: line.product.productWholesaleEnabled,
      productWholesaleMinQty: line.product.productWholesaleMinQty,
      productWholesalePrice: line.product.productWholesalePrice,
      quantity,
    });
    const withPromo = Math.floor(Number(line.unitPrice)) || 0;
    if (withPromo <= 0 || withPromo >= withoutPromo) {
      return sum;
    }
    return sum + (withoutPromo - withPromo) * quantity;
  }, 0);
}
