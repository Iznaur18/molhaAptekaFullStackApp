import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  PRODUCT_COMPARE_CANDIDATE_SCAN_LIMIT,
  PRODUCT_COMPARE_MIN_CHARACTERISTIC_MATCHES,
  PRODUCT_COMPARE_RESULT_LIMIT,
} from "../../constants/productCompareConstants.js";
import { PRODUCT_SELLER_PUBLIC_SELECT } from "../../constants/productSellerPublicFields.js";
import { ProductModel } from "../../models/index.js";
import { getHiddenSellerIds } from "../access/adminUserGuard.js";
import { attachProductSellerSnapshots } from "./attachProductSellerSnapshots.js";
import { attachProductSellerClosedState } from "./attachProductSellerClosedState.js";
import { enrichProductApiFields } from "./productDiscount.js";
import { attachProductAvailablePurchaseQuantity } from "./productStock.js";
import {
  buildCharacteristicPairSet,
  evaluateProductCompareMatch,
  tokenizeProductNameForCompare,
} from "./productCompareMatch.js";

/**
 * @param {string} productId
 * @returns {Promise<{
 *   source: Record<string, unknown>;
 *   rankedPeers: Array<{ product: Record<string, unknown>; characteristicMatches: number }>;
 * } | null>}
 */
export async function collectComparableMatchedPeers(productId) {
  if (!mongoose.isValidObjectId(productId)) {
    return null;
  }

  const source = await ProductModel.findById(productId)
    .select(
      "productName productPrice productCharacteristics productCategoryId productCategory productModerationStatus",
    )
    .lean();

  if (!source || source.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    return null;
  }

  const sourceCharacteristicPairs = buildCharacteristicPairSet(
    source.productCharacteristics,
  );
  if (sourceCharacteristicPairs.size < PRODUCT_COMPARE_MIN_CHARACTERISTIC_MATCHES) {
    return { source, rankedPeers: [] };
  }

  const sourceNameTokens = tokenizeProductNameForCompare(source.productName);
  if (sourceNameTokens.length === 0) {
    return { source, rankedPeers: [] };
  }

  const categoryId =
    source.productCategoryId != null ? String(source.productCategoryId) : "";
  const legacyCategory =
    typeof source.productCategory === "string" ? source.productCategory.trim() : "";

  /** @type {Record<string, unknown>} */
  const categoryFilter = {};
  if (categoryId && mongoose.isValidObjectId(categoryId)) {
    categoryFilter.productCategoryId = new mongoose.Types.ObjectId(categoryId);
  } else if (legacyCategory) {
    categoryFilter.productCategory = legacyCategory;
  } else {
    return { source, rankedPeers: [] };
  }

  const hiddenSellerIds = await getHiddenSellerIds();

  /** @type {Record<string, unknown>} */
  const match = {
    _id: { $ne: source._id },
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
    ...categoryFilter,
  };

  if (hiddenSellerIds.length > 0) {
    match.productSeller = { $nin: hiddenSellerIds };
  }

  const candidates = await ProductModel.find(match)
    .sort({ createdAt: -1 })
    .limit(PRODUCT_COMPARE_CANDIDATE_SCAN_LIMIT)
    .select(
      "productName productPrice productCharacteristics productSeller createdAt productImageUrls productOldPrice productCategory productCategoryId categoryBreadcrumbRu productModerationStatus productIsAvailable productStockQuantity loyaltyPointsPerUnit productAuctionEnabled productInstallmentEnabled productWholesaleEnabled productWishlistCount productReviewCount productReviewRatingAvg",
    )
    .populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT)
    .lean();

  const rankedPeers = [];
  for (const candidate of candidates) {
    const evaluation = evaluateProductCompareMatch({
      sourceNameTokens,
      sourceCharacteristicPairs,
      candidateName: candidate.productName,
      candidateCharacteristics: candidate.productCharacteristics,
    });
    if (!evaluation.ok) continue;
    rankedPeers.push({
      product: candidate,
      characteristicMatches: evaluation.characteristicMatches,
    });
  }

  rankedPeers.sort(
    (a, b) =>
      b.characteristicMatches - a.characteristicMatches ||
      toCreatedAtTime(b.product.createdAt) - toCreatedAtTime(a.product.createdAt),
  );

  return { source, rankedPeers };
}

/**
 * @param {unknown} value
 * @returns {number}
 */
function toCreatedAtTime(value) {
  const time = new Date(/** @type {string | number | Date} */ (value ?? 0)).getTime();
  return Number.isFinite(time) ? time : 0;
}

