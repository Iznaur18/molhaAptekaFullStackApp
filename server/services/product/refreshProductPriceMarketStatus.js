import { ProductModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  PRODUCT_PRICE_MARKET_STATUS_CRON_BATCH_SIZE,
  PRODUCT_PRICE_MARKET_STATUS_UNKNOWN,
  resolveProductPriceMarketStatusFromPeers,
} from "../../constants/productPriceMarketStatusConstants.js";
import { getAppQueue } from "../../queues/appQueue.js";
import { JOB_PROCESS_PRODUCT_PRICE_MARKET_STATUS_PEERS } from "../../queues/queueConstants.js";
import {
  collectComparableMatchedPeers,
  collectComparablePeerPricesOnly,
  extractComparablePeerPrices,
} from "./findComparableProducts.js";

/** Cron: только unknown или товары, обновлённые за N дней. */
const PRODUCT_PRICE_MARKET_STATUS_CRON_DIRTY_DAYS = 3;

/**
 * @param {string} productId
 * @param {{ refreshPeers?: boolean; light?: boolean }} [options]
 * @returns {Promise<string>}
 */
export async function refreshProductPriceMarketStatus(
  productId,
  { refreshPeers = false, light = false } = {},
) {
  const id = String(productId ?? "").trim();
  if (!id) {
    return PRODUCT_PRICE_MARKET_STATUS_UNKNOWN;
  }

  let productPrice;
  let peerPrices;
  /** @type {string[]} */
  let peerIds = [];

  if (light && !refreshPeers) {
    ({ productPrice, peerPrices } = await collectComparablePeerPricesOnly(id));
  } else {
    const collected = await collectComparableMatchedPeers(id);
    ({ productPrice, peerPrices } = extractComparablePeerPrices(collected));
    peerIds = (collected?.rankedPeers ?? []).map((row) => String(row.product._id));
  }

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

  if (refreshPeers && peerIds.length > 0) {
    await enqueueProductPriceMarketStatusPeers(peerIds);
  }

  return status;
}

/**
 * Пересчёт peers только через BullMQ. Без Redis — skip (не thrash API).
 * @param {string[]} peerIds
 * @returns {Promise<{ queued: boolean }>}
 */
export async function enqueueProductPriceMarketStatusPeers(peerIds) {
  const ids = [
    ...new Set(
      (Array.isArray(peerIds) ? peerIds : [])
        .map((value) => String(value ?? "").trim())
        .filter(Boolean),
    ),
  ];
  if (ids.length === 0) {
    return { queued: false };
  }

  const queue = getAppQueue();
  if (!queue) {
    return { queued: false };
  }

  await queue.add(
    JOB_PROCESS_PRODUCT_PRICE_MARKET_STATUS_PEERS,
    { productIds: ids },
    { removeOnComplete: 100, removeOnFail: 500 },
  );
  return { queued: true };
}

/**
 * @param {string[]} productIds
 * @returns {Promise<{ updated: number }>}
 */
export async function processProductPriceMarketStatusPeers(productIds) {
  const ids = Array.isArray(productIds) ? productIds : [];
  let updated = 0;

  for (const peerId of ids) {
    try {
      await refreshProductPriceMarketStatus(String(peerId), {
        refreshPeers: false,
        light: true,
      });
      updated += 1;
    } catch (error) {
      logServerEvent("error", {
        event: "refresh_product_price_market_status_peer",
        peerId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { updated };
}

/**
 * Батч: unknown + недавно обновлённые approved (не весь каталог).
 * @returns {Promise<{ scanned: number; updated: number }>}
 */
export async function processProductPriceMarketStatusCronTasks() {
  let scanned = 0;
  let updated = 0;
  let lastId = null;
  const dirtySince = new Date(
    Date.now() - PRODUCT_PRICE_MARKET_STATUS_CRON_DIRTY_DAYS * 24 * 60 * 60 * 1000,
  );

  for (;;) {
    /** @type {Record<string, unknown>} */
    const filter = {
      productModerationStatus: PRODUCT_MODERATION_APPROVED,
      $or: [
        {
          productPriceMarketStatus: {
            $in: [null, PRODUCT_PRICE_MARKET_STATUS_UNKNOWN],
          },
        },
        { updatedAt: { $gte: dirtySince } },
      ],
    };
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
      const next = await refreshProductPriceMarketStatus(String(row._id), {
        light: true,
      });
      if (next !== prev) {
        updated += 1;
      }
    }
  }

  return { scanned, updated };
}
