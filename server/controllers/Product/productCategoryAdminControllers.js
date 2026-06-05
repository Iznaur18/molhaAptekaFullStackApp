import mongoose from "mongoose";

import { PRODUCT_CATEGORY_VALUES } from "../../constants/productConstants.js";
import {
  PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH,
  PRODUCT_CATEGORY_SLUG_MAX_LENGTH,
} from "../../constants/productCategoryTreeConstants.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import ProductModel from "../../models/ProductModel.js";
import { computeProductCategoryNodePaths } from "../../utils/computeProductCategoryNodePaths.js";
import { normalizeProductCategorySearchKeywords } from "../../utils/normalizeProductCategorySearchKeywords.js";
import { rebuildProductCategorySubtreePaths } from "../../utils/rebuildProductCategorySubtreePaths.js";
import { syncProductsDenormForCategorySubtree } from "../../utils/syncProductsDenormForCategorySubtree.js";
import { errorRes, successRes } from "../../utils/index.js";

const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * @param {import('mongoose').LeanDocument<import('../../models/ProductCategoryModel.js').default>} row
 */
const toCategoryAdminPayload = (row) => ({
  _id: String(row._id),
  slug: String(row.slug ?? ""),
  labelRu: String(row.labelRu ?? ""),
  parentId: row.parentId ? String(row.parentId) : null,
  depth: Number(row.depth) || 0,
  pathSlugs: Array.isArray(row.pathSlugs) ? row.pathSlugs : [],
  pathLabelRu: Array.isArray(row.pathLabelRu) ? row.pathLabelRu : [],
  searchKeywords: Array.isArray(row.searchKeywords) ? row.searchKeywords : [],
  isLeaf: row.isLeaf === true,
  legacyProductCategory:
    typeof row.legacyProductCategory === "string" ? row.legacyProductCategory : null,
  sortOrder: Number(row.sortOrder) || 0,
  updatedAt: row.updatedAt ?? null,
});

/**
 * @param {unknown} raw
 */
const normalizeSlug = (raw) => {
  const slug = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!slug || slug.length > PRODUCT_CATEGORY_SLUG_MAX_LENGTH) {
    throw new Error("Некорректный slug");
  }
  if (!CATEGORY_SLUG_PATTERN.test(slug)) {
    throw new Error("Slug: только a-z, 0-9 и дефис");
  }
  return slug;
};

/**
 * @param {unknown} raw
 */
const normalizeLabelRu = (raw) => {
  const labelRu = String(raw ?? "").trim();
  if (!labelRu || labelRu.length > PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH) {
    throw new Error("Некорректное название");
  }
  return labelRu;
};

/**
 * @param {import('mongoose').Types.ObjectId | string | null | undefined} categoryId
 * @param {import('mongoose').Types.ObjectId | string | null | undefined} parentId
 */
const assertNoCategoryCycle = async (categoryId, parentId) => {
  if (!parentId) return;
  if (String(categoryId) === String(parentId)) {
    throw new Error("Категория не может быть родителем самой себе");
  }

  let cursor = parentId;
  const guard = new Set();
  while (cursor) {
    if (guard.has(String(cursor))) {
      throw new Error("Цикл в дереве категорий");
    }
    guard.add(String(cursor));
    if (String(cursor) === String(categoryId)) {
      throw new Error("Нельзя переместить категорию внутрь своего поддерева");
    }
    const parent = await ProductCategoryModel.findById(cursor)
      .select("parentId")
      .lean();
    cursor = parent?.parentId ?? null;
  }
};

/** GET /product/admin/categories */
export async function listProductCategoriesAdminController(_req, res) {
  try {
    const rows = await ProductCategoryModel.find()
      .sort({ pathSlugs: 1, sortOrder: 1, labelRu: 1 })
      .lean();
    successRes(res, { categories: rows.map(toCategoryAdminPayload) });
  } catch (error) {
    return errorRes(
      res,
      500,
      error instanceof Error ? error.message : "Не удалось загрузить категории",
    );
  }
}

/** POST /product/admin/categories */
export async function createProductCategoryAdminController(req, res) {
  try {
    const slug = normalizeSlug(req.body?.slug);
    const labelRu = normalizeLabelRu(req.body?.labelRu);
    const parentId = req.body?.parentId
      ? new mongoose.Types.ObjectId(String(req.body.parentId))
      : null;
    const isLeaf = req.body?.isLeaf === true;
    const sortOrder = Number(req.body?.sortOrder) || 0;
    const searchKeywords = normalizeProductCategorySearchKeywords(
      req.body?.searchKeywords ?? [],
    );

    let legacyProductCategory = null;
    if (req.body?.legacyProductCategory != null) {
      const legacy = String(req.body.legacyProductCategory).trim();
      if (legacy && PRODUCT_CATEGORY_VALUES.includes(legacy)) {
        legacyProductCategory = legacy;
      }
    }

    const duplicateSlug = await ProductCategoryModel.findOne({ slug }).lean();
    if (duplicateSlug) {
      return errorRes(res, 409, "Категория с таким slug уже есть");
    }

    if (parentId) {
      const parent = await ProductCategoryModel.findById(parentId).lean();
      if (!parent) {
        return errorRes(res, 400, "Родитель не найден");
      }
      if (parent.isLeaf === true) {
        return errorRes(res, 400, "Нельзя добавить дочернюю к листу");
      }
    }

    const paths = await computeProductCategoryNodePaths({
      slug,
      labelRu,
      parentId,
    });

    const doc = await ProductCategoryModel.create({
      slug,
      labelRu,
      parentId: paths.parentId,
      depth: paths.depth,
      pathSlugs: paths.pathSlugs,
      pathIds: paths.pathIds,
      pathLabelRu: paths.pathLabelRu,
      searchKeywords,
      isLeaf,
      sortOrder,
      ...(legacyProductCategory ? { legacyProductCategory } : {}),
    });

    successRes(res, { category: toCategoryAdminPayload(doc.toObject()) }, 201);
  } catch (error) {
    return errorRes(
      res,
      400,
      error instanceof Error ? error.message : "Не удалось создать категорию",
    );
  }
}

