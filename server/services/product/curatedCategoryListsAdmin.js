import { buildCuratedCategoryItemKey } from "@molha/api-contract";

import { CURATED_CATEGORY_LIST_TITLE_MAX_LENGTH } from "../../constants/curatedCategoryListConstants.js";
import CuratedCategoryListModel from "../../models/CuratedCategoryListModel.js";
import { AppError } from "../../errors/AppError.js";
import {
  assertCuratedCategoryListItemAddable,
  buildAdminCuratedCategoryListsResponse,
  buildCuratedCategoryListItemPreview,
  buildHomeCuratedCategoryListsResponse,
  normalizeCuratedCategoryListRegionCode,
  normalizeCuratedCategoryListTitle,
  reorderCuratedCategoryLists,
  toCuratedCategoryListPayload,
} from "./curatedCategoryListHelpers.js";
import { resolveViewerRegionCodeForRequest } from "../user/userRegionCatalogFilter.js";

const sortCuratedLists = { sortOrder: 1, createdAt: 1 };

export async function listHomeCuratedCategoryLists({ userId, queryRegionCode }) {
  const viewerRegionCode = await resolveViewerRegionCodeForRequest({
    userId,
    queryRegionCode,
  });

  const lists = await CuratedCategoryListModel.find({ regionCode: viewerRegionCode })
    .sort(sortCuratedLists)
    .lean();
  const curatedLists = await buildHomeCuratedCategoryListsResponse(lists, {
    viewerRegionCode,
  });
  return { lists: curatedLists };
}

export async function listAdminCuratedCategoryLists() {
  const lists = await CuratedCategoryListModel.find().sort(sortCuratedLists).lean();
  const curatedLists = await buildAdminCuratedCategoryListsResponse(lists);
  return { lists: curatedLists };
}

export async function previewCuratedCategoryListItem({ kind, refId }) {
  const preview = await buildCuratedCategoryListItemPreview(
    String(kind ?? "").trim(),
    String(refId ?? "").trim(),
  );
  return { preview };
}

export async function createCuratedCategoryList({ title, regionCode, userId }) {
  const normalizedTitle = normalizeCuratedCategoryListTitle(title);
  if (normalizedTitle.length > CURATED_CATEGORY_LIST_TITLE_MAX_LENGTH) {
    throw new AppError(400, "Слишком длинный заголовок");
  }

  const normalizedRegion = normalizeCuratedCategoryListRegionCode(regionCode);
  const maxSortOrder = await CuratedCategoryListModel.findOne()
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean();
  const sortOrder = Number(maxSortOrder?.sortOrder ?? -1) + 1;

  const doc = await CuratedCategoryListModel.create({
    title: normalizedTitle,
    regionCode: normalizedRegion,
    sortOrder,
    updatedBy: userId ?? null,
  });

  return { list: toCuratedCategoryListPayload(doc.toObject()), statusCode: 201 };
}

export async function reorderAdminCuratedCategoryLists({ orderedListIds }) {
  const ids = Array.isArray(orderedListIds)
    ? orderedListIds.map((id) => String(id))
    : [];
  if (!ids.length) {
    throw new AppError(400, "Укажите orderedListIds");
  }

  await reorderCuratedCategoryLists(ids);
  return listAdminCuratedCategoryLists();
}

export async function patchCuratedCategoryList({ listId, title, regionCode, userId }) {
  const doc = await CuratedCategoryListModel.findById(String(listId ?? ""));
  if (!doc) {
    throw new AppError(404, "Список не найден");
  }

  if (title !== undefined) {
    const normalizedTitle = normalizeCuratedCategoryListTitle(title);
    if (normalizedTitle.length > CURATED_CATEGORY_LIST_TITLE_MAX_LENGTH) {
      throw new AppError(400, "Слишком длинный заголовок");
    }
    doc.title = normalizedTitle;
  }

  if (regionCode !== undefined) {
    doc.regionCode = normalizeCuratedCategoryListRegionCode(regionCode);
  }

  doc.updatedBy = userId ?? null;
  await doc.save();
  return { list: toCuratedCategoryListPayload(doc.toObject()) };
}

export async function deleteCuratedCategoryList({ listId }) {
  const id = String(listId ?? "");
  const deleted = await CuratedCategoryListModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(404, "Список не найден");
  }
  return { deletedId: id };
}

export async function addCuratedCategoryListItem({ listId, kind, refId, userId }) {
  const id = String(listId ?? "");
  const nextKind = String(kind ?? "").trim();
  const nextRefId = String(refId ?? "").trim();
  const doc = await CuratedCategoryListModel.findById(id);
  if (!doc) {
    throw new AppError(404, "Список не найден");
  }

  await assertCuratedCategoryListItemAddable(nextKind, nextRefId, doc.regionCode);

  const itemKey = buildCuratedCategoryItemKey(nextKind, nextRefId);
  const existingKeys = (doc.items ?? []).map((item) =>
    buildCuratedCategoryItemKey(item.kind, String(item.refId)),
  );
  if (existingKeys.includes(itemKey)) {
    throw new AppError(409, "Категория уже есть в этом списке");
  }

  doc.items = [...(doc.items ?? []), { kind: nextKind, refId: nextRefId }];
  doc.updatedBy = userId ?? null;
  await doc.save();

  const [list] = await buildAdminCuratedCategoryListsResponse([doc.toObject()]);
  return { list };
}

export async function removeCuratedCategoryListItem({ listId, itemKey, userId }) {
  const id = String(listId ?? "");
  const nextKey = String(itemKey ?? "").trim();
  const doc = await CuratedCategoryListModel.findById(id);
  if (!doc) {
    throw new AppError(404, "Список не найден");
  }

  const nextItems = (doc.items ?? []).filter(
    (item) => buildCuratedCategoryItemKey(item.kind, String(item.refId)) !== nextKey,
  );

  if (nextItems.length === (doc.items ?? []).length) {
    throw new AppError(404, "Категория не найдена в списке");
  }

  doc.items = nextItems;
  doc.updatedBy = userId ?? null;
  await doc.save();

  const [list] = await buildAdminCuratedCategoryListsResponse([doc.toObject()]);
  return { list };
}
