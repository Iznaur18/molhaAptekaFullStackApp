import ProductCategoryDisplayModel from "../../models/ProductCategoryDisplayModel.js";

const LEGACY_CATEGORY_SLUG_INDEX = "categorySlug_1";

/** Sparse indexes для categorySlug / categoryId после node displays. */
export const up = async () => {
  const collection = ProductCategoryDisplayModel.collection;

  try {
    await collection.dropIndex(LEGACY_CATEGORY_SLUG_INDEX);
  } catch (error) {
    const code = /** @type {{ code?: number }} */ (error)?.code;
    if (code !== 27 && code !== 26) {
      throw error;
    }
  }

  await ProductCategoryDisplayModel.createIndexes();
};
