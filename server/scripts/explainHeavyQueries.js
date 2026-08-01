import "dotenv/config";

import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import { PRODUCT_MODERATION_PENDING } from "../constants/productModerationConstants.js";
import { OrderModel, ProductModel } from "../models/index.js";
import {
  collectExplainStages,
  explainUsesCollectionScan,
  explainUsesIndexScan,
  getWinningExecutionStages,
} from "../utils/mongoExplain.js";

/**
 * @param {string} label
 * @param {Promise<unknown>} explainPromise
 */
async function printExplain(label, explainPromise) {
  const explain = await explainPromise;
  const stages = collectExplainStages(getWinningExecutionStages(explain));
  const ixscan = explainUsesIndexScan(explain);
  const collscan = explainUsesCollectionScan(explain);

  console.log(`\n## ${label}`);
  console.log(
    `IXSCAN: ${ixscan ? "yes" : "no"} | COLLSCAN: ${collscan ? "yes" : "no"}`,
  );
  for (const stage of stages) {
    const index = stage.indexName ? ` (${stage.indexName})` : "";
    console.log(`  - ${stage.stage}${index}`);
  }
}

const main = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI не задан");
    process.exit(1);
  }

  await mongoose.connect(uri);
  await ProductModel.createIndexes();
  await OrderModel.createIndexes();

  const sampleSeller = await ProductModel.findOne({ productSeller: { $exists: true } })
    .select("productSeller productCategoryId")
    .lean();
  const sampleProductId = await OrderModel.findOne({ "items.0": { $exists: true } })
    .select("items.productId userBuyerId")
    .lean();

  await printExplain(
    "Catalog: approved + in stock, sort newest",
    ProductModel.find({
      productModerationStatus: PRODUCT_MODERATION_APPROVED,
      productIsAvailable: { $ne: false },
      productStockQuantity: { $gt: 0 },
    })
      .sort({
        catalogPromotionActivatedAt: -1,
        catalogPromotionExpiresAt: -1,
        createdAt: -1,
      })
      .limit(24)
      .explain("executionStats"),
  );

  if (sampleSeller?.productCategoryId) {
    await printExplain(
      "Catalog: by productCategoryId",
      ProductModel.find({
        productModerationStatus: PRODUCT_MODERATION_APPROVED,
        productCategoryId: sampleSeller.productCategoryId,
        productIsAvailable: { $ne: false },
      })
        .sort({ createdAt: -1 })
        .limit(24)
        .explain("executionStats"),
    );
  }

  await printExplain(
    "Moderation: pending FIFO",
    ProductModel.find({ productModerationStatus: PRODUCT_MODERATION_PENDING })
      .sort({ createdAt: 1 })
      .limit(20)
      .explain("executionStats"),
  );

  if (sampleSeller?.productSeller) {
    await printExplain(
      "My products: by seller",
      ProductModel.find({ productSeller: sampleSeller.productSeller })
        .sort({ createdAt: -1 })
        .limit(24)
        .explain("executionStats"),
    );
  }

  if (sampleProductId?.userBuyerId) {
    await printExplain(
      "Orders: buyer list",
      OrderModel.find({ userBuyerId: sampleProductId.userBuyerId })
        .sort({ createdAt: -1 })
        .limit(20)
        .explain("executionStats"),
    );
  }

  const productId = sampleProductId?.items?.[0]?.productId ?? sampleSeller?._id ?? null;
  if (productId) {
    await printExplain(
      "Orders: sales by items.productId",
      OrderModel.find({ "items.productId": productId })
        .sort({ createdAt: -1 })
        .limit(20)
        .explain("executionStats"),
    );
  }

  await printExplain(
    "Orders: admin by status",
    OrderModel.find({ status: { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(20)
      .explain("executionStats"),
  );

  console.log("\nПолный JSON: добавь .explain() в mongosh при необходимости.");
  await mongoose.disconnect();
};

main().catch((error) => {
  console.error("[explainHeavyQueries]", error);
  process.exit(1);
});
