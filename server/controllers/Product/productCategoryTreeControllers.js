import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import { errorRes, successRes } from "../../services/http/index.js";
import {
  toProductCategoryBreadcrumbPayload,
  toProductCategoryPublicPayload,
} from "../../services/product/toProductCategoryPublicPayload.js";
import { escapeRegexSpecialCharsInUserInput } from "../../utils/buildRegexSearchOr.js";

const CATEGORY_SEARCH_MIN_QUERY_LENGTH = 2;
const CATEGORY_SEARCH_MAX_QUERY_LENGTH = 64;
const CATEGORY_SEARCH_RESULTS_LIMIT = 30;

/** GET /product/categories/roots */
export const getProductCategoryRootsController = async (_req, res) => {
  const rows = await ProductCategoryModel.find({ parentId: null })
    .sort({ sortOrder: 1, labelRu: 1 })
    .lean();

  return successRes(res, {
    categories: rows.map(toProductCategoryPublicPayload),
  });
};

/** GET /product/categories/search?query=… — поиск конечных подкатегорий по названию */
export const getProductCategorySearchController = async (req, res) => {
  const rawQuery = typeof req.query.query === "string" ? req.query.query.trim() : "";
  if (rawQuery.length < CATEGORY_SEARCH_MIN_QUERY_LENGTH) {
    return successRes(res, { categories: [] });
  }

  const pattern = new RegExp(
    escapeRegexSpecialCharsInUserInput(
      rawQuery.slice(0, CATEGORY_SEARCH_MAX_QUERY_LENGTH),
    ),
    "i",
  );

  const rows = await ProductCategoryModel.find({
    isLeaf: true,
    $or: [{ labelRu: pattern }, { searchKeywords: pattern }, { pathLabelRu: pattern }],
  })
    .sort({ depth: 1, labelRu: 1 })
    .limit(CATEGORY_SEARCH_RESULTS_LIMIT)
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