/**
 * Цены из уже собранных peers (без повторного скана БД).
 * @param {{ source: Record<string, unknown>; rankedPeers: Array<{ product: Record<string, unknown> }> } | null} collected
 * @returns {{ productPrice: number | null; peerPrices: number[] }}
 */
export function extractComparablePeerPrices(collected) {
  if (!collected) {
    return { productPrice: null, peerPrices: [] };
  }

  const productPrice = Math.floor(Number(collected.source.productPrice));
  const peerPrices = collected.rankedPeers
    .map((row) => Math.floor(Number(row.product.productPrice)))
    .filter((value) => Number.isFinite(value) && value > 0);

  return {
    productPrice:
      Number.isFinite(productPrice) && productPrice > 0 ? productPrice : null,
    peerPrices,
  };
}

/**
 * @param {string} productId
 * @param {string | null | undefined} [viewerUserId]
 * @returns {Promise<{ products: Record<string, unknown>[] }>}
 */
export async function findComparableProducts(productId, viewerUserId = null) {
  const collected = await collectComparableMatchedPeers(productId);
  if (!collected) {
    return { products: [] };
  }

  const top = collected.rankedPeers
    .slice(0, PRODUCT_COMPARE_RESULT_LIMIT)
    .map((row) => row.product);
  const withSnapshots = await attachProductSellerSnapshots(top);
  const enriched = withSnapshots.map((row) => enrichProductApiFields(row));
  const withStock = await attachProductAvailablePurchaseQuantity(enriched);
  const withClosedState = await attachProductSellerClosedState(withStock, viewerUserId);

  return { products: withClosedState };
}

/**
 * Лёгкий скан цен peers без populate seller (для market status).
 * @param {string} productId
 */
export async function collectComparablePeerPricesOnly(productId) {
  if (!mongoose.isValidObjectId(productId)) {
    return { productPrice: null, peerPrices: [] };
  }

  const source = await ProductModel.findById(productId)
    .select(
      "productName productPrice productCharacteristics productCategoryId productCategory productModerationStatus",
    )
    .lean();

  if (!source || source.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    return { productPrice: null, peerPrices: [] };
  }

  const sourceCharacteristicPairs = buildCharacteristicPairSet(
    source.productCharacteristics,
  );
  if (sourceCharacteristicPairs.size < PRODUCT_COMPARE_MIN_CHARACTERISTIC_MATCHES) {
    return extractComparablePeerPrices({ source, rankedPeers: [] });
  }

  const sourceNameTokens = tokenizeProductNameForCompare(source.productName);
  if (sourceNameTokens.length === 0) {
    return extractComparablePeerPrices({ source, rankedPeers: [] });
  }

  const categoryId =
    source.productCategoryId != null ? String(source.productCategoryId) : "";
  const legacyCategory =
    typeof source.productCategory === "string" ? source.productCategory.trim() : "";

  /** @type {Record<string, unknown>} */
  const categoryFilter = {};
  if (categoryId && mongoose.isValidObjectId(categoryId)) {
    categoryFilter.productCategoryId = new mongoose.Types.ObjectId(categoryId);
  } else if (legacyCategory) {
    categoryFilter.productCategory = legacyCategory;
  } else {
    return extractComparablePeerPrices({ source, rankedPeers: [] });
  }

  const hiddenSellerIds = await getHiddenSellerIds();

  /** @type {Record<string, unknown>} */
  const match = {
    _id: { $ne: source._id },
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
    ...categoryFilter,
  };

  if (hiddenSellerIds.length > 0) {
    match.productSeller = { $nin: hiddenSellerIds };
  }

  const candidates = await ProductModel.find(match)
    .sort({ createdAt: -1 })
    .limit(PRODUCT_COMPARE_CANDIDATE_SCAN_LIMIT)
    .select("productName productPrice productCharacteristics createdAt")
    .lean();

  const rankedPeers = [];
  for (const candidate of candidates) {
    const evaluation = evaluateProductCompareMatch({
      sourceNameTokens,
      sourceCharacteristicPairs,
      candidateName: candidate.productName,
      candidateCharacteristics: candidate.productCharacteristics,
    });
    if (!evaluation.ok) continue;
    rankedPeers.push({
      product: candidate,
      characteristicMatches: evaluation.characteristicMatches,
    });
  }

  return extractComparablePeerPrices({ source, rankedPeers });
}

/**
 * Цены всех matched peers (UI/legacy).
 * @param {string} productId
 */
export async function findComparablePeerPrices(productId) {
  return collectComparablePeerPricesOnly(productId);
}
