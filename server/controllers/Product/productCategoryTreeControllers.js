import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import { errorRes, successRes } from "../../services/http/index.js";
import {
  toProductCategoryBreadcrumbPayload,
  toProductCategoryPublicPayload,
} from "../../services/product/toProductCategoryPublicPayload.js";

/** GET /product/categories/roots */
export const getProductCategoryRootsController = async (_req, res) => {
  const rows = await ProductCategoryModel.find({ parentId: null })
    .sort({ sortOrder: 1, labelRu: 1 })
    .lean();

  return successRes(res, {
    categories: rows.map(toProductCategoryPublicPayload),
  });
};

/** GET /product/categories/:categoryId/children */
export const getProductCategoryChildrenController = async (req, res) => {
  const { categoryId } = req.params;
  const parent = await ProductCategoryModel.findById(categoryId).lean();

  if (!parent) {
    return errorRes(res, 404, "Категория не найдена");
  }

  if (parent.isLeaf === true) {
    return successRes(res, {
      parent: toProductCategoryPublicPayload(parent),
      categories: [],
    });
  }

  const rows = await ProductCategoryModel.find({ parentId: parent._id })
    .sort({ sortOrder: 1, labelRu: 1 })
    .lean();

  return successRes(res, {
    parent: toProductCategoryPublicPayload(parent),
    categories: rows.map(toProductCategoryPublicPayload),
  });
};

/** GET /product/categories/:categoryId/breadcrumb */
export const getProductCategoryBreadcrumbController = async (req, res) => {
  const { categoryId } = req.params;
  const row = await ProductCategoryModel.findById(categoryId).lean();

  if (!row) {
    return errorRes(res, 404, "Категория не найдена");
  }

  return successRes(res, {
    breadcrumb: toProductCategoryBreadcrumbPayload(row),
  });
};
