import mongoose from "mongoose";
import {
  buildCuratedCategoryItemKey,
  formatCuratedCategoryRegionMismatchMessage,
  formatCuratedRegionLabel,
  formatUserBusinessHoursCompactRange,
  resolveViewerRegionCode,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";
import CuratedCategoryListModel from "../../models/CuratedCategoryListModel.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import ProductCategoryDisplayModel from "../../models/ProductCategoryDisplayModel.js";
import { SellerPersonalCategoryModel, UserModel } from "../../models/index.js";
import {
  filterCuratedListsForViewerRegion,
  normalizeCuratedProductListRegionCode,
  normalizeCuratedProductListTitle,
} from "./curatedProductListHelpers.js";

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedCategoryListModel.js').default>} list
 */
export const toCuratedCategoryListPayload = (list) => ({
  _id: String(list._id),
  title: String(list.title ?? ""),
  regionCode: normalizeCuratedProductListRegionCode(list.regionCode),
  items: Array.isArray(list.items)
    ? list.items.map((item) => ({
        kind: item.kind,
        refId: String(item.refId),
        itemKey: buildCuratedCategoryItemKey(item.kind, String(item.refId)),
      }))
    : [],
  sortOrder: Number(list.sortOrder) || 0,
  createdAt: list.createdAt ?? null,
  updatedAt: list.updatedAt ?? null,
});

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryDisplayModel.js').default>[]} displays
 */
const buildCategoryDisplayMaps = (displays) => {
  /** @type {Map<string, import('mongoose').LeanDocument<import('../models/ProductCategoryDisplayModel.js').default>>} */
  const byId = new Map();
  /** @type {Map<string, import('mongoose').LeanDocument<import('../models/ProductCategoryDisplayModel.js').default>>} */
  const bySlug = new Map();

  for (const row of displays) {
    if (row.categoryId) {
      byId.set(String(row.categoryId), row);
    }
    if (typeof row.categorySlug === "string" && row.categorySlug.trim()) {
      bySlug.set(row.categorySlug.trim(), row);
    }
  }

  return { byId, bySlug };
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default>} category
 * @param {Map<string, import('mongoose').LeanDocument<import('../models/ProductCategoryDisplayModel.js').default>>} displaysById
 * @param {Map<string, import('mongoose').LeanDocument<import('../models/ProductCategoryDisplayModel.js').default>>} displaysBySlug
 */
const resolveTreeCategoryFields = (category, displaysById, displaysBySlug) => {
  const categoryId = String(category._id);
  const legacySlug =
    typeof category.legacyProductCategory === "string" &&
    category.legacyProductCategory.trim()
      ? category.legacyProductCategory.trim()
      : null;
  const override =
    displaysById.get(categoryId) ??
    (legacySlug ? displaysBySlug.get(legacySlug) : undefined);
  const customLabel =
    typeof override?.customLabel === "string" && override.customLabel.trim()
      ? override.customLabel.trim()
      : null;
  const customImage =
    typeof override?.imageUrl === "string" && override.imageUrl.trim()
      ? override.imageUrl.trim()
      : null;

  return {
    kind: "tree",
    refId: categoryId,
    itemKey: buildCuratedCategoryItemKey("tree", categoryId),
    categorySlug: legacySlug ?? String(category.slug ?? ""),
    label:
      customLabel ||
      String(category.labelRu ?? "").trim() ||
      "Категория",
    imageUrl: customImage,
  };
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/SellerPersonalCategoryModel.js').SellerPersonalCategoryModel> | null | undefined} row
 * @param {string | null | undefined} listRegionCode
 * @param {{ requireActive?: boolean }} [options]
 */
const resolvePersonalCategoryFields = (row, listRegionCode, options = {}) => {
  if (!row) {
    return null;
  }

  const listRegion = normalizeCuratedProductListRegionCode(listRegionCode);
  const itemRegion = normalizeCuratedProductListRegionCode(row.regionCode);
  if (itemRegion !== listRegion) {
    return null;
  }

  const isActive = row.activeUntil != null && new Date(row.activeUntil) > new Date();
  if (options.requireActive !== false && !isActive) {
    return null;
  }

  const refId = String(row._id);
  return {
    kind: "personal",
    refId,
    itemKey: buildCuratedCategoryItemKey("personal", refId),
    label: String(row.labelRu ?? "").trim() || "Категория",
    imageUrl:
      typeof row.imageUrl === "string" && row.imageUrl.trim()
        ? row.imageUrl.trim()
        : null,
    sellerId: row.sellerId != null ? String(row.sellerId) : null,
  };
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedCategoryListModel.js').default>} list
 * @param {Map<string, import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default>>} categoriesById
 * @param {Map<string, import('mongoose').LeanDocument<import('../models/SellerPersonalCategoryModel.js').SellerPersonalCategoryModel>>} personalById
 * @param {Map<string, import('mongoose').LeanDocument<import('../models/ProductCategoryDisplayModel.js').default>>} displaysById
 * @param {Map<string, import('mongoose').LeanDocument<import('../models/ProductCategoryDisplayModel.js').default>>} displaysBySlug
 * @param {{ requireActivePersonal?: boolean }} [options]
 */
const resolveOrderedListCategoryItems = (
  list,
  categoriesById,
  personalById,
  displaysById,
  displaysBySlug,
  options = {},
) => {
  const storedItems = Array.isArray(list.items) ? list.items : [];
  const resolved = [];

  for (const item of storedItems) {
    const refId = String(item.refId ?? "");
    if (item.kind === "tree") {
      const category = categoriesById.get(refId);
      if (!category) {
        continue;
      }
      resolved.push(resolveTreeCategoryFields(category, displaysById, displaysBySlug));
      continue;
    }

    if (item.kind === "personal") {
      const fields = resolvePersonalCategoryFields(
        personalById.get(refId),
        list.regionCode,
        { requireActive: options.requireActivePersonal !== false },
      );
      if (fields) {
        resolved.push(fields);
      }
    }
  }

  return resolved;
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedCategoryListModel.js').default>[]} lists
 */
const collectCuratedCategoryRefIds = (lists) => {
  const treeIds = new Set();
  const personalIds = new Set();

  for (const list of lists) {
    for (const item of list.items ?? []) {
      const refId = String(item.refId ?? "");
      if (!mongoose.isValidObjectId(refId)) {
        continue;
      }
      if (item.kind === "tree") {
        treeIds.add(refId);
      } else if (item.kind === "personal") {
        personalIds.add(refId);
      }
    }
  }

  return {
    treeIds: [...treeIds],
    personalIds: [...personalIds],
  };
};

/**
 * @param {string[]} treeIds
 * @param {string[]} personalIds
 */
const fetchCuratedCategoryEntities = async (treeIds, personalIds) => {
  const [categories, personalRows, displays] = await Promise.all([
    treeIds.length
      ? ProductCategoryModel.find({ _id: { $in: treeIds } }).lean()
      : [],
    personalIds.length
      ? SellerPersonalCategoryModel.find({ _id: { $in: personalIds } }).lean()
      : [],
    ProductCategoryDisplayModel.find().lean(),
  ]);

  const categoriesById = new Map(categories.map((row) => [String(row._id), row]));
  const personalById = new Map(personalRows.map((row) => [String(row._id), row]));
  const { byId: displaysById, bySlug: displaysBySlug } = buildCategoryDisplayMaps(displays);

  return { categoriesById, personalById, displaysById, displaysBySlug };
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedCategoryListModel.js').default>} list
 */
export const autopurgeCuratedCategoryList = async (list) => {
  const storedItems = Array.isArray(list.items) ? list.items : [];
  if (storedItems.length === 0) {
    return list;
  }

  const { treeIds, personalIds } = collectCuratedCategoryRefIds([list]);
  const { categoriesById, personalById, displaysById, displaysBySlug } =
    await fetchCuratedCategoryEntities(treeIds, personalIds);
  const visibleItems = resolveOrderedListCategoryItems(
    list,
    categoriesById,
    personalById,
    displaysById,
    displaysBySlug,
  );

  if (visibleItems.length === storedItems.length) {
    return list;
  }

  const nextItems = visibleItems.map((item) => ({
    kind: item.kind,
    refId: new mongoose.Types.ObjectId(item.refId),
  }));

  await CuratedCategoryListModel.updateOne(
    { _id: list._id },
    { $set: { items: nextItems } },
  );

  return {
    ...list,
    items: nextItems,
  };
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedCategoryListModel.js').default>[]} lists
 */
export const autopurgeCuratedCategoryLists = async (lists) => {
  return Promise.all(lists.map((list) => autopurgeCuratedCategoryList(list)));
};

/**
 * @param {unknown} raw
 * @returns {{ average: number | null; votes: number }}
 */
const resolveSellerRatingParts = (raw) => {
  if (raw == null || typeof raw !== "object") {
    return { average: null, votes: 0 };
  }
  const votes = Number(raw.countVotes) || 0;
  const total = Number(raw.totalRating) || 0;
  if (votes <= 0) {
    return { average: null, votes: 0 };
  }
  return {
    average: Math.round((total / votes) * 10) / 10,
    votes,
  };
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/UserModel.js').default> | null | undefined} seller
 */
const toCuratedCategorySellerMeta = (seller) => {
  if (!seller) {
    return {
      sellerFullName: null,
      sellerRatingAverage: null,
      sellerRatingVotes: 0,
      sellerBusinessHoursLabel: null,
    };
  }

  const fullName = String(seller.userFullName ?? "").trim();
  const rating = resolveSellerRatingParts(seller.userRatingByVotes);
  const hoursLabel = formatUserBusinessHoursCompactRange(seller);

  return {
    sellerFullName: fullName || null,
    sellerRatingAverage: rating.average,
    sellerRatingVotes: rating.votes,
    sellerBusinessHoursLabel: hoursLabel,
  };
};

/**
 * Подмешивает имя/рейтинг/график продавца в личные категории home-ленты.
 *
 * @param {Array<Record<string, any>>} lists
 */
const attachSellerMetaToHomeCuratedCategories = async (lists) => {
  const sellerIds = new Set();
  for (const list of lists) {
    for (const category of list.categories ?? []) {
      if (category?.kind === "personal" && category.sellerId) {
        sellerIds.add(String(category.sellerId));
      }
    }
  }

  if (sellerIds.size === 0) {
    return lists;
  }

  const sellers = await UserModel.find({ _id: { $in: [...sellerIds] } })
    .select(
      "userFullName userRatingByVotes userBusinessHoursEnabled userBusinessHours",
    )
    .lean();
  const sellerById = new Map(sellers.map((row) => [String(row._id), row]));

  return lists.map((list) => ({
    ...list,
    categories: (list.categories ?? []).map((category) => {
      if (category?.kind !== "personal") {
        return category;
      }
      return {
        ...category,
        ...toCuratedCategorySellerMeta(
          sellerById.get(String(category.sellerId ?? "")),
        ),
      };
    }),
  }));
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedCategoryListModel.js').default>[]} lists
 * @param {{ viewerRegionCode?: string | null }} [options]
 */
export const buildHomeCuratedCategoryListsResponse = async (lists, options = {}) => {
  const regionLists = filterCuratedListsForViewerRegion(
    lists,
    options.viewerRegionCode,
  );
  const purgedLists = await autopurgeCuratedCategoryLists(regionLists);
  const { treeIds, personalIds } = collectCuratedCategoryRefIds(purgedLists);
  const { categoriesById, personalById, displaysById, displaysBySlug } =
    await fetchCuratedCategoryEntities(treeIds, personalIds);

  const payload = purgedLists
    .map((list) => {
      const categories = resolveOrderedListCategoryItems(
        list,
        categoriesById,
        personalById,
        displaysById,
        displaysBySlug,
      );
      return {
        ...toCuratedCategoryListPayload(list),
        categories,
      };
    })
    .filter((list) => list.categories.length > 0);

  return attachSellerMetaToHomeCuratedCategories(payload);
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedCategoryListModel.js').default>[]} lists
 */
export const buildAdminCuratedCategoryListsResponse = async (lists) => {
  const purgedLists = await autopurgeCuratedCategoryLists(lists);
  return purgedLists.map((list) => toCuratedCategoryListPayload(list));
};

/**
 * @param {"tree" | "personal"} kind
 * @param {string} refId
 * @param {string | null | undefined} listRegionCode
 */
export const assertCuratedCategoryListItemAddable = async (
  kind,
  refId,
  listRegionCode,
) => {
  if (!mongoose.isValidObjectId(refId)) {
    throw new AppError(400, "Некорректный refId");
  }

  if (kind === "tree") {
    const category = await ProductCategoryModel.findById(refId).lean();
    if (!category) {
      throw new AppError(404, "Категория не найдена");
    }
    return category;
  }

  if (kind === "personal") {
    const row = await SellerPersonalCategoryModel.findById(refId).lean();
    if (!row) {
      throw new AppError(404, "Личная категория не найдена");
    }

    const listRegion = normalizeCuratedProductListRegionCode(listRegionCode);
    const itemRegion = normalizeCuratedProductListRegionCode(row.regionCode);
    if (itemRegion !== listRegion) {
      throw new AppError(
        400,
        formatCuratedCategoryRegionMismatchMessage(itemRegion, listRegion),
      );
    }

    const isActive = row.activeUntil != null && new Date(row.activeUntil) > new Date();
    if (!isActive) {
      throw new AppError(400, "Личная категория неактивна");
    }

    return row;
  }

  throw new AppError(400, "Некорректный kind");
};

/**
 * @param {"tree" | "personal"} kind
 * @param {string} refId
 */
export const buildCuratedCategoryListItemPreview = async (kind, refId) => {
  if (!mongoose.isValidObjectId(refId)) {
    throw new AppError(400, "Некорректный refId");
  }

  if (kind === "tree") {
    const category = await ProductCategoryModel.findById(refId).lean();
    if (!category) {
      throw new AppError(404, "Категория не найдена");
    }

    const displays = await ProductCategoryDisplayModel.find().lean();
    const { byId, bySlug } = buildCategoryDisplayMaps(displays);
    const fields = resolveTreeCategoryFields(category, byId, bySlug);

    return {
      kind,
      refId,
      label: fields.label,
      imageUrl: fields.imageUrl,
      categorySlug: fields.categorySlug,
      regionCode: null,
      regionLabel: null,
      catalogVisible: true,
    };
  }

  if (kind === "personal") {
    const row = await SellerPersonalCategoryModel.findById(refId).lean();
    if (!row) {
      throw new AppError(404, "Личная категория не найдена");
    }

    const regionCode = normalizeCuratedProductListRegionCode(row.regionCode);
    const isActive = row.activeUntil != null && new Date(row.activeUntil) > new Date();

    return {
      kind,
      refId,
      label: String(row.labelRu ?? "").trim() || "Категория",
      imageUrl:
        typeof row.imageUrl === "string" && row.imageUrl.trim()
          ? row.imageUrl.trim()
          : null,
      categorySlug: null,
      regionCode,
      regionLabel: formatCuratedRegionLabel(regionCode),
      catalogVisible: isActive,
    };
  }

  throw new AppError(400, "Некорректный kind");
};

/**
 * @param {string[]} orderedListIds
 */
export const reorderCuratedCategoryLists = async (orderedListIds) => {
  const uniqueIds = [...new Set(orderedListIds.map((id) => String(id)))];
  const totalCount = await CuratedCategoryListModel.countDocuments();
  const lists = await CuratedCategoryListModel.find({ _id: { $in: uniqueIds } })
    .select("_id")
    .lean();

  if (lists.length !== uniqueIds.length) {
    throw new AppError(400, "Один или несколько списков не найдены");
  }

  if (uniqueIds.length !== totalCount) {
    throw new AppError(400, "Укажите полный порядок всех списков");
  }

  await Promise.all(
    uniqueIds.map((listId, index) =>
      CuratedCategoryListModel.updateOne(
        { _id: listId },
        { $set: { sortOrder: index } },
      ),
    ),
  );
};

export {
  normalizeCuratedProductListRegionCode as normalizeCuratedCategoryListRegionCode,
  normalizeCuratedProductListTitle as normalizeCuratedCategoryListTitle,
};
