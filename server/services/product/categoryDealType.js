import {
  normalizeCategoryDealType,
  normalizeCategoryOwnDealType,
} from "@molha/api-contract";

import ProductCategoryModel from "../../models/ProductCategoryModel.js";

/**
 * Итоговый тип сделки узла: свой, а если не выбран — родительский.
 *
 * @param {{
 *   ownDealType: unknown;
 *   parentId: import('mongoose').Types.ObjectId | string | null | undefined;
 * }} params
 * @returns {Promise<"goods" | "viewing" | "service">}
 */
export const resolveCategoryEffectiveDealType = async ({ ownDealType, parentId }) => {
  const own = normalizeCategoryOwnDealType(ownDealType);
  if (own) {
    return own;
  }
  if (!parentId) {
    return normalizeCategoryDealType(null);
  }

  const parent = await ProductCategoryModel.findById(parentId)
    .select("effectiveDealType")
    .lean();
  return normalizeCategoryDealType(parent?.effectiveDealType);
};

/**
 * Разносит итоговый тип сделки по поддереву после правки или переноса узла.
 *
 * Подкатегория со своим явным типом останавливает наследование: её ветка
 * продолжает жить по её типу, а не по новому родительскому.
 *
 * @param {import('mongoose').Types.ObjectId | string} rootCategoryId
 */
export const rebuildCategoryDealTypeSubtree = async (rootCategoryId) => {
  const root = await ProductCategoryModel.findById(rootCategoryId)
    .select("effectiveDealType")
    .lean();
  if (!root) {
    return;
  }

  const queue = [
    {
      id: root._id,
      effectiveDealType: normalizeCategoryDealType(root.effectiveDealType),
    },
  ];

  while (queue.length > 0) {
    const parent = queue.shift();
    const children = await ProductCategoryModel.find({ parentId: parent.id })
      .select("dealType effectiveDealType")
      .lean();

    for (const child of children) {
      const effectiveDealType =
        normalizeCategoryOwnDealType(child.dealType) ?? parent.effectiveDealType;

      if (child.effectiveDealType !== effectiveDealType) {
        await ProductCategoryModel.updateOne(
          { _id: child._id },
          { $set: { effectiveDealType } },
        );
      }
      queue.push({ id: child._id, effectiveDealType });
    }
  }
};
