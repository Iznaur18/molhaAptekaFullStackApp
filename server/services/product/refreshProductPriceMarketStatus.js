import { ProductModel } from "../../models/index.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  PRODUCT_PRICE_MARKET_STATUS_CRON_BATCH_SIZE,
  PRODUCT_PRICE_MARKET_STATUS_UNKNOWN,
  resolveProductPriceMarketStatusFromPeers,
} from "../../constants/productPriceMarketStatusConstants.js";
import {
  collectComparableMatchedPeers,
  findComparablePeerPrices,
} from "./findComparableProducts.js";

/**
 * @param {string} productId
 * @param {{ refreshPeers?: boolean }} [options]
 * @returns {Promise<string>}
 */
export async function refreshProductPriceMarketStatus(
  productId,
  { refreshPeers = false } = {},
) {
  const id = String(productId ?? "").trim();
  if (!id) {
    return PRODUCT_PRICE_MARKET_STATUS_UNKNOWN;
  }

  const { productPrice, peerPrices } = await findComparablePeerPrices(id);
  const status =
    productPrice == null
      ? PRODUCT_PRICE_MARKET_STATUS_UNKNOWN
      : resolveProductPriceMarketStatusFromPeers({
          productPrice,
          peerPrices,
        });

  await ProductModel.updateOne(
    { _id: id },
    { $set: { productPriceMarketStatus: status } },
  );

  if (refreshPeers) {
    const collected = await collectComparableMatchedPeers(id);
    const peerIds = (collected?.rankedPeers ?? []).map((row) =>
      String(row.product._id),
    );
    for (const peerId of peerIds) {
      await refreshProductPriceMarketStatus(peerId, { refreshPeers: false });
    }
  }

  return status;
}

/**
 * Суточный батч по approved-товарам.
 * @returns {Promise<{ scanned: number; updated: number }>}
 */
export async function processProductPriceMarketStatusCronTasks() {
  let scanned = 0;
  let updated = 0;
  let lastId = null;

  for (;;) {
    /** @type {Record<string, unknown>} */
    const filter = { productModerationStatus: PRODUCT_MODERATION_APPROVED };
    if (lastId) {
      filter._id = { $gt: lastId };
    }

    const batch = await ProductModel.find(filter)
      .sort({ _id: 1 })
      .limit(PRODUCT_PRICE_MARKET_STATUS_CRON_BATCH_SIZE)
      .select("_id productPriceMarketStatus")
      .lean();

    if (batch.length === 0) {
      break;
    }

    for (const row of batch) {
      scanned += 1;
      lastId = row._id;
      const prev = row.productPriceMarketStatus;
      const next = await refreshProductPriceMarketStatus(String(row._id));
      if (next !== prev) {
        updated += 1;
      }
    }
  }

  return { scanned, updated };
}
