import "dotenv/config";
import mongoose from "mongoose";

import { ProductModel } from "../models/index.js";
import { deleteProductsCascade } from "../services/product/deleteProductsCascade.js";
import { getProductIdsWithOpenSales } from "../services/product/productOrderLocks.js";
import {
  productHasImages,
  productsWithoutImagesFilter,
} from "../services/product/productImagePresence.js";

const USAGE = `Использование:
  node scripts/deleteProductsWithoutImages.js [--apply] [--limit N]

По умолчанию — dry-run (только отчёт).
  --apply   удалить товары без картинок
  --limit N обработать не больше N товаров (для проверки)`;

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
    const openSalesIds = await getProductIdsWithOpenSales(
      verified.map((product) => String(product._id)),
    );
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

    // Чистка связей (корзины, избранное, вопросы, предложения цены, продвижение)
    // общая с приёмкой 1С — чтобы два места не расходились со временем.
    const { deletedIds } = await deleteProductsCascade(deletable);

    console.log(`\nУдалено товаров: ${deletedIds.length}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  console.error(USAGE);
  process.exit(1);
});
