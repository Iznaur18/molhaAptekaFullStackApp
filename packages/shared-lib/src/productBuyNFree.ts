import {
  PRODUCT_BUY_N_FREE_THRESHOLD_MAX,
  PRODUCT_BUY_N_FREE_THRESHOLD_MIN,
} from "@molha/api-contract";

export { PRODUCT_BUY_N_FREE_THRESHOLD_MAX, PRODUCT_BUY_N_FREE_THRESHOLD_MIN };

export type ProductBuyNFreeLike = {
  productBuyNFreeEnabled?: boolean | null;
  productBuyNFreeThreshold?: number | null;
};

const toNonNegInt = (value: unknown): number => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const isProductBuyNFreeConfigured = (
  product: ProductBuyNFreeLike | null | undefined,
): boolean => {
  if (product == null) {
    return false;
  }
  const threshold = toNonNegInt(product.productBuyNFreeThreshold);
  return (
    threshold >= PRODUCT_BUY_N_FREE_THRESHOLD_MIN &&
    threshold <= PRODUCT_BUY_N_FREE_THRESHOLD_MAX
  );
};

export const isProductBuyNFreeActive = (
  product: ProductBuyNFreeLike | null | undefined,
): boolean =>
  product?.productBuyNFreeEnabled === true && isProductBuyNFreeConfigured(product);

export const resolveBuyNFreePaidQuantity = (
  quantity: unknown,
  freeUnits: unknown,
): number => {
  const qty = toNonNegInt(quantity);
  const free = Math.min(toNonNegInt(freeUnits), qty);
  return Math.max(0, qty - free);
};

export const resolveBuyNFreeLineTotal = (input: {
  unitPrice?: number | null;
  quantity?: number | null;
  freeUnits?: number | null;
}): number => {
  const unit = toNonNegInt(input.unitPrice);
  const paidQty = resolveBuyNFreePaidQuantity(input.quantity, input.freeUnits);
  return unit * paidQty;
};

export const resolveBuyNFreeFreeUnitsForCart = (input: {
  product?: ProductBuyNFreeLike | null;
  completedPaidOrderCount?: number | null;
  freeClaimPending?: boolean | null;
  quantity?: number | null;
}): number => {
  if (!isProductBuyNFreeActive(input.product)) {
    return 0;
  }
  if (input.freeClaimPending === true) {
    return 0;
  }
  const threshold = toNonNegInt(input.product?.productBuyNFreeThreshold);
  const completed = toNonNegInt(input.completedPaidOrderCount);
  const qty = toNonNegInt(input.quantity);
  if (completed < threshold || qty < 1) {
    return 0;
  }
  return 1;
};

export const isBuyNFreeEligible = (input: {
  product?: ProductBuyNFreeLike | null;
  completedPaidOrderCount?: number | null;
  freeClaimPending?: boolean | null;
}): boolean => {
  if (!isProductBuyNFreeActive(input.product)) {
    return false;
  }
  if (input.freeClaimPending === true) {
    return false;
  }
  const threshold = toNonNegInt(input.product?.productBuyNFreeThreshold);
  return toNonNegInt(input.completedPaidOrderCount) >= threshold;
};
