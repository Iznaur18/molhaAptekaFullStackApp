/**
 * @param {Record<string, unknown> | null | undefined} product
 * @param {number} [nowMs]
 */
export const isProductFlashSaleDueForExpiry = (product, nowMs = Date.now()) => {
  if (product?.productFlashSaleEnabled !== true) {
    return false;
  }
  const endsAt = product.productFlashSaleEndsAt;
  if (endsAt == null) {
    return false;
  }
  const endsMs = new Date(endsAt).getTime();
  return Number.isFinite(endsMs) && endsMs <= nowMs;
};

/**
 * @param {Record<string, unknown> | null | undefined} product
 * @returns {number | null}
 */
export const resolveFlashSaleRestoreBasePrice = (product) => {
  const fromBase = Math.floor(Number(product?.productFlashSaleBasePrice));
  if (Number.isFinite(fromBase) && fromBase > 0) {
    return fromBase;
  }
  const fromOld = Math.floor(Number(product?.productOldPrice));
  const current = Math.floor(Number(product?.productPrice));
  if (Number.isFinite(fromOld) && Number.isFinite(current) && fromOld > current) {
    return fromOld;
  }
  return null;
};

/**
 * Синхронная нормализация для API, если cron ещё не успел отработать.
 *
 * @param {Record<string, unknown>} product
 */
export const normalizeExpiredFlashSaleProductFields = (product) => {
  if (!isProductFlashSaleDueForExpiry(product)) {
    return product;
  }

  const restorePrice = resolveFlashSaleRestoreBasePrice(product);
  return {
    ...product,
    productFlashSaleEnabled: false,
    productFlashSaleEndsAt: null,
    productFlashSaleBasePrice: null,
    productFlashSaleDurationMinutes: null,
    productOldPrice: null,
    ...(restorePrice != null ? { productPrice: restorePrice } : {}),
  };
};

/**
 * @param {string} productId
 */
export async function disableExpiredProductFlashSale(productId) {
  const { ProductModel } = await import("../../models/index.js");
  const existing = await ProductModel.findById(productId).lean();
  if (!existing || existing.productFlashSaleEnabled !== true) {
    return null;
  }
  if (!isProductFlashSaleDueForExpiry(existing)) {
    return null;
  }

  const restorePrice = resolveFlashSaleRestoreBasePrice(existing);
  /** @type {Record<string, unknown>} */
  const $set = {
    productFlashSaleEnabled: false,
    productOldPrice: null,
  };
  if (restorePrice != null) {
    $set.productPrice = restorePrice;
  }

  return ProductModel.findOneAndUpdate(
    { _id: productId, productFlashSaleEnabled: true },
    {
      $set,
      $unset: {
        productFlashSaleEndsAt: "",
        productFlashSaleBasePrice: "",
        productFlashSaleDurationMinutes: "",
      },
    },
    { new: true },
  );
}

/** Активная горящая скидка для фильтра каталога. */
export function buildProductFlashSaleActiveCatalogMatch(now = new Date()) {
  return {
    productFlashSaleEnabled: true,
    productFlashSaleEndsAt: { $gt: now },
  };
}

/** Истекает все горящие скидки с productFlashSaleEndsAt <= now. */
export async function expireProductFlashSales() {
  const { ProductModel } = await import("../../models/index.js");
  const now = new Date();
  const rows = await ProductModel.find({
    productFlashSaleEnabled: true,
    productFlashSaleEndsAt: { $lte: now },
  })
    .select("_id")
    .lean();

  let expiredCount = 0;
  for (const row of rows) {
    const result = await disableExpiredProductFlashSale(String(row._id));
    if (result) {
      expiredCount += 1;
    }
  }
  return { expiredCount };
}
