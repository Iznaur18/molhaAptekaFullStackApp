import { CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH } from "../../constants/curatedProductListConstants.js";
import CuratedProductListModel from "../../models/CuratedProductListModel.js";
import { AppError } from "../../errors/AppError.js";
import { getHiddenSellerIds } from "../access/adminUserGuard.js";
import {
  assertCuratedListProductMatchesRegion,
  buildAdminCuratedListsResponse,
  buildCuratedListProductPreview,
  buildHomeCuratedListsResponse,
  normalizeCuratedProductListRegionCode,
  normalizeCuratedProductListTitle,
  reorderCuratedProductLists,
  toCuratedProductListPayload,
} from "./curatedProductListHelpers.js";
import { getClosedSellerIdsNow } from "./getClosedSellerIdsNow.js";
import { resolveViewerRegionCodeForRequest } from "../user/userRegionCatalogFilter.js";

const sortCuratedLists = { sortOrder: 1, createdAt: 1 };

export async function listHomeCuratedProductLists({ userId, queryRegionCode }) {
  const [hiddenSellerIds, closedSellerIds, viewerRegionCode] = await Promise.all([
    getHiddenSellerIds(),
    getClosedSellerIdsNow({ excludeUserId: userId ?? null }),
    resolveViewerRegionCodeForRequest({
      userId,
      queryRegionCode,
    }),
  ]);

  const lists = await CuratedProductListModel.find({ regionCode: viewerRegionCode })
    .sort(sortCuratedLists)
    .lean();
  const curatedLists = await buildHomeCuratedListsResponse(lists, hiddenSellerIds, {
    viewerRegionCode,
    closedSellerIds,
  });
  return { lists: curatedLists };
}

export async function listAdminCuratedProductLists() {
  const hiddenSellerIds = await getHiddenSellerIds();
  const lists = await CuratedProductListModel.find().sort(sortCuratedLists).lean();
  const curatedLists = await buildAdminCuratedListsResponse(lists, hiddenSellerIds);
  return { lists: curatedLists };
}

export async function previewCuratedListProduct({ productId }) {
  const preview = await buildCuratedListProductPreview(String(productId ?? "").trim());
  return { preview };
}

export async function createCuratedProductList({ title, regionCode, userId }) {
  const normalizedTitle = normalizeCuratedProductListTitle(title);
  if (normalizedTitle.length > CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH) {
    throw new AppError(400, "Слишком длинный заголовок");
  }

  const normalizedRegion = normalizeCuratedProductListRegionCode(regionCode);
  const maxSortOrder = await CuratedProductListModel.findOne()
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean();
  const sortOrder = Number(maxSortOrder?.sortOrder ?? -1) + 1;

  const doc = await CuratedProductListModel.create({
    title: normalizedTitle,
    regionCode: normalizedRegion,
    sortOrder,
    updatedBy: userId ?? null,
  });

  return { list: toCuratedProductListPayload(doc.toObject()), statusCode: 201 };
}

export async function reorderAdminCuratedProductLists({ orderedListIds }) {
  const ids = Array.isArray(orderedListIds)
    ? orderedListIds.map((id) => String(id))
    : [];
  if (!ids.length) {
    throw new AppError(400, "Укажите orderedListIds");
  }

  await reorderCuratedProductLists(ids);
  return listAdminCuratedProductLists();
}

export async function patchCuratedProductList({ listId, title, regionCode, userId }) {
  const doc = await CuratedProductListModel.findById(String(listId ?? ""));
  if (!doc) {
    throw new AppError(404, "Список не найден");
  }

  if (title !== undefined) {
    const normalizedTitle = normalizeCuratedProductListTitle(title);
    if (normalizedTitle.length > CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH) {
      throw new AppError(400, "Слишком длинный заголовок");
    }
    doc.title = normalizedTitle;
  }

  if (regionCode !== undefined) {
    doc.regionCode = normalizeCuratedProductListRegionCode(regionCode);
  }

  doc.updatedBy = userId ?? null;
  await doc.save();
  return { list: toCuratedProductListPayload(doc.toObject()) };
}

export async function deleteCuratedProductList({ listId }) {
  const id = String(listId ?? "");
  const deleted = await CuratedProductListModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(404, "Список не найден");
  }
  return { deletedId: id };
}

export async function addCuratedProductListItem({ listId, productId, userId }) {
  const id = String(listId ?? "");
  const nextProductId = String(productId ?? "").trim();
  const doc = await CuratedProductListModel.findById(id);
  if (!doc) {
    throw new AppError(404, "Список не найден");
  }

  await assertCuratedListProductMatchesRegion(nextProductId, doc.regionCode);

  const existingIds = (doc.productIds ?? []).map((item) => String(item));
  if (existingIds.includes(nextProductId)) {
    throw new AppError(409, "Товар уже есть в этом списке");
  }

  doc.productIds = [...existingIds, nextProductId];
  doc.updatedBy = userId ?? null;
  await doc.save();

  return { list: toCuratedProductListPayload(doc.toObject()) };
}

export async function removeCuratedProductListItem({ listId, productId, userId }) {
  const id = String(listId ?? "");
  const nextProductId = String(productId ?? "").trim();
  const doc = await CuratedProductListModel.findById(id);
  if (!doc) {
    throw new AppError(404, "Список не найден");
  }

  const nextIds = (doc.productIds ?? [])
    .map((item) => String(item))
    .filter((item) => item !== nextProductId);

  if (nextIds.length === (doc.productIds ?? []).length) {
    throw new AppError(404, "Товар не найден в списке");
  }

  doc.productIds = nextIds;
  doc.updatedBy = userId ?? null;
  await doc.save();

  return { list: toCuratedProductListPayload(doc.toObject()) };
}
