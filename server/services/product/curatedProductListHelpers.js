import mongoose from "mongoose";
import {
  formatCuratedProductRegionMismatchMessage,
  formatCuratedRegionLabel,
  resolveViewerRegionCode,
} from "@molha/api-contract";

import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { AppError } from "../../errors/AppError.js";
import CuratedProductListModel from "../../models/CuratedProductListModel.js";
import { ProductModel } from "../../models/index.js";
import { getHiddenSellerIds } from "../access/adminUserGuard.js";
import { attachProductSellerSnapshots } from "./attachProductSellerSnapshots.js";
import { enrichProductApiFields } from "./productDiscount.js";
import { buildProductRegionMatch } from "../user/userRegionCatalogFilter.js";
import { isProductCatalogStockVisible } from "./productStock.js";

/**
 * @param {string[]} hiddenSellerIds
 */
export const buildCatalogVisibleProductFilter = (hiddenSellerIds) => {
  const filter = {
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
    $or: [{ productOutOfStock: true }, { productStockQuantity: { $gt: 0 } }],
  };

  if (hiddenSellerIds.length > 0) {
    filter.productSeller = { $nin: hiddenSellerIds };
  }

  return filter;
};

/**
 * @param {string[]} hiddenSellerIds
 * @param {string | null | undefined} viewerRegionCode
 */
const buildCatalogVisibleProductQuery = (hiddenSellerIds, viewerRegionCode = null) => {
  const filter = buildCatalogVisibleProductFilter(hiddenSellerIds);
  if (!viewerRegionCode) {
    return filter;
  }

  return {
    $and: [filter, buildProductRegionMatch(viewerRegionCode)],
  };
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductModel.js').default> | null | undefined} product
 * @param {string[]} hiddenSellerIds
 */
export const isProductCatalogVisible = (product, hiddenSellerIds) => {
  if (!product) {
    return false;
  }

  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    return false;
  }

  if (product.productIsAvailable === false) {
    return false;
  }

  if (!isProductCatalogStockVisible(product)) {
    return false;
  }

  const sellerId = String(product.productSeller?._id ?? product.productSeller ?? "");
  if (hiddenSellerIds.some((id) => String(id) === sellerId)) {
    return false;
  }

  return true;
};

/**
 * @param {string} rawTitle
 */
export const normalizeCuratedProductListTitle = (rawTitle) => {
  const title = String(rawTitle ?? "").trim();
  if (!title) {
    throw new AppError(400, "Укажите заголовок списка");
  }
  return title;
};

/**
 * @param {string | null | undefined} rawRegionCode
 */
export const normalizeCuratedProductListRegionCode = (rawRegionCode) => {
  return resolveViewerRegionCode(rawRegionCode);
};

/**
 * Подборки только для региона зрителя.
 *
 * @param {import('mongoose').LeanDocument<import('../models/CuratedProductListModel.js').default>[]} lists
 * @param {string | null | undefined} viewerRegionCode
 */
export const filterCuratedListsForViewerRegion = (lists, viewerRegionCode) => {
  const code = resolveViewerRegionCode(viewerRegionCode);
  return lists.filter((list) => resolveViewerRegionCode(list.regionCode) === code);
};

/**
 * @param {string[]} productIds
 * @param {string[]} hiddenSellerIds
 * @param {{ viewerRegionCode?: string | null }} [options]
 */
