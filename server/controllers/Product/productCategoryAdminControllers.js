import mongoose from "mongoose";

import { PRODUCT_CATEGORY_VALUES } from "../../constants/productConstants.js";
import {
  PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH,
  PRODUCT_CATEGORY_SLUG_MAX_LENGTH,
} from "../../constants/productCategoryTreeConstants.js";
import ProductCategoryDisplayModel from "../../models/ProductCategoryDisplayModel.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import ProductModel from "../../models/ProductModel.js";
import { AppError } from "../../errors/AppError.js";
import { ensureProductCategoryDisplayForSlug } from "../../services/product/ensureProductCategoryDisplayForSlug.js";
import { computeProductCategoryNodePaths } from "../../services/product/computeProductCategoryNodePaths.js";
import { normalizeProductCategorySearchKeywords } from "../../services/product/normalizeProductCategorySearchKeywords.js";
import { normalizeProductCategoryDefaultCharacteristicKeys } from "../../services/product/normalizeProductCategoryDefaultCharacteristicKeys.js";
import { rebuildProductCategorySubtreePaths } from "../../services/product/rebuildProductCategorySubtreePaths.js";
import { syncProductsDenormForCategorySubtree } from "../../services/product/syncProductsDenormForCategorySubtree.js";
import {
  deleteProductCategoryCascade,
  getProductCategoryCascadeDeleteBlocker,
} from "../../services/product/productCategoryDeleteHelpers.js";
import { errorRes, successRes } from "../../services/http/index.js";

const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * @param {import('mongoose').LeanDocument<import('../../models/ProductCategoryModel.js').default>} row
 */
/**
 * Название плитки, если админ переименовал её на витрине.
 *
 * Дерево категорий и витрина — разные вещи: `labelRu` попадает в карточки
 * товаров и хлебные крошки, а `customLabel` меняет только подпись плитки. Пока
 * админка дерева про переопределение не знала, переименованную категорию в ней
 * было не найти: на витрине «Транспорт и запчасти», в дереве по-прежнему
 * «Автомобили», и поиск по новому названию не давал ничего.
 *
 * @param {Record<string, any>} row
 * @param {Map<string, string>} labelBySlug
 * @param {Map<string, string>} labelById
 */
const resolveStorefrontLabel = (row, labelBySlug, labelById) =>
  labelById.get(String(row._id)) ?? labelBySlug.get(String(row.slug ?? "")) ?? null;

const toCategoryAdminPayload = (row, storefrontLabel = null) => ({
  _id: String(row._id),
  slug: String(row.slug ?? ""),
  labelRu: String(row.labelRu ?? ""),
  parentId: row.parentId ? String(row.parentId) : null,
  depth: Number(row.depth) || 0,
  pathSlugs: Array.isArray(row.pathSlugs) ? row.pathSlugs : [],
  pathLabelRu: Array.isArray(row.pathLabelRu) ? row.pathLabelRu : [],
  searchKeywords: Array.isArray(row.searchKeywords) ? row.searchKeywords : [],
  defaultCharacteristicKeys: Array.isArray(row.defaultCharacteristicKeys)
    ? row.defaultCharacteristicKeys
    : [],
  isLeaf: row.isLeaf === true,
  legacyProductCategory:
    typeof row.legacyProductCategory === "string" ? row.legacyProductCategory : null,
  sortOrder: Number(row.sortOrder) || 0,
  updatedAt: row.updatedAt ?? null,
  // `null`, когда плитку не переименовывали: витрина показывает `labelRu`.
  storefrontLabel: storefrontLabel || null,
});

/**
 * @param {unknown} raw
 */
const normalizeSlug = (raw) => {
  const slug = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!slug || slug.length > PRODUCT_CATEGORY_SLUG_MAX_LENGTH) {
    throw new AppError(400, "Некорректный slug");
  }
  if (!CATEGORY_SLUG_PATTERN.test(slug)) {
    throw new AppError(400, "Slug: только a-z, 0-9 и дефис");
  }
  return slug;
};

/**
 * @param {unknown} raw
 */
const normalizeLabelRu = (raw) => {
  const labelRu = String(raw ?? "").trim();
  if (!labelRu || labelRu.length > PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH) {
    throw new AppError(400, "Некорректное название");
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
    throw new AppError(400, "Категория не может быть родителем самой себе");
  }

  let cursor = parentId;
  const guard = new Set();
  while (cursor) {
    if (guard.has(String(cursor))) {
      throw new AppError(400, "Цикл в дереве категорий");
    }
    guard.add(String(cursor));
    if (String(cursor) === String(categoryId)) {
      throw new AppError(400, "Нельзя переместить категорию внутрь своего поддерева");
    }
    const parent = await ProductCategoryModel.findById(cursor)
      .select("parentId")
      .lean();
    cursor = parent?.parentId ?? null;
  }
};

/** GET /product/admin/categories */
export async function listProductCategoriesAdminController(_req, res) {
  const rows = await ProductCategoryModel.find()
    .sort({ pathSlugs: 1, sortOrder: 1, labelRu: 1 })
    .lean();

  // Переопределения витрины заводятся то по слагу (корневые плитки), то по id
  // узла — забираем оба ключа разом, чтобы не ходить в базу на каждую строку.
  const displays = await ProductCategoryDisplayModel.find({
    customLabel: { $nin: [null, ""] },
  })
    .select("categorySlug categoryId customLabel")
    .lean();

  const labelBySlug = new Map();
  const labelById = new Map();
  for (const item of displays) {
    const label = String(item.customLabel ?? "").trim();
    if (!label) continue;
    if (item.categoryId) labelById.set(String(item.categoryId), label);
    if (item.categorySlug) labelBySlug.set(String(item.categorySlug), label);
  }

  successRes(res, {
    categories: rows.map((row) =>
      toCategoryAdminPayload(row, resolveStorefrontLabel(row, labelBySlug, labelById)),
    ),
  });
}

