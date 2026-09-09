/**
 * Удаление товаров 1С (пустышки / unavailable).
 *
 * Usage:
 *   node scripts/cleanupOneCProductsWithoutImagesAndStock.js --seller=narodniyoptovik
 *   node scripts/cleanupOneCProductsWithoutImagesAndStock.js --seller=narodniyoptovik --scope=unavailable --apply
 *   node scripts/cleanupOneCProductsWithoutImagesAndStock.js --apply
 */
import "dotenv/config";
import mongoose from "mongoose";

import { UserModel } from "../models/index.js";
import {
  cleanupOneCProductsWithoutImagesAndStock,
  ONEC_CLEANUP_SCOPE_NO_IMAGES,
  ONEC_CLEANUP_SCOPE_NO_IMAGES_AND_STOCK,
  ONEC_CLEANUP_SCOPE_UNAVAILABLE,
} from "../services/onec/cleanupOneCProductsWithoutImagesAndStock.js";

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  const isApply = argv.includes("--apply");
  const sellerArg = argv.find((part) => part.startsWith("--seller="));
  const sellerName = sellerArg
    ? String(sellerArg.slice("--seller=".length)).trim()
    : "";
  const scopeArg = argv.find((part) => part.startsWith("--scope="));
  const scopeRaw = scopeArg
    ? String(scopeArg.slice("--scope=".length)).trim()
    : ONEC_CLEANUP_SCOPE_NO_IMAGES_AND_STOCK;
  const scope =
    scopeRaw === ONEC_CLEANUP_SCOPE_UNAVAILABLE
      ? ONEC_CLEANUP_SCOPE_UNAVAILABLE
      : scopeRaw === ONEC_CLEANUP_SCOPE_NO_IMAGES
        ? ONEC_CLEANUP_SCOPE_NO_IMAGES
        : ONEC_CLEANUP_SCOPE_NO_IMAGES_AND_STOCK;
  return { isApply, sellerName, scope };
}

async function main() {
  const { isApply, sellerName, scope } = parseArgs(process.argv.slice(2));

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI не задан в server/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  let sellerId = null;
  if (sellerName) {
    const seller = await UserModel.findOne({ userName: sellerName })
      .select("_id userName")
      .lean();
    if (!seller) {
      throw new Error(`Продавец не найден: ${sellerName}`);
    }
    sellerId = String(seller._id);
    console.log(`[cleanup-onec] seller=${seller.userName} id=${sellerId}`);
  } else {
    console.log("[cleanup-onec] scope=ALL productFromOneC");
  }

  console.log(
    `[cleanup-onec] filter=${scope} mode=${isApply ? "APPLY" : "DRY-RUN"}`,
  );

  const result = await cleanupOneCProductsWithoutImagesAndStock({
    isApply,
    sellerId,
    scope,
  });

  console.log(JSON.stringify(result, null, 2));

  if (!isApply) {
    console.log(
      "[cleanup-onec] dry-run: ничего не удалено. Добавьте --apply для удаления.",
    );
  }
}

main()
  .catch((error) => {
    console.error("[cleanup-onec] FAILED", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
