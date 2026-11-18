import mongoose from "mongoose";
import {
  normalizeCategoryDealType,
  normalizeCategoryOwnDealType,
} from "@molha/api-contract";

import { PRODUCT_CATEGORY_VALUES } from "../../constants/productConstants.js";
import {
  PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH,
  PRODUCT_CATEGORY_SLUG_MAX_LENGTH,
} from "../../constants/productCategoryTreeConstants.js";
import ProductCategoryDisplayModel from "../../models/ProductCategoryDisplayModel.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import ProductModel from "../../models/ProductModel.js";
import { AppError } from "../../errors/AppError.js";
import { ensureProductCategoryDisplayForSlug } from "./ensureProductCategoryDisplayForSlug.js";
import { computeProductCategoryNodePaths } from "./computeProductCategoryNodePaths.js";
import { normalizeProductCategorySearchKeywords } from "./normalizeProductCategorySearchKeywords.js";
import { normalizeProductCategoryDefaultCharacteristicKeys } from "./normalizeProductCategoryDefaultCharacteristicKeys.js";
import {
  rebuildCategoryDealTypeSubtree,
  resolveCategoryEffectiveDealType,
} from "./categoryDealType.js";
import { rebuildProductCategorySubtreePaths } from "./rebuildProductCategorySubtreePaths.js";
import { syncProductsDenormForCategorySubtree } from "./syncProductsDenormForCategorySubtree.js";
import {
  deleteProductCategoryCascade,
  getProductCategoryCascadeDeleteBlocker,
} from "./productCategoryDeleteHelpers.js";

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
  // Свой выбор узла (`null` — наследует) и то, что получилось в итоге.
  dealType: normalizeCategoryOwnDealType(row.dealType),
  effectiveDealType: normalizeCategoryDealType(row.effectiveDealType),
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
export async function listProductCategoriesAdmin() {
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

  return {
    categories: rows.map((row) =>
      toCategoryAdminPayload(row, resolveStorefrontLabel(row, labelBySlug, labelById)),
    ),
  };
}