/** POST /product/admin/categories */
export async function createProductCategoryAdminController(req, res) {
  const slug = normalizeSlug(req.body?.slug);
  const labelRu = normalizeLabelRu(req.body?.labelRu);
  const parentId = req.body?.parentId
    ? new mongoose.Types.ObjectId(String(req.body.parentId))
    : null;
  const isRoot = !parentId;
  const sortOrder = Number(req.body?.sortOrder) || 0;
  const searchKeywords = normalizeProductCategorySearchKeywords(
    req.body?.searchKeywords ?? [],
  );
  const isLeaf = isRoot ? false : req.body?.isLeaf === true;
  const defaultCharacteristicKeys =
    isLeaf && req.body?.defaultCharacteristicKeys !== undefined
      ? normalizeProductCategoryDefaultCharacteristicKeys(
          req.body.defaultCharacteristicKeys,
        )
      : [];

  let legacyProductCategory = null;
  if (req.body?.legacyProductCategory != null) {
    const legacy = String(req.body.legacyProductCategory).trim();
    if (legacy) {
      legacyProductCategory = legacy;
    }
  } else if (isRoot) {
    legacyProductCategory = slug;
  }

  const duplicateSlug = await ProductCategoryModel.findOne({ slug }).lean();
  if (duplicateSlug) {
    return errorRes(res, 409, "Категория с таким slug уже есть");
  }

  // Родитель-лист — не ошибка, а обычное «пора углубить дерево».
  //
  // Раньше это был тупик без выхода: подкатегорию под лист добавить нельзя, а
  // снять с него лист нельзя, пока в нём лежат товары. Категория с товарами
  // навсегда оставалась без возможности обзавестись подкатегориями — ровно так
  // «Автомобили» с 23 карточками нельзя было разложить по полкам.
  //
  // Товары родителя переезжают в новую подкатегорию: другого разумного места у
  // них нет, а оставить их на ветке нельзя — товар живёт только на листе.
  let leafParentProductIds = [];
  if (parentId) {
    const parent = await ProductCategoryModel.findById(parentId).lean();
    if (!parent) {
      return errorRes(res, 400, "Родитель не найден");
    }
    if (parent.isLeaf === true) {
      leafParentProductIds = await ProductModel.find({ productCategoryId: parent._id })
        .distinct("_id")
        .lean();

      if (leafParentProductIds.length > 0 && !isLeaf) {
        return errorRes(
          res,
          400,
          "В «" +
            parent.labelRu +
            "» лежат товары: первая подкатегория должна быть листом, чтобы им было куда переехать",
        );
      }
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
    defaultCharacteristicKeys,
    ...(legacyProductCategory ? { legacyProductCategory } : {}),
  });

  if (isRoot) {
    await ensureProductCategoryDisplayForSlug(slug);
  }

  // Родитель перестаёт быть листом ПОСЛЕ создания ребёнка: упади создание —
  // и он останется прежним, а не превратится в ветку без веток.
  let movedProductCount = 0;
  if (parentId) {
    const parentUpdate = await ProductCategoryModel.updateOne(
      { _id: parentId, isLeaf: true },
      { $set: { isLeaf: false }, $unset: { defaultCharacteristicKeys: "" } },
    );

    if (parentUpdate.modifiedCount > 0 && leafParentProductIds.length > 0) {
      const moved = await ProductModel.updateMany(
        { _id: { $in: leafParentProductIds } },
        { $set: { productCategoryId: doc._id } },
      );
      movedProductCount = moved.modifiedCount;
      // Хлебные крошки, путь и поисковый блоб пересобираются от нового листа.
      await syncProductsDenormForCategorySubtree(parentId);
    }
  }

  successRes(
    res,
    { category: toCategoryAdminPayload(doc.toObject()), movedProductCount },
    201,
  );
}

/** PATCH /product/admin/categories/:categoryId */
export async function patchProductCategoryAdminController(req, res) {
  const categoryId = String(req.params.categoryId ?? "");
  const doc = await ProductCategoryModel.findById(categoryId);
  if (!doc) {
    return errorRes(res, 404, "Категория не найдена");
  }

  const nextLabelRu =
    req.body?.labelRu !== undefined ? normalizeLabelRu(req.body.labelRu) : doc.labelRu;
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

  const nextIsLeaf = doc.isLeaf === true;
  if (!nextIsLeaf) {
    doc.defaultCharacteristicKeys = [];
  } else if (req.body?.defaultCharacteristicKeys !== undefined) {
    doc.defaultCharacteristicKeys = normalizeProductCategoryDefaultCharacteristicKeys(
      req.body.defaultCharacteristicKeys,
    );
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
}

/** DELETE /product/admin/categories/:categoryId — cascade: узел + всё поддерево */
export async function deleteProductCategoryAdminController(req, res) {
  const categoryId = String(req.params.categoryId ?? "");
  const doc = await ProductCategoryModel.findById(categoryId).lean();
  if (!doc) {
    return errorRes(res, 404, "Категория не найдена");
  }

  const blocker = await getProductCategoryCascadeDeleteBlocker(doc);
  if (blocker) {
    return errorRes(res, 400, blocker.message);
  }

  const { deletedIds } = await deleteProductCategoryCascade(doc);

  successRes(res, { deletedId: categoryId, deletedIds });
}
