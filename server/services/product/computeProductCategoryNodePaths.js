import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import { PRODUCT_CATEGORY_TREE_MAX_DEPTH } from "../../constants/productCategoryTreeConstants.js";

/**
 * @param {{
 *   slug: string;
 *   labelRu: string;
 *   parentId: import('mongoose').Types.ObjectId | string | null;
 * }} params
 */
export const computeProductCategoryNodePaths = async ({ slug, labelRu, parentId }) => {
  if (!parentId) {
    return {
      parentId: null,
      depth: 0,
      pathSlugs: [slug],
      pathIds: [],
      pathLabelRu: [labelRu],
    };
  }

  const parent = await ProductCategoryModel.findById(parentId).lean();
  if (!parent) {
    throw new Error("Родительская категория не найдена");
  }

  const depth = Number(parent.depth) + 1;
  if (depth > PRODUCT_CATEGORY_TREE_MAX_DEPTH) {
    throw new Error(`Максимальная глубина дерева — ${PRODUCT_CATEGORY_TREE_MAX_DEPTH}`);
  }

  return {
    parentId: parent._id,
    depth,
    pathSlugs: [...(Array.isArray(parent.pathSlugs) ? parent.pathSlugs : []), slug],
    pathIds: [...(Array.isArray(parent.pathIds) ? parent.pathIds : []), parent._id],
    pathLabelRu: [
      ...(Array.isArray(parent.pathLabelRu) ? parent.pathLabelRu : []),
      labelRu,
    ],
  };
};
