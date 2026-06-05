import ProductCategoryModel from "../models/ProductCategoryModel.js";
import ProductModel from "../models/ProductModel.js";
import { applyProductSearchBlobToSet } from "./applyProductSearchBlobToProductWrite.js";
import { resolveProductCategoryWriteFromId } from "./resolveProductCategoryWrite.js";

/**
 * @param {import('mongoose').Types.ObjectId | string} rootCategoryId
 */
const collectSubtreeCategoryIds = async (rootCategoryId) => {
  const ids = [rootCategoryId];
  const queue = [rootCategoryId];

  while (queue.length > 0) {
    const parentId = queue.shift();
    const children = await ProductCategoryModel.find({ parentId }).select("_id").lean();
    for (const child of children) {
      ids.push(child._id);
      queue.push(child._id);
    }
  }

  return ids;
};

/**
 * @param {import('mongoose').Types.ObjectId | string} rootCategoryId
 */
export const syncProductsDenormForCategorySubtree = async (rootCategoryId) => {
  const subtreeIds = await collectSubtreeCategoryIds(rootCategoryId);
  const leafIds = await ProductCategoryModel.find({
    _id: { $in: subtreeIds },
    isLeaf: true,
  })
    .distinct("_id")
    .lean();

  for (const leafId of leafIds) {
    const categoryWrite = await resolveProductCategoryWriteFromId(leafId);
    const products = await ProductModel.find({
      productCategoryId: leafId,
    }).lean();

    for (const product of products) {
      /** @type {Record<string, unknown>} */
      const $set = {
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
  }
};
