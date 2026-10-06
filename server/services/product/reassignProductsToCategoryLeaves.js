import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import ProductModel from "../../models/ProductModel.js";
import { applyProductSearchBlobToSet } from "./applyProductSearchBlobToProductWrite.js";
import { resolveProductCategoryWriteFromId } from "./resolveProductCategoryWrite.js";

/**
 * Раскладывает товары по конечным подкатегориям: `{ productId: slug листа }`.
 *
 * Трогаем только товар, который сейчас без подкатегории (`productCategoryId`
 * пуст). Если продавец уже сам выбрал подкатегорию — его выбор важнее раскладки,
 * товар пропускается. Поэтому повторный запуск ничего не меняет.
 *
 * Запись — тем же набором полей, что и «выбрать категорию» в форме товара:
 * id листа, путь, хлебные крошки, legacy-слаг корня и поисковый blob.
 *
 * @param {{
 *   assignments: Record<string, string>;
 *   dryRun?: boolean;
 * }} params
 */
export const reassignProductsToCategoryLeaves = async ({
  assignments,
  dryRun = false,
}) => {
  const summary = {
    total: Object.keys(assignments).length,
    reassigned: 0,
    skippedAlreadyCategorized: 0,
    missingProducts: /** @type {string[]} */ ([]),
    missingCategories: /** @type {string[]} */ ([]),
  };

  const leafSlugs = [...new Set(Object.values(assignments))];
  const leaves = await ProductCategoryModel.find({ slug: { $in: leafSlugs } })
    .select("_id slug isLeaf")
    .lean();
  const leafBySlug = new Map(leaves.map((leaf) => [leaf.slug, leaf]));
  /** Запись категории одинакова для всех товаров листа — считаем один раз. */
  const writeBySlug = new Map();

  for (const [productId, leafSlug] of Object.entries(assignments)) {
    const leaf = leafBySlug.get(leafSlug);
    if (!leaf || leaf.isLeaf !== true) {
      if (!summary.missingCategories.includes(leafSlug)) {
        summary.missingCategories.push(leafSlug);
      }
      continue;
    }

    const product = await ProductModel.findById(productId)
      .select("productName productDescription productCharacteristics productCategoryId")
      .lean();
    if (!product) {
      summary.missingProducts.push(productId);
      continue;
    }
    if (product.productCategoryId) {
      summary.skippedAlreadyCategorized += 1;
      continue;
    }

    summary.reassigned += 1;
    if (dryRun) {
      continue;
    }

    if (!writeBySlug.has(leafSlug)) {
      writeBySlug.set(leafSlug, await resolveProductCategoryWriteFromId(leaf._id));
    }
    const categoryWrite = writeBySlug.get(leafSlug);

    /** @type {Record<string, unknown>} */
    const $set = {
      productCategoryId: categoryWrite.productCategoryId,
      productCategory: categoryWrite.productCategory,
      categoryPathIds: categoryWrite.categoryPathIds,
      categoryBreadcrumbRu: categoryWrite.categoryBreadcrumbRu,
    };
    applyProductSearchBlobToSet($set, {
      productName: product.productName,
      productDescription: product.productDescription,
      productCharacteristics: product.productCharacteristics,
      productCategory: categoryWrite.productCategory,
      categoryBreadcrumbRu: categoryWrite.categoryBreadcrumbRu,
      categoryPathLabelRu: categoryWrite.categoryPathLabelRu,
      categorySearchKeywords: categoryWrite.categorySearchKeywords,
    });

    await ProductModel.updateOne({ _id: product._id }, { $set });
  }

  return summary;
};
