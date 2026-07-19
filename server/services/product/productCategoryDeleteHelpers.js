import ProductCategoryDisplayModel from "../../models/ProductCategoryDisplayModel.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import ProductModel from "../../models/ProductModel.js";
import { applyProductSearchBlobToSet } from "./applyProductSearchBlobToProductWrite.js";
import { getProductCategoryDescendantIds } from "./getProductCategoryDescendantIds.js";
import {
  resolveProductCategoryWriteFromId,
  resolveProductCategoryWriteFromLegacySlugOnly,
} from "./resolveProductCategoryWrite.js";

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default>} doc
 */
export const collectCategoryLegacySlugs = (doc) => {
  const legacySlugs = new Set([doc.slug]);
  if (
    typeof doc.legacyProductCategory === "string" &&
    doc.legacyProductCategory.trim()
  ) {
    legacySlugs.add(doc.legacyProductCategory.trim());
  }
  return legacySlugs;
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default>} doc
 */
export const countProductsBlockingCategoryDelete = async (doc) => {
  if (doc.parentId == null) {
    const legacySlugs = collectCategoryLegacySlugs(doc);
    const [directCount, orphanLegacyCount] = await Promise.all([
      ProductModel.countDocuments({ productCategoryId: doc._id }),
      ProductModel.countDocuments({
        productCategoryId: null,
        productCategory: { $in: [...legacySlugs] },
      }),
    ]);
    return directCount + orphanLegacyCount;
  }

  return ProductModel.countDocuments({ productCategoryId: doc._id });
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default>} doc
 */
export const getProductCategoryDeleteBlocker = async (doc) => {
  const childCount = await ProductCategoryModel.countDocuments({
    parentId: doc._id,
  });
  if (childCount > 0) {
    return {
      code: "children",
      message: `Сначала удалите дочерние категории (${childCount})`,
    };
  }

  const productCount = await countProductsBlockingCategoryDelete(doc);
  if (productCount > 0) {
    return {
      code: "products",
      message: `К категории привязаны товары (${productCount})`,
      productCount,
    };
  }

  return null;
};

/**
 * @param {string | import('mongoose').Types.ObjectId} categoryId
 */
export const listProductCategorySubtreeDocs = async (categoryId) => {
  const subtreeIds = await getProductCategoryDescendantIds(String(categoryId));
  if (subtreeIds.length === 0) {
    return [];
  }

  return ProductCategoryModel.find({ _id: { $in: subtreeIds } }).lean();
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default>[]} subtreeDocs
 */
export const countProductsBlockingCategorySubtree = async (subtreeDocs) => {
  if (!Array.isArray(subtreeDocs) || subtreeDocs.length === 0) {
    return 0;
  }

  const categoryIds = subtreeDocs.map((doc) => doc._id);
  const directCount = await ProductModel.countDocuments({
    productCategoryId: { $in: categoryIds },
  });

  let orphanLegacyCount = 0;
  for (const doc of subtreeDocs) {
    if (doc.parentId != null) {
      continue;
    }
    const legacySlugs = collectCategoryLegacySlugs(doc);
    orphanLegacyCount += await ProductModel.countDocuments({
      productCategoryId: null,
      productCategory: { $in: [...legacySlugs] },
    });
  }

  return directCount + orphanLegacyCount;
};

/**
 * Cascade: блок только если в ветке есть товары (дети удаляются вместе с узлом).
 *
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default>} doc
 */
export const getProductCategoryCascadeDeleteBlocker = async (doc) => {
  const subtreeDocs = await listProductCategorySubtreeDocs(doc._id);
  const productCount = await countProductsBlockingCategorySubtree(subtreeDocs);
  if (productCount > 0) {
    return {
      code: "products",
      message: `В ветке категории есть товары (${productCount}). Сначала перенесите или удалите товары.`,
      productCount,
      subtreeSize: subtreeDocs.length,
    };
  }

  return null;
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default>} doc
 * @returns {Promise<{ deletedIds: string[] }>}
 */
export const deleteProductCategoryCascade = async (doc) => {
  const subtreeDocs = await listProductCategorySubtreeDocs(doc._id);
  const deletedIds = subtreeDocs.map((node) => String(node._id));

  for (const node of subtreeDocs) {
    await cleanupProductCategoryDisplayForDeletedCategory(node);
  }

  if (deletedIds.length > 0) {
    await ProductCategoryModel.deleteMany({ _id: { $in: deletedIds } });
  }

  await syncParentLeafFlagAfterChildDelete(doc.parentId);

  return { deletedIds };
};

/**
 * @param {string | import('mongoose').Types.ObjectId} fromCategoryId
 * @param {string | import('mongoose').Types.ObjectId} toCategoryId
 */
export const reassignProductsFromCategoryLeaf = async (
  fromCategoryId,
  toCategoryId,
) => {
  const categoryWrite = await resolveProductCategoryWriteFromId(toCategoryId);
  const products = await ProductModel.find({
    productCategoryId: fromCategoryId,
  }).lean();

  for (const product of products) {
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

  return products.length;
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default>} doc
 */
export const resolveLegacySlugForDetachedProducts = async (doc) => {
  const rootId = Array.isArray(doc.pathIds) ? doc.pathIds[0] : null;
  if (rootId) {
    const root = await ProductCategoryModel.findById(rootId)
      .select("legacyProductCategory slug")
      .lean();
    if (
      typeof root?.legacyProductCategory === "string" &&
      root.legacyProductCategory.trim()
    ) {
      return root.legacyProductCategory.trim();
    }
    if (typeof root?.slug === "string" && root.slug.trim()) {
      return root.slug.trim();
    }
  }

  if (
    typeof doc.legacyProductCategory === "string" &&
    doc.legacyProductCategory.trim()
  ) {
    return doc.legacyProductCategory.trim();
  }

  return String(doc.slug ?? "").trim();
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default>} doc
 */
export const detachProductsFromCategoryLeaf = async (doc) => {
  const legacySlug = await resolveLegacySlugForDetachedProducts(doc);
  const categoryWrite =
    await resolveProductCategoryWriteFromLegacySlugOnly(legacySlug);
  const products = await ProductModel.find({
    productCategoryId: doc._id,
  }).lean();

  for (const product of products) {
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

  return products.length;
};

/**
 * @param {import('mongoose').Types.ObjectId | string | null | undefined} parentId
 */
export const syncParentLeafFlagAfterChildDelete = async (parentId) => {
  if (!parentId) {
    return;
  }

  const remainingChildren = await ProductCategoryModel.countDocuments({
    parentId,
  });
  if (remainingChildren > 0) {
    return;
  }

  await ProductCategoryModel.updateOne(
    { _id: parentId, isLeaf: { $ne: true } },
    { $set: { isLeaf: true } },
  );
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default>} doc
 */
export const cleanupProductCategoryDisplayForDeletedCategory = async (doc) => {
  const legacySlugs = collectCategoryLegacySlugs(doc);
  const tasks = [ProductCategoryDisplayModel.deleteMany({ categoryId: doc._id })];

  if (doc.parentId == null) {
    tasks.push(
      ProductCategoryDisplayModel.deleteMany({
        categorySlug: { $in: [...legacySlugs] },
      }),
    );
  }

  await Promise.all(tasks);
};