const fetchCatalogVisibleProductsByIds = async (
  productIds,
  hiddenSellerIds,
  options = {},
) => {
  const normalizedIds = productIds
    .map((id) => String(id))
    .filter((id) => mongoose.isValidObjectId(id));

  if (normalizedIds.length === 0) {
    return new Map();
  }

  const rows = await ProductModel.find({
    _id: { $in: normalizedIds },
    ...buildCatalogVisibleProductQuery(hiddenSellerIds, options.viewerRegionCode),
  }).lean();

  const enrichedRows = await attachProductSellerSnapshots(rows);
  const productsById = new Map();

  for (const row of enrichedRows) {
    productsById.set(String(row._id), enrichProductApiFields(row));
  }

  return productsById;
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedProductListModel.js').default>} list
 * @param {string[]} hiddenSellerIds
 */
export const autopurgeCuratedProductList = async (list, hiddenSellerIds) => {
  const storedIds = (list.productIds ?? []).map((id) => String(id));
  if (storedIds.length === 0) {
    return list;
  }

  const visibleProductsById = await fetchCatalogVisibleProductsByIds(
    storedIds,
    hiddenSellerIds,
  );
  const nextIds = storedIds.filter((id) => visibleProductsById.has(id));

  if (nextIds.length === storedIds.length) {
    return list;
  }

  await CuratedProductListModel.updateOne(
    { _id: list._id },
    { $set: { productIds: nextIds } },
  );

  return {
    ...list,
    productIds: nextIds.map((id) => new mongoose.Types.ObjectId(id)),
  };
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedProductListModel.js').default>[]} lists
 * @param {string[]} hiddenSellerIds
 */
export const autopurgeCuratedProductLists = async (lists, hiddenSellerIds) => {
  return Promise.all(
    lists.map((list) => autopurgeCuratedProductList(list, hiddenSellerIds)),
  );
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedProductListModel.js').default>} list
 * @param {Map<string, import('../models/ProductModel.js').default>} productsById
 */
const resolveOrderedListProducts = (list, productsById) => {
  const orderedIds = (list.productIds ?? []).map((id) => String(id));
  return orderedIds
    .map((id) => productsById.get(id))
    .filter((product) => product != null);
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedProductListModel.js').default>[]} lists
 * @param {string[]} hiddenSellerIds
 * @param {{ viewerRegionCode?: string | null }} [options]
 */
export const buildHomeCuratedListsResponse = async (
  lists,
  hiddenSellerIds,
  options = {},
) => {
  const regionLists = filterCuratedListsForViewerRegion(
    lists,
    options.viewerRegionCode,
  );
  const purgedLists = await autopurgeCuratedProductLists(regionLists, hiddenSellerIds);
  const allProductIds = [
    ...new Set(
      purgedLists.flatMap((list) => (list.productIds ?? []).map((id) => String(id))),
    ),
  ];
  const productsById = await fetchCatalogVisibleProductsByIds(
    allProductIds,
    hiddenSellerIds,
    options,
  );

  return purgedLists
    .map((list) => {
      const products = resolveOrderedListProducts(list, productsById);
      return {
        ...toCuratedProductListPayload(list),
        products,
      };
    })
    .filter((list) => list.products.length > 0);
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedProductListModel.js').default>[]} lists
 * @param {string[]} hiddenSellerIds
 */
export const buildAdminCuratedListsResponse = async (lists, hiddenSellerIds) => {
  const purgedLists = await autopurgeCuratedProductLists(lists, hiddenSellerIds);
  return purgedLists.map((list) => toCuratedProductListPayload(list));
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/CuratedProductListModel.js').default>} list
 */
export const toCuratedProductListPayload = (list) => ({
  _id: String(list._id),
  title: String(list.title ?? ""),
  regionCode: normalizeCuratedProductListRegionCode(list.regionCode),
  productIds: Array.isArray(list.productIds)
    ? list.productIds.map((id) => String(id))
    : [],
  sortOrder: Number(list.sortOrder) || 0,
  createdAt: list.createdAt ?? null,
  updatedAt: list.updatedAt ?? null,
});

/**
 * @param {string} productId
 */
export const assertCuratedListProductCatalogVisible = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError(400, "Некорректный productId");
  }

  const hiddenSellerIds = await getHiddenSellerIds();
  const product = await ProductModel.findById(productId).lean();
  if (!product) {
    throw new AppError(404, "Товар не найден");
  }

  if (!isProductCatalogVisible(product, hiddenSellerIds)) {
    throw new AppError(400, "Товар недоступен в каталоге");
  }

  return product;
};

/**
 * @param {string} productId
 * @param {string | null | undefined} listRegionCode
 */
export const assertCuratedListProductMatchesRegion = async (
  productId,
  listRegionCode,
) => {
  const product = await assertCuratedListProductCatalogVisible(productId);
  const listRegion = normalizeCuratedProductListRegionCode(listRegionCode);
  const productRegion = normalizeCuratedProductListRegionCode(
    product.productRegionCode,
  );
  if (productRegion !== listRegion) {
    throw new AppError(
      400,
      formatCuratedProductRegionMismatchMessage(productRegion, listRegion),
    );
  }
  return product;
};

/**
 * Превью товара для админки популярных (без обязательной catalog-visible).
 *
 * @param {string} productId
 */
export const buildCuratedListProductPreview = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError(400, "Некорректный productId");
  }

  const product = await ProductModel.findById(productId)
    .select("productName productRegionCode productModerationStatus productIsAvailable productStockQuantity productSeller")
    .lean();
  if (!product) {
    throw new AppError(404, "Товар не найден");
  }

  const hiddenSellerIds = await getHiddenSellerIds();
  const catalogVisible = isProductCatalogVisible(product, hiddenSellerIds);
  const productRegionCode = normalizeCuratedProductListRegionCode(
    product.productRegionCode,
  );

  return {
    productId: String(product._id),
    productName: String(product.productName ?? "").trim() || "Без названия",
    productRegionCode,
    regionLabel: formatCuratedRegionLabel(productRegionCode),
    catalogVisible,
  };
};

/**
 * @param {string[]} orderedListIds
 */
export const reorderCuratedProductLists = async (orderedListIds) => {
  const uniqueIds = [...new Set(orderedListIds.map((id) => String(id)))];
  const totalCount = await CuratedProductListModel.countDocuments();
  const lists = await CuratedProductListModel.find({ _id: { $in: uniqueIds } })
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
      CuratedProductListModel.updateOne(
        { _id: listId },
        { $set: { sortOrder: index } },
      ),
    ),
  );
};
