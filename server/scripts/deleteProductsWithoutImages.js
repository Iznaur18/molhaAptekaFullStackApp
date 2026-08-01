import "dotenv/config";
import mongoose from "mongoose";

import { normalizeStoredCartItems } from "../controllers/Cart/cartItemHelpers.js";
import { removeProductIdsFromAllWishlists } from "../controllers/Favorites/favoritesItemHelpers.js";
import {
  PRICE_OFFER_STATUS_ACCEPTED,
  PRICE_OFFER_STATUS_REJECTED,
} from "../constants/productPriceOfferConstants.js";
import {
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
} from "../constants/productPromotionConstants.js";
import {
  CartModel,
  ProductModel,
  ProductPriceOfferModel,
  ProductViewModel,
} from "../models/index.js";
import { dismissPendingReportsForProduct } from "../services/product/productReportHelpers.js";
import { getProductIdsWithOpenSales } from "../services/product/productOrderLocks.js";
import { deleteUploadFileByUrl } from "../services/upload/deleteUploadFileByUrl.js";
import { rejectAllPendingOffersForProduct } from "../utils/productPriceOfferHelpers.js";
import { cancelProductPromotionsForProduct } from "../utils/productPromotionHelpers.js";
import { normalizeProductPreviewVideoUrl } from "../utils/productPreviewVideo.js";
import {
  productHasImages,
  productsWithoutImagesFilter,
} from "./lib/productsWithoutImagesQuery.js";

const USAGE = `Использование:
  node scripts/deleteProductsWithoutImages.js [--apply] [--limit N]

По умолчанию — dry-run (только отчёт).
  --apply   удалить товары без картинок
  --limit N обработать не больше N товаров (для проверки)`;

/**
 * @param {string[]} productIds
 */
async function removeProductIdsFromAllCarts(productIds) {
  const idSet = new Set(productIds.map(String).filter(Boolean));
  if (idSet.size === 0) {
    return 0;
  }

  const carts = await CartModel.find({}).select("userId items").lean();
  let updatedCarts = 0;

  for (const cart of carts) {
    const items = normalizeStoredCartItems(cart.items);
    let changed = false;

    for (const productId of idSet) {
      if (Object.prototype.hasOwnProperty.call(items, productId)) {
        delete items[productId];
        changed = true;
      }
    }

    if (!changed) {
      continue;
    }

    await CartModel.updateOne({ userId: cart.userId }, { $set: { items } });
    updatedCarts += 1;
  }

  return updatedCarts;
}

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 * @param {{ productPreviewVideoUrl?: unknown }} product
 */
async function cleanupDeletedProductRelations(productId, product) {
  const previewVideoUrl = normalizeProductPreviewVideoUrl(
    product.productPreviewVideoUrl,
  );
  if (previewVideoUrl) {
    await deleteUploadFileByUrl(previewVideoUrl);
  }

  await dismissPendingReportsForProduct(productId);
  await rejectAllPendingOffersForProduct(productId);
  await cancelProductPromotionsForProduct({
    productId,
    statuses: [PRODUCT_PROMOTION_STATUS_PENDING_STAFF, PRODUCT_PROMOTION_STATUS_ACTIVE],
  });

  const now = new Date();
  await ProductPriceOfferModel.updateMany(
    { productId, status: PRICE_OFFER_STATUS_ACCEPTED },
    {
      $set: {
        status: PRICE_OFFER_STATUS_REJECTED,
        reviewedAt: now,
      },
    },
  );
}

function parseArgs(argv) {
  const isApply = argv.includes("--apply");
  const limitIndex = argv.indexOf("--limit");
  const limitRaw = limitIndex >= 0 ? argv[limitIndex + 1] : undefined;
  const limit =
    limitRaw != null && String(limitRaw).trim() !== ""
      ? Number.parseInt(String(limitRaw), 10)
      : null;

  if (limit != null && (!Number.isFinite(limit) || limit <= 0)) {
    throw new Error("--limit должен быть положительным числом");
  }

  return { isApply, limit };
}

async function main() {
  const { isApply, limit } = parseArgs(process.argv.slice(2));

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI не задан в server/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    let query = ProductModel.find(productsWithoutImagesFilter)
      .select(
        "_id productName productSeller productPreviewVideoUrl productImageUrls productImageUrl",
      )
      .sort({ createdAt: 1 })
      .lean();

    if (limit != null) {
      query = query.limit(limit);
    }

    const candidates = await query;
    const verified = candidates.filter((product) => !productHasImages(product));
    const productIds = verified.map((product) => String(product._id));
    const openSalesIds = await getProductIdsWithOpenSales(productIds);
    const deletable = verified.filter(
      (product) => !openSalesIds.has(String(product._id)),
    );
    const blocked = verified.filter((product) => openSalesIds.has(String(product._id)));

    console.log(`Найдено без картинок: ${verified.length}`);
    console.log(`К удалению: ${deletable.length}`);
    console.log(`Пропуск (открытые продажи): ${blocked.length}`);

    for (const product of deletable.slice(0, 20)) {
      console.log(`  - ${product._id}  ${product.productName ?? ""}`);
    }
    if (deletable.length > 20) {
      console.log(`  ... ещё ${deletable.length - 20}`);
    }

    if (blocked.length > 0) {
      console.log("\nПропущены из-за незавершённых продаж:");
      for (const product of blocked.slice(0, 10)) {
        console.log(`  - ${product._id}  ${product.productName ?? ""}`);
      }
      if (blocked.length > 10) {
        console.log(`  ... ещё ${blocked.length - 10}`);
      }
    }

    if (!isApply) {
      console.log("\nDry-run. Для удаления добавьте --apply");
      return;
    }

    if (deletable.length === 0) {
      console.log("\nНечего удалять.");
      return;
    }

    const deletedIds = deletable.map((product) => String(product._id));

    for (const product of deletable) {
      await cleanupDeletedProductRelations(product._id, product);
    }

    await ProductViewModel.deleteMany({
      productId: { $in: deletable.map((product) => product._id) },
    });

    const deleteResult = await ProductModel.deleteMany({
      _id: { $in: deletable.map((product) => product._id) },
    });

    const updatedWishlists = await removeProductIdsFromAllWishlists(deletedIds);
    const updatedCarts = await removeProductIdsFromAllCarts(deletedIds);

    console.log(`\nУдалено товаров: ${deleteResult.deletedCount}`);
    console.log(`Очищено wishlist: ${updatedWishlists}`);
    console.log(`Очищено корзин: ${updatedCarts}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  console.error(USAGE);
  process.exit(1);
});
