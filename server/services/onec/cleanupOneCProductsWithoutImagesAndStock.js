import { OneCPendingProductModel, ProductModel } from "../../models/index.js";
import { deleteProductsCascade } from "../product/deleteProductsCascade.js";
import { productsWithoutImagesFilter } from "../product/productImagePresence.js";

/** За раз удаляем пачкой, чтобы не держать весь каталог в памяти. */
const BATCH_SIZE = 200;

export const ONEC_CLEANUP_SCOPE_NO_IMAGES_AND_STOCK = "no-images-and-stock";
export const ONEC_CLEANUP_SCOPE_UNAVAILABLE = "unavailable";
export const ONEC_CLEANUP_SCOPE_NO_IMAGES = "no-images";

/**
 * @param {{
 *   sellerId?: string | null;
 *   scope?: string;
 * }} [options]
 */
export function buildOneCCleanupFilter({
  sellerId = null,
  scope = ONEC_CLEANUP_SCOPE_NO_IMAGES_AND_STOCK,
} = {}) {
  const base = {
    productFromOneC: true,
    ...(sellerId ? { productSeller: sellerId } : {}),
  };

  if (scope === ONEC_CLEANUP_SCOPE_UNAVAILABLE) {
    return {
      ...base,
      productIsAvailable: false,
    };
  }

  if (scope === ONEC_CLEANUP_SCOPE_NO_IMAGES) {
    return {
      ...base,
      ...productsWithoutImagesFilter,
    };
  }

  return {
    ...base,
    $and: [
      productsWithoutImagesFilter,
      {
        $or: [
          { productStockQuantity: { $lte: 0 } },
          { productStockQuantity: null },
          { productStockQuantity: { $exists: false } },
        ],
      },
    ],
  };
}

/** @deprecated alias */
export function buildOneCProductsWithoutImagesAndStockFilter(options = {}) {
  return buildOneCCleanupFilter({
    ...options,
    scope: ONEC_CLEANUP_SCOPE_NO_IMAGES_AND_STOCK,
  });
}

/**
 * Удаляет (или считает) товары 1С по scope.
 * В открытых заказах — unlist вместо delete.
 *
 * @param {{
 *   isApply?: boolean;
 *   sellerId?: string | null;
 *   scope?: string;
 * }} [options]
 */
export async function cleanupOneCProductsWithoutImagesAndStock({
  isApply = false,
  sellerId = null,
  scope = ONEC_CLEANUP_SCOPE_NO_IMAGES_AND_STOCK,
} = {}) {
  const resolvedScope =
    scope === ONEC_CLEANUP_SCOPE_UNAVAILABLE
      ? ONEC_CLEANUP_SCOPE_UNAVAILABLE
      : scope === ONEC_CLEANUP_SCOPE_NO_IMAGES
        ? ONEC_CLEANUP_SCOPE_NO_IMAGES
        : ONEC_CLEANUP_SCOPE_NO_IMAGES_AND_STOCK;

  const filter = buildOneCCleanupFilter({ sellerId, scope: resolvedScope });
  const candidates = await ProductModel.countDocuments(filter);

  if (!isApply) {
    return {
      scope: resolvedScope,
      candidates,
      deleted: 0,
      blockedByOrders: 0,
      dryRun: true,
      sellerId: sellerId ? String(sellerId) : null,
    };
  }

  await OneCPendingProductModel.createIndexes();

  let deleted = 0;
  const blocked = new Set();

  for (;;) {
    const batch = await ProductModel.find({
      ...filter,
      ...(blocked.size > 0 ? { _id: { $nin: [...blocked] } } : {}),
    })
      .select("_id productPreviewVideoUrl")
      .limit(BATCH_SIZE)
      .lean();

    if (batch.length === 0) {
      break;
    }

    const { deletedIds, blockedIds } = await deleteProductsCascade(batch);
    deleted += deletedIds.length;
    for (const id of blockedIds) {
      blocked.add(String(id));
    }

    if (blockedIds.length > 0) {
      await ProductModel.updateMany(
        { _id: { $in: blockedIds } },
        {
          $set: {
            productIsAvailable: false,
            productOutOfStock: true,
            productStockQuantity: 0,
            product1cHeld: true,
          },
        },
      );
    }
  }

  return {
    scope: resolvedScope,
    candidates,
    deleted,
    blockedByOrders: blocked.size,
    dryRun: false,
    sellerId: sellerId ? String(sellerId) : null,
  };
}
