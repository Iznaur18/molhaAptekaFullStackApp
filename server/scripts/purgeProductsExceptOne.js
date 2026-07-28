import "dotenv/config";
import mongoose from "mongoose";

import { normalizeStoredCartItems } from "../controllers/Cart/cartItemHelpers.js";
import { normalizeStoredWishlistItems } from "../controllers/Favorites/favoritesItemHelpers.js";
import {
  CartModel,
  CuratedProductListModel,
  InstallmentContractModel,
  InstallmentDisputeModel,
  InstallmentOperationLogModel,
  OrderModel,
  ProductInstallmentProgramModel,
  ProductModel,
  ProductPriceOfferModel,
  ProductPromotionModel,
  ProductReportModel,
  ProductReviewModel,
  ProductViewModel,
  WishlistModel,
} from "../models/index.js";
import { deleteUploadFileByUrl } from "../services/upload/deleteUploadFileByUrl.js";
import { normalizeProductPreviewVideoUrl } from "../utils/productPreviewVideo.js";

const KEEP_PRODUCT_ID = "6a5bf6539cfea35f316dd4fc";

const USAGE = `Использование:
  node scripts/purgeProductsExceptOne.js [--apply]

По умолчанию — dry-run (только отчёт).
  --apply   удалить все товары кроме ${KEEP_PRODUCT_ID}
            и всю историю заказов / рассрочек (покупки и продажи)

Оставляет: один товар. Удаляет: Orders, Installment*, связи удалённых товаров,
корзины/wishlist/curated без мёртвых id.`;

/**
 * @param {string[]} productIds
 */
async function stripProductIdsFromCarts(productIds) {
  const idSet = new Set(productIds.map(String).filter(Boolean));
  if (idSet.size === 0) {
    return 0;
  }

  const carts = await CartModel.find({}).select("userId items").lean();
  let updated = 0;

  for (const cart of carts) {
    const items = normalizeStoredCartItems(cart.items);
    let changed = false;
    for (const productId of idSet) {
      if (Object.prototype.hasOwnProperty.call(items, productId)) {
        delete items[productId];
        changed = true;
      }
    }
    if (!changed) continue;
    await CartModel.updateOne({ userId: cart.userId }, { $set: { items } });
    updated += 1;
  }

  return updated;
}

/**
 * @param {string[]} productIds
 */
async function stripProductIdsFromWishlists(productIds) {
  const idSet = new Set(productIds.map(String).filter(Boolean));
  if (idSet.size === 0) {
    return 0;
  }

  const wishlists = await WishlistModel.find({}).select("userId items").lean();
  let updated = 0;

  for (const wishlist of wishlists) {
    const items = normalizeStoredWishlistItems(wishlist.items);
    let changed = false;
    for (const productId of idSet) {
      if (Object.prototype.hasOwnProperty.call(items, productId)) {
        delete items[productId];
        changed = true;
      }
    }
    if (!changed) continue;
    await WishlistModel.updateOne({ userId: wishlist.userId }, { $set: { items } });
    updated += 1;
  }

  return updated;
}

/**
 * @param {string[]} productIds
 */
async function stripProductIdsFromCuratedLists(productIds) {
  if (productIds.length === 0) {
    return 0;
  }
  const objectIds = productIds
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  if (objectIds.length === 0) {
    return 0;
  }
  const result = await CuratedProductListModel.updateMany(
    {},
    { $pull: { productIds: { $in: objectIds } } },
  );
  return result.modifiedCount ?? 0;
}

