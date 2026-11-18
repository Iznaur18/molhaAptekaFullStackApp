import { AppError } from "../../errors/AppError.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import { escapeRegexSpecialCharsInUserInput } from "../../utils/buildRegexSearchOr.js";
import {
  toProductCategoryBreadcrumbPayload,
  toProductCategoryPublicPayload,
} from "./toProductCategoryPublicPayload.js";

const CATEGORY_SEARCH_MIN_QUERY_LENGTH = 2;
const CATEGORY_SEARCH_MAX_QUERY_LENGTH = 64;
const CATEGORY_SEARCH_RESULTS_LIMIT = 30;

export async function listProductCategoryRoots() {
  const rows = await ProductCategoryModel.find({ parentId: null })
    .sort({ sortOrder: 1, labelRu: 1 })
    .lean();

  return {
    categories: rows.map(toProductCategoryPublicPayload),
  };
}

/**
 * @param {{ query?: unknown }} args
 */
export async function searchProductCategories({ query }) {
  const rawQuery = typeof query === "string" ? query.trim() : "";
  if (rawQuery.length < CATEGORY_SEARCH_MIN_QUERY_LENGTH) {
    return { categories: [] };
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

  return {
    categories: rows.map(toProductCategoryPublicPayload),
  };
}

/**
 * @param {{ categoryId: string }} args
 */
export async function listProductCategoryChildren({ categoryId }) {
  const parent = await ProductCategoryModel.findById(categoryId).lean();

  if (!parent) {
    throw new AppError(404, "Категория не найдена");
  }

  if (parent.isLeaf === true) {
    return {
      parent: toProductCategoryPublicPayload(parent),
      categories: [],
    };
  }

  const rows = await ProductCategoryModel.find({ parentId: parent._id })
    .sort({ sortOrder: 1, labelRu: 1 })
    .lean();

  return {
    parent: toProductCategoryPublicPayload(parent),
    categories: rows.map(toProductCategoryPublicPayload),
  };
}

/**
 * @param {{ categoryId: string }} args
 */
export async function getProductCategoryBreadcrumb({ categoryId }) {
  const row = await ProductCategoryModel.findById(categoryId).lean();

  if (!row) {
    throw new AppError(404, "Категория не найдена");
  }

  return {
    breadcrumb: toProductCategoryBreadcrumbPayload(row),
  };
}
