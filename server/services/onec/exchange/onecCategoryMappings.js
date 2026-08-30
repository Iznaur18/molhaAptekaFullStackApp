import {
  ONEC_CATEGORY_MAPPINGS_MAX_PER_REQUEST,
} from "../../../constants/onecExchangeConstants.js";
import { UNCATEGORIZED_PRODUCT_CATEGORY_SLUG } from "../../../constants/productCategoryTreeConstants.js";
import { AppError } from "../../../errors/AppError.js";
import {
  OneCCategoryMappingModel,
  ProductCategoryModel,
} from "../../../models/index.js";
import { resolveProductCategoryWriteFromId } from "../../product/resolveProductCategoryWrite.js";

/** Категория сайта не выбрана — товар не должен попасть в каталог. */
export const UNCATEGORIZED_CATEGORY_WRITE = Object.freeze({
  productCategoryId: null,
  categoryPathIds: [],
  categoryBreadcrumbRu: "",
  productCategory: UNCATEGORIZED_PRODUCT_CATEGORY_SLUG,
  categorySearchKeywords: [],
  categoryPathLabelRu: [],
});

/**
 * Записать/обновить дерево групп из `import.xml`.
 *
 * Существующие строки не трогаем в части `categoryId` — сопоставление делает
 * продавец, и перевыгрузка каталога не должна его сбрасывать.
 *
 * @param {string} sellerId
 * @param {import('./parseCommerceMlCatalog.js').OneCGroup[]} groups
 */
export async function saveOneCCategoryTree(sellerId, groups) {
  if (!Array.isArray(groups) || groups.length === 0) return { upserted: 0 };

  const now = new Date();
  const operations = groups.map((group) => ({
    updateOne: {
      filter: { sellerId, externalId: group.externalId },
      update: {
        $set: {
          name: group.name,
          parentExternalId: group.parentExternalId,
          pathNames: group.pathNames,
          depth: group.depth,
          lastSeenAt: now,
        },
        $setOnInsert: { sellerId, externalId: group.externalId, categoryId: null },
      },
      upsert: true,
    },
  }));

  await OneCCategoryMappingModel.bulkWrite(operations, { ordered: false });
  return { upserted: operations.length };
}

/**
 * Индекс «группа 1С → категория сайта» с наследованием от родителя.
 *
 * Продавцу незачем сопоставлять каждый лист своей номенклатуры: сопоставил
 * «Витамины» — всё, что лежит ниже, уезжает туда же, пока для подгруппы не
 * задано своё.
 *
 * @param {string} sellerId
 */
export async function createOneCCategoryResolver(sellerId) {
  const rows = await OneCCategoryMappingModel.find({ sellerId })
    .select("externalId parentExternalId categoryId")
    .lean();

  /** @type {Map<string, { parentExternalId: string | null; categoryId: unknown }>} */
  const index = new Map(
    rows.map((row) => [
      row.externalId,
      { parentExternalId: row.parentExternalId ?? null, categoryId: row.categoryId ?? null },
    ]),
  );

  /** @type {Map<string, unknown>} */
  const writeCache = new Map();

  /**
   * @param {string} groupId
   * @returns {string | null}
   */
  const resolveCategoryId = (groupId) => {
    let current = groupId;
    const guard = new Set();
    while (current && !guard.has(current)) {
      guard.add(current);
      const node = index.get(current);
      if (!node) return null;
      if (node.categoryId) return String(node.categoryId);
      current = node.parentExternalId ?? "";
    }
    return null;
  };

  return {
    /** Сколько групп продавец уже сопоставил — для сводки импорта. */
    mappedCount: rows.filter((row) => row.categoryId).length,
    totalCount: rows.length,
    resolveCategoryId,
    /**
     * @param {string[]} groupIds
     * @returns {Promise<{ categoryWrite: typeof UNCATEGORIZED_CATEGORY_WRITE; mapped: boolean }>}
     */
    async resolve(groupIds) {
      for (const groupId of groupIds ?? []) {
        const categoryId = resolveCategoryId(groupId);
        if (!categoryId) continue;

        if (!writeCache.has(categoryId)) {
          try {
            writeCache.set(
              categoryId,
              await resolveProductCategoryWriteFromId(categoryId),
            );
          } catch {
            // Категорию удалили из дерева после сопоставления — ведём себя как
            // с несопоставленной группой, а не роняем весь импорт.
            writeCache.set(categoryId, null);
          }
        }

        const write = writeCache.get(categoryId);
        if (write) return { categoryWrite: write, mapped: true };
      }

      return { categoryWrite: UNCATEGORIZED_CATEGORY_WRITE, mapped: false };
    },
  };
}

/**
 * @param {string} sellerId
 */