async function main() {
  const isApply = process.argv.slice(2).includes("--apply");

  if (!mongoose.isValidObjectId(KEEP_PRODUCT_ID)) {
    throw new Error(`Некорректный KEEP id: ${KEEP_PRODUCT_ID}`);
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI не задан в server/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const keepOid = new mongoose.Types.ObjectId(KEEP_PRODUCT_ID);
  const productFilter = { _id: { $ne: keepOid } };

  try {
    const keepProduct = await ProductModel.findById(keepOid).select("_id productName").lean();
    if (!keepProduct) {
      throw new Error(`Товар ${KEEP_PRODUCT_ID} не найден — abort`);
    }

    const [
      productsToDelete,
      orderCount,
      installmentContractCount,
      installmentDisputeCount,
      installmentLogCount,
      reviewCount,
      viewCount,
      reportCount,
      offerCount,
      promotionCount,
      installmentProgramCount,
    ] = await Promise.all([
      ProductModel.countDocuments(productFilter),
      OrderModel.countDocuments({}),
      InstallmentContractModel.countDocuments({}),
      InstallmentDisputeModel.countDocuments({}),
      InstallmentOperationLogModel.countDocuments({}),
      ProductReviewModel.countDocuments({ productId: { $ne: keepOid } }),
      ProductViewModel.countDocuments({ productId: { $ne: keepOid } }),
      ProductReportModel.countDocuments({ productId: { $ne: keepOid } }),
      ProductPriceOfferModel.countDocuments({ productId: { $ne: keepOid } }),
      ProductPromotionModel.countDocuments({ productId: { $ne: keepOid } }),
      ProductInstallmentProgramModel.countDocuments({ productId: { $ne: keepOid } }),
    ]);

    console.log(isApply ? "MODE: APPLY" : "MODE: dry-run (без --apply ничего не удалится)");
    console.log(`KEEP: ${keepProduct._id}  ${keepProduct.productName ?? ""}`);
    console.log(`Products to delete: ${productsToDelete}`);
    console.log(`Orders (все покупки/продажи): ${orderCount}`);
    console.log(`Installment contracts: ${installmentContractCount}`);
    console.log(`Installment disputes: ${installmentDisputeCount}`);
    console.log(`Installment op logs: ${installmentLogCount}`);
    console.log(`Reviews (чужие товары): ${reviewCount}`);
    console.log(`Views (чужие товары): ${viewCount}`);
    console.log(`Reports (чужие товары): ${reportCount}`);
    console.log(`Price offers (чужие товары): ${offerCount}`);
    console.log(`Promotions (чужие товары): ${promotionCount}`);
    console.log(`Installment programs (чужие товары): ${installmentProgramCount}`);

    if (!isApply) {
      console.log("\nДля удаления: node scripts/purgeProductsExceptOne.js --apply");
      return;
    }

    const doomed = await ProductModel.find(productFilter)
      .select("_id productPreviewVideoUrl")
      .lean();
    const doomedIds = doomed.map((p) => String(p._id));

    console.log("\nУдаляю историю заказов / рассрочек…");
    const ordersDeleted = await OrderModel.deleteMany({});
    const contractsDeleted = await InstallmentContractModel.deleteMany({});
    const disputesDeleted = await InstallmentDisputeModel.deleteMany({});
    const logsDeleted = await InstallmentOperationLogModel.deleteMany({});
    console.log(`  orders: ${ordersDeleted.deletedCount}`);
    console.log(`  installment contracts: ${contractsDeleted.deletedCount}`);
    console.log(`  installment disputes: ${disputesDeleted.deletedCount}`);
    console.log(`  installment logs: ${logsDeleted.deletedCount}`);

    console.log("Удаляю связи удалённых товаров…");
    const relatedFilter = { productId: { $ne: keepOid } };
    console.log(
      `  reviews: ${(await ProductReviewModel.deleteMany(relatedFilter)).deletedCount}`,
    );
    console.log(`  views: ${(await ProductViewModel.deleteMany(relatedFilter)).deletedCount}`);
    console.log(
      `  reports: ${(await ProductReportModel.deleteMany(relatedFilter)).deletedCount}`,
    );
    console.log(
      `  offers: ${(await ProductPriceOfferModel.deleteMany(relatedFilter)).deletedCount}`,
    );
    console.log(
      `  promotions: ${(await ProductPromotionModel.deleteMany(relatedFilter)).deletedCount}`,
    );
    console.log(
      `  installment programs: ${(await ProductInstallmentProgramModel.deleteMany(relatedFilter)).deletedCount}`,
    );

    console.log("Чищу carts / wishlists / curated…");
    console.log(`  carts updated: ${await stripProductIdsFromCarts(doomedIds)}`);
    console.log(`  wishlists updated: ${await stripProductIdsFromWishlists(doomedIds)}`);
    console.log(`  curated lists updated: ${await stripProductIdsFromCuratedLists(doomedIds)}`);

    console.log("Удаляю preview-video файлы (best-effort)…");
    let videosRemoved = 0;
    for (const product of doomed) {
      const url = normalizeProductPreviewVideoUrl(product.productPreviewVideoUrl);
      if (!url) continue;
      try {
        await deleteUploadFileByUrl(url);
        videosRemoved += 1;
      } catch (error) {
        console.warn(`  video skip ${product._id}:`, error instanceof Error ? error.message : error);
      }
    }
    console.log(`  videos: ${videosRemoved}`);

    console.log("Удаляю товары…");
    const productsDeleted = await ProductModel.deleteMany(productFilter);
    console.log(`  products: ${productsDeleted.deletedCount}`);

    // Сброс denorm счётчика продаж у оставшегося товара (история заказов уже пуста).
    await ProductModel.updateOne(
      { _id: keepOid },
      {
        $set: {
          soldQuantity: 0,
        },
      },
    );

    const remaining = await ProductModel.countDocuments({});
    const remainingOrders = await OrderModel.countDocuments({});
    console.log(`\nГотово. Products left: ${remaining}; Orders left: ${remainingOrders}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  console.error(USAGE);
  process.exitCode = 1;
});