/** POST /product/admin/categories */
export async function createProductCategoryAdmin(body = {}) {
  const slug = normalizeSlug(body?.slug);
  const labelRu = normalizeLabelRu(body?.labelRu);
  const parentId = body?.parentId
    ? new mongoose.Types.ObjectId(String(body.parentId))
    : null;
  const isRoot = !parentId;
  const sortOrder = Number(body?.sortOrder) || 0;
  const searchKeywords = normalizeProductCategorySearchKeywords(
    body?.searchKeywords ?? [],
  );
  const isLeaf = isRoot ? false : body?.isLeaf === true;
  const defaultCharacteristicKeys =
    isLeaf && body?.defaultCharacteristicKeys !== undefined
      ? normalizeProductCategoryDefaultCharacteristicKeys(
          body.defaultCharacteristicKeys,
        )
      : [];

  let legacyProductCategory = null;
  if (body?.legacyProductCategory != null) {
    const legacy = String(body.legacyProductCategory).trim();
    if (legacy) {
      legacyProductCategory = legacy;
    }
  } else if (isRoot) {
    legacyProductCategory = slug;
  }

  const duplicateSlug = await ProductCategoryModel.findOne({ slug }).lean();
  if (duplicateSlug) {
    throw new AppError(409, "Категория с таким slug уже есть");
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
      throw new AppError(400, "Родитель не найден");
    }
    if (parent.isLeaf === true) {
      leafParentProductIds = await ProductModel.find({ productCategoryId: parent._id })
        .distinct("_id")
        .lean();

      if (leafParentProductIds.length > 0 && !isLeaf) {
        throw new AppError(
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

  const dealType = normalizeCategoryOwnDealType(body?.dealType);
  const effectiveDealType = await resolveCategoryEffectiveDealType({
    ownDealType: dealType,
    parentId,
  });

  const doc = await ProductCategoryModel.create({
    slug,
    labelRu,
    dealType,
    effectiveDealType,
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

  return {
    category: toCategoryAdminPayload(doc.toObject()),
    movedProductCount,
    statusCode: 201,
  };
}

/** PATCH /product/admin/categories/:categoryId */
export async function patchProductCategoryAdmin({ categoryId, body = {} }) {
  const id = String(categoryId ?? "");
  const doc = await ProductCategoryModel.findById(id);
  if (!doc) {
    throw new AppError(404, "Категория не найдена");
  }

  const nextLabelRu =
    body?.labelRu !== undefined ? normalizeLabelRu(body.labelRu) : doc.labelRu;
  const nextParentId =
    body?.parentId !== undefined
      ? body.parentId
        ? new mongoose.Types.ObjectId(String(body.parentId))
        : null
      : doc.parentId;
  const nextSlug = body?.slug !== undefined ? normalizeSlug(body.slug) : doc.slug;

  if (body?.slug !== undefined && nextSlug !== doc.slug) {
    const duplicateSlug = await ProductCategoryModel.findOne({
      slug: nextSlug,
      _id: { $ne: doc._id },
    }).lean();
    if (duplicateSlug) {
      throw new AppError(409, "Категория с таким slug уже есть");
    }
  }

  if (body?.parentId !== undefined) {
    await assertNoCategoryCycle(doc._id, nextParentId);
    if (nextParentId) {
      const parent = await ProductCategoryModel.findById(nextParentId).lean();
      if (!parent) {
        throw new AppError(400, "Родитель не найден");
      }
      if (parent.isLeaf === true) {
        throw new AppError(400, "Нельзя переместить под лист");
      }
    }
  }

  if (body?.isLeaf === true) {
    const childCount = await ProductCategoryModel.countDocuments({
      parentId: doc._id,
    });
    if (childCount > 0) {
      throw new AppError(400, "Нельзя сделать листом: есть дочерние категории");
    }
  }

  if (body?.isLeaf === false && doc.isLeaf === true) {
    const productCount = await ProductModel.countDocuments({
      productCategoryId: doc._id,
    });
    if (productCount > 0) {
      throw new AppError(400, "Нельзя снять лист: к категории привязаны товары");
    }
  }

  const structureChanged =
    body?.parentId !== undefined ||
    body?.slug !== undefined ||
    body?.labelRu !== undefined;

  doc.labelRu = nextLabelRu;
  doc.slug = nextSlug;
  doc.parentId = nextParentId;

  if (body?.isLeaf !== undefined) {
    doc.isLeaf = body.isLeaf === true;
  }
  if (body?.sortOrder !== undefined) {
    doc.sortOrder = Number(body.sortOrder) || 0;
  }
  if (body?.searchKeywords !== undefined) {
    doc.searchKeywords = normalizeProductCategorySearchKeywords(body.searchKeywords);
  }
  if (body?.legacyProductCategory !== undefined) {
    const legacy = String(body.legacyProductCategory ?? "").trim();
    if (legacy && PRODUCT_CATEGORY_VALUES.includes(legacy)) {
      doc.legacyProductCategory = legacy;
    } else {
      doc.set("legacyProductCategory", undefined);
    }
  }

  const nextIsLeaf = doc.isLeaf === true;
  if (!nextIsLeaf) {
    doc.defaultCharacteristicKeys = [];
  } else if (body?.defaultCharacteristicKeys !== undefined) {
    doc.defaultCharacteristicKeys = normalizeProductCategoryDefaultCharacteristicKeys(
      body.defaultCharacteristicKeys,
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

  if (body?.dealType !== undefined) {
    doc.dealType = normalizeCategoryOwnDealType(body.dealType);
  }
  // Пересчёт и при переносе: под другим родителем наследуется другой тип.
  const previousEffectiveDealType = normalizeCategoryDealType(doc.effectiveDealType);
  doc.effectiveDealType = await resolveCategoryEffectiveDealType({
    ownDealType: doc.dealType,
    parentId: doc.parentId,
  });
  const dealTypeChanged = doc.effectiveDealType !== previousEffectiveDealType;

  await doc.save();

  if (structureChanged) {
    await rebuildProductCategorySubtreePaths(doc._id);
  }
  if (dealTypeChanged) {
    await rebuildCategoryDealTypeSubtree(doc._id);
  }
  if (structureChanged || dealTypeChanged) {
    await syncProductsDenormForCategorySubtree(doc._id);
  }

  return { category: toCategoryAdminPayload(doc.toObject()) };
}

/** DELETE /product/admin/categories/:categoryId — cascade: узел + всё поддерево */
export async function deleteProductCategoryAdmin({ categoryId }) {
  const id = String(categoryId ?? "");
  const doc = await ProductCategoryModel.findById(id).lean();
  if (!doc) {
    throw new AppError(404, "Категория не найдена");
  }

  const blocker = await getProductCategoryCascadeDeleteBlocker(doc);
  if (blocker) {
    throw new AppError(400, blocker.message);
  }

  const { deletedIds } = await deleteProductCategoryCascade(doc);

  return { deletedId: id, deletedIds };
}