/** PATCH /product/admin/categories/:categoryId */
export async function patchProductCategoryAdminController(req, res) {
  try {
    const categoryId = String(req.params.categoryId ?? "");
    const doc = await ProductCategoryModel.findById(categoryId);
    if (!doc) {
      return errorRes(res, 404, "Категория не найдена");
    }

    const nextLabelRu =
      req.body?.labelRu !== undefined
        ? normalizeLabelRu(req.body.labelRu)
        : doc.labelRu;
    const nextParentId =
      req.body?.parentId !== undefined
        ? req.body.parentId
          ? new mongoose.Types.ObjectId(String(req.body.parentId))
          : null
        : doc.parentId;
    const nextSlug =
      req.body?.slug !== undefined ? normalizeSlug(req.body.slug) : doc.slug;

    if (req.body?.slug !== undefined && nextSlug !== doc.slug) {
      const duplicateSlug = await ProductCategoryModel.findOne({
        slug: nextSlug,
        _id: { $ne: doc._id },
      }).lean();
      if (duplicateSlug) {
        return errorRes(res, 409, "Категория с таким slug уже есть");
      }
    }

    if (req.body?.parentId !== undefined) {
      await assertNoCategoryCycle(doc._id, nextParentId);
      if (nextParentId) {
        const parent = await ProductCategoryModel.findById(nextParentId).lean();
        if (!parent) {
          return errorRes(res, 400, "Родитель не найден");
        }
        if (parent.isLeaf === true) {
          return errorRes(res, 400, "Нельзя переместить под лист");
        }
      }
    }

    if (req.body?.isLeaf === true) {
      const childCount = await ProductCategoryModel.countDocuments({
        parentId: doc._id,
      });
      if (childCount > 0) {
        return errorRes(res, 400, "Нельзя сделать листом: есть дочерние категории");
      }
    }

    if (req.body?.isLeaf === false && doc.isLeaf === true) {
      const productCount = await ProductModel.countDocuments({
        productCategoryId: doc._id,
      });
      if (productCount > 0) {
        return errorRes(res, 400, "Нельзя снять лист: к категории привязаны товары");
      }
    }

    const structureChanged =
      req.body?.parentId !== undefined ||
      req.body?.slug !== undefined ||
      req.body?.labelRu !== undefined;

    doc.labelRu = nextLabelRu;
    doc.slug = nextSlug;
    doc.parentId = nextParentId;

    if (req.body?.isLeaf !== undefined) {
      doc.isLeaf = req.body.isLeaf === true;
    }
    if (req.body?.sortOrder !== undefined) {
      doc.sortOrder = Number(req.body.sortOrder) || 0;
    }
    if (req.body?.searchKeywords !== undefined) {
      doc.searchKeywords = normalizeProductCategorySearchKeywords(
        req.body.searchKeywords,
      );
    }
    if (req.body?.legacyProductCategory !== undefined) {
      const legacy = String(req.body.legacyProductCategory ?? "").trim();
      if (legacy && PRODUCT_CATEGORY_VALUES.includes(legacy)) {
        doc.legacyProductCategory = legacy;
      } else {
        doc.set("legacyProductCategory", undefined);
      }
    }

    if (structureChanged) {
      const paths = await computeProductCategoryNodePaths({
        slug: doc.slug,
        labelRu: doc.labelRu,
        parentId: doc.parentId,
      });
      doc.depth = paths.depth;
      doc.pathSlugs = paths.pathSlugs;
      doc.pathIds = paths.pathIds;
      doc.pathLabelRu = paths.pathLabelRu;
    }

    await doc.save();

    if (structureChanged) {
      await rebuildProductCategorySubtreePaths(doc._id);
      await syncProductsDenormForCategorySubtree(doc._id);
    }

    successRes(res, { category: toCategoryAdminPayload(doc.toObject()) });
  } catch (error) {
    return errorRes(
      res,
      400,
      error instanceof Error ? error.message : "Не удалось обновить категорию",
    );
  }
}

/** DELETE /product/admin/categories/:categoryId */
export async function deleteProductCategoryAdminController(req, res) {
  try {
    const categoryId = String(req.params.categoryId ?? "");
    const doc = await ProductCategoryModel.findById(categoryId).lean();
    if (!doc) {
      return errorRes(res, 404, "Категория не найдена");
    }

    const childCount = await ProductCategoryModel.countDocuments({
      parentId: doc._id,
    });
    if (childCount > 0) {
      return errorRes(res, 400, "Сначала удалите дочерние категории");
    }

    const productCount = await ProductModel.countDocuments({
      productCategoryId: doc._id,
    });
    if (productCount > 0) {
      return errorRes(res, 400, "К категории привязаны товары");
    }

    await ProductCategoryModel.findByIdAndDelete(categoryId);
    successRes(res, { deletedId: categoryId });
  } catch (error) {
    return errorRes(
      res,
      500,
      error instanceof Error ? error.message : "Не удалось удалить категорию",
    );
  }
}
