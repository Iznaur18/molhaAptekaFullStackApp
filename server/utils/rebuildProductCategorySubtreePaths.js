import ProductCategoryModel from "../models/ProductCategoryModel.js";
import { computeProductCategoryNodePaths } from "./computeProductCategoryNodePaths.js";
/**
 * @param {import('mongoose').Types.ObjectId | string} rootCategoryId
 */
export const rebuildProductCategorySubtreePaths = async (rootCategoryId) => {
  const root = await ProductCategoryModel.findById(rootCategoryId).lean();
  if (!root) {
    return;
  }

  const children = await ProductCategoryModel.find({ parentId: root._id })
    .sort({ sortOrder: 1, labelRu: 1 })
    .lean();

  for (const child of children) {
    const paths = await computeProductCategoryNodePaths({
      slug: child.slug,
      labelRu: child.labelRu,
      parentId: root._id,
    });

    await ProductCategoryModel.updateOne(
      { _id: child._id },
      {
        $set: {
          depth: paths.depth,
          pathSlugs: paths.pathSlugs,
          pathIds: paths.pathIds,
          pathLabelRu: paths.pathLabelRu,
        },
      },
    );

    await rebuildProductCategorySubtreePaths(child._id);
  }
};
