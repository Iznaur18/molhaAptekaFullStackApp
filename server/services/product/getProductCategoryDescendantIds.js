import ProductCategoryModel from "../../models/ProductCategoryModel.js";

/**
 * id узла + все потомки (для фильтра каталога, фаза 4).
 *
 * @param {string} categoryId
 * @returns {Promise<string[]>}
 */
export const getProductCategoryDescendantIds = async (categoryId) => {
  const root = await ProductCategoryModel.findById(categoryId)
    .select("_id pathIds")
    .lean();

  if (!root) return [];

  const descendants = await ProductCategoryModel.find({
    pathIds: root._id,
  })
    .select("_id")
    .lean();

  return [String(root._id), ...descendants.map((row) => String(row._id))];
};
