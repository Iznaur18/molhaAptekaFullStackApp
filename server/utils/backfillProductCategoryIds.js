import ProductModel from "../models/ProductModel.js";
import { buildProductSearchBlobFromFields } from "./buildProductSearchBlob.js";
import {
  resolveDefaultLeafIdForLegacyCategory,
  resolveProductCategoryWriteFromId,
} from "./resolveProductCategoryWrite.js";
import { seedProductCategoryTree } from "./seedProductCategoryTree.js";

/**
 * Backfill productCategoryId + denorm для товаров с legacy enum.
 */
export const backfillProductCategoryIds = async () => {
  await seedProductCategoryTree();

  const cursor = ProductModel.find({})
    .select(
      "productName productDescription productCharacteristics productCategory productCategoryId categoryBreadcrumbRu categoryPathIds",
    )
    .lean()
    .cursor();

  for await (const product of cursor) {
    let categoryWrite = null;

    if (product.productCategoryId) {
      try {
        categoryWrite = await resolveProductCategoryWriteFromId(
          product.productCategoryId,
        );
      } catch {
        categoryWrite = null;
      }
    }

    if (!categoryWrite && product.productCategory) {
      const leafId = await resolveDefaultLeafIdForLegacyCategory(
        product.productCategory,
      );
      if (leafId) {
        try {
          categoryWrite = await resolveProductCategoryWriteFromId(leafId);
        } catch {
          categoryWrite = null;
        }
      }
    }

    const nextBlob = buildProductSearchBlobFromFields({
      productName: product.productName,
      productDescription: product.productDescription,
      productCharacteristics: product.productCharacteristics,
      productCategory: categoryWrite?.productCategory ?? product.productCategory,
      categoryBreadcrumbRu: categoryWrite?.categoryBreadcrumbRu ?? "",
      categoryPathLabelRu: categoryWrite?.categoryPathLabelRu ?? [],
      categorySearchKeywords: categoryWrite?.categorySearchKeywords ?? [],
    });

    const $set = { productSearchBlob: nextBlob };

    if (categoryWrite) {
      $set.productCategoryId = categoryWrite.productCategoryId;
      $set.categoryPathIds = categoryWrite.categoryPathIds;
      $set.categoryBreadcrumbRu = categoryWrite.categoryBreadcrumbRu;
      $set.productCategory = categoryWrite.productCategory;
    }

    const needsUpdate =
      product.productSearchBlob !== nextBlob ||
      (categoryWrite &&
        String(product.productCategoryId ?? "") !==
          String(categoryWrite.productCategoryId));

    if (!needsUpdate) {
      continue;
    }

    await ProductModel.updateOne({ _id: product._id }, { $set });
  }
};