export async function listOneCCategoryMappings(sellerId) {
  const rows = await OneCCategoryMappingModel.find({ sellerId })
    .sort({ depth: 1, name: 1 })
    .lean();

  const categoryIds = [
    ...new Set(rows.map((row) => row.categoryId).filter(Boolean).map(String)),
  ];
  const categories = categoryIds.length
    ? await ProductCategoryModel.find({ _id: { $in: categoryIds } })
        .select("_id labelRu pathLabelRu")
        .lean()
    : [];
  const categoryById = new Map(categories.map((row) => [String(row._id), row]));

  return rows.map((row) => {
    const category = row.categoryId
      ? categoryById.get(String(row.categoryId))
      : null;
    return {
      externalId: row.externalId,
      name: row.name,
      parentExternalId: row.parentExternalId ?? null,
      pathNames: row.pathNames ?? [],
      depth: row.depth ?? 0,
      productCount: row.productCount ?? 0,
      categoryId: row.categoryId ? String(row.categoryId) : null,
      categoryLabel: category
        ? [...(category.pathLabelRu ?? []), category.labelRu]
            .filter(Boolean)
            .join(" › ")
        : "",
      lastSeenAt: row.lastSeenAt ?? null,
    };
  });
}

/**
 * Сохранить сопоставления и сразу перевесить уже импортированные карточки —
 * иначе продавец увидит эффект только после следующего обмена.
 *
 * @param {string} sellerId
 * @param {Array<{ externalId: unknown; categoryId: unknown }>} items
 */
export async function saveOneCCategoryMappings(sellerId, items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, "Нечего сохранять");
  }
  if (items.length > ONEC_CATEGORY_MAPPINGS_MAX_PER_REQUEST) {
    throw new AppError(
      400,
      `За один раз можно сохранить не более ${ONEC_CATEGORY_MAPPINGS_MAX_PER_REQUEST} сопоставлений`,
    );
  }

  /** @type {Array<{ externalId: string; categoryId: string | null }>} */
  const normalized = [];
  for (const item of items) {
    const externalId = String(item?.externalId ?? "").trim();
    if (!externalId) continue;
    const rawCategoryId = item?.categoryId;
    const categoryId =
      rawCategoryId == null || String(rawCategoryId).trim() === ""
        ? null
        : String(rawCategoryId).trim();
    normalized.push({ externalId, categoryId });
  }

  if (normalized.length === 0) {
    throw new AppError(400, "Нечего сохранять");
  }

  const requestedIds = [
    ...new Set(normalized.map((row) => row.categoryId).filter(Boolean)),
  ];
  if (requestedIds.length > 0) {
    const leaves = await ProductCategoryModel.find({
      _id: { $in: requestedIds },
      isLeaf: true,
    })
      .select("_id")
      .lean();
    const leafIds = new Set(leaves.map((row) => String(row._id)));
    for (const row of normalized) {
      if (row.categoryId && !leafIds.has(row.categoryId)) {
        throw new AppError(
          400,
          "Выберите конечную подкатегорию дерева — товары не попадут в промежуточный узел",
        );
      }
    }
  }

  const existing = await OneCCategoryMappingModel.find({
    sellerId,
    externalId: { $in: normalized.map((row) => row.externalId) },
  })
    .select("externalId")
    .lean();
  const known = new Set(existing.map((row) => row.externalId));
  const unknown = normalized.filter((row) => !known.has(row.externalId));
  if (unknown.length > 0) {
    throw new AppError(
      400,
      "Некоторые группы 1С не найдены — обновите список после ближайшего обмена",
    );
  }

  await OneCCategoryMappingModel.bulkWrite(
    normalized.map((row) => ({
      updateOne: {
        filter: { sellerId, externalId: row.externalId },
        update: { $set: { categoryId: row.categoryId } },
      },
    })),
    { ordered: false },
  );

  const remapped = await remapOneCProductsForSeller(sellerId);
  return { saved: normalized.length, remapped };
}

/**
 * Пересчитать категорию у уже импортированных карточек продавца.
 *
 * @param {string} sellerId
 * @returns {Promise<number>} сколько карточек изменили категорию
 */
export async function remapOneCProductsForSeller(sellerId) {
  const { ProductModel } = await import("../../../models/index.js");
  const resolver = await createOneCCategoryResolver(sellerId);

  const groups = await ProductModel.distinct("product1cGroupId", {
    productSeller: sellerId,
    productFromOneC: true,
    product1cGroupId: { $type: "string" },
  });

  let changed = 0;
  for (const groupId of groups) {
    const { categoryWrite } = await resolver.resolve([groupId]);
    const result = await ProductModel.updateMany(
      {
        productSeller: sellerId,
        productFromOneC: true,
        product1cGroupId: groupId,
        productCategoryId: { $ne: categoryWrite.productCategoryId },
      },
      {
        $set: {
          productCategory: categoryWrite.productCategory,
          productCategoryId: categoryWrite.productCategoryId,
          categoryPathIds: categoryWrite.categoryPathIds,
          categoryBreadcrumbRu: categoryWrite.categoryBreadcrumbRu,
        },
      },
    );
    changed += result.modifiedCount ?? 0;
  }

  return changed;
}
