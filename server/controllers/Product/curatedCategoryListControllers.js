import { CURATED_CATEGORY_LIST_TITLE_MAX_LENGTH } from "../../constants/curatedCategoryListConstants.js";
import CuratedCategoryListModel from "../../models/CuratedCategoryListModel.js";
import {
  assertCuratedCategoryListItemAddable,
  buildAdminCuratedCategoryListsResponse,
  buildCuratedCategoryListItemPreview,
  buildHomeCuratedCategoryListsResponse,
  normalizeCuratedCategoryListRegionCode,
  normalizeCuratedCategoryListTitle,
  reorderCuratedCategoryLists,
  toCuratedCategoryListPayload,
} from "../../services/product/curatedCategoryListHelpers.js";
import { resolveViewerRegionCodeForRequest } from "../../services/user/userRegionCatalogFilter.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { buildCuratedCategoryItemKey } from "@molha/api-contract";

const sortCuratedLists = { sortOrder: 1, createdAt: 1 };

/** GET /product/curated-category-lists/home */
export async function getHomeCuratedCategoryListsController(req, res) {
  const viewerRegionCode = await resolveViewerRegionCodeForRequest({
    userId: req.userId,
    queryRegionCode: req.query.regionCode,
  });

  const lists = await CuratedCategoryListModel.find({ regionCode: viewerRegionCode })
    .sort(sortCuratedLists)
    .lean();
  const curatedLists = await buildHomeCuratedCategoryListsResponse(lists, {
    viewerRegionCode,
  });
  successRes(res, { lists: curatedLists });
}

/** GET /product/admin/curated-category-lists */
export async function listCuratedCategoryListsAdminController(_req, res) {
  const lists = await CuratedCategoryListModel.find().sort(sortCuratedLists).lean();
  const curatedLists = await buildAdminCuratedCategoryListsResponse(lists);
  successRes(res, { lists: curatedLists });
}

/** GET /product/admin/curated-category-lists/item-preview */
export async function previewCuratedCategoryListItemAdminController(req, res) {
  const kind = String(req.query.kind ?? "").trim();
  const refId = String(req.query.refId ?? "").trim();
  const preview = await buildCuratedCategoryListItemPreview(kind, refId);
  successRes(res, { preview });
}

/** POST /product/admin/curated-category-lists */
export async function createCuratedCategoryListAdminController(req, res) {
  const title = normalizeCuratedCategoryListTitle(req.body?.title);
  if (title.length > CURATED_CATEGORY_LIST_TITLE_MAX_LENGTH) {
    return errorRes(res, 400, "Слишком длинный заголовок");
  }

  const regionCode = normalizeCuratedCategoryListRegionCode(req.body?.regionCode);

  const maxSortOrder = await CuratedCategoryListModel.findOne()
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean();
  const sortOrder = Number(maxSortOrder?.sortOrder ?? -1) + 1;

  const doc = await CuratedCategoryListModel.create({
    title,
    regionCode,
    sortOrder,
    updatedBy: req.userId ?? null,
  });

  successRes(res, { list: toCuratedCategoryListPayload(doc.toObject()) }, 201);
}

/** PATCH /product/admin/curated-category-lists/reorder */
export async function reorderCuratedCategoryListsAdminController(req, res) {
  const orderedListIds = Array.isArray(req.body?.orderedListIds)
    ? req.body.orderedListIds.map((id) => String(id))
    : [];
  if (!orderedListIds.length) {
    return errorRes(res, 400, "Укажите orderedListIds");
  }

  await reorderCuratedCategoryLists(orderedListIds);
  const lists = await CuratedCategoryListModel.find().sort(sortCuratedLists).lean();
  const curatedLists = await buildAdminCuratedCategoryListsResponse(lists);
  successRes(res, { lists: curatedLists });
}

/** PATCH /product/admin/curated-category-lists/:listId */
export async function patchCuratedCategoryListAdminController(req, res) {
  const listId = String(req.params.listId ?? "");
  const doc = await CuratedCategoryListModel.findById(listId);
  if (!doc) {
    return errorRes(res, 404, "Список не найден");
  }

  if (req.body?.title !== undefined) {
    const title = normalizeCuratedCategoryListTitle(req.body.title);
    if (title.length > CURATED_CATEGORY_LIST_TITLE_MAX_LENGTH) {
      return errorRes(res, 400, "Слишком длинный заголовок");
    }
    doc.title = title;
  }

  if (req.body?.regionCode !== undefined) {
    doc.regionCode = normalizeCuratedCategoryListRegionCode(req.body.regionCode);
  }

  doc.updatedBy = req.userId ?? null;
  await doc.save();
  successRes(res, { list: toCuratedCategoryListPayload(doc.toObject()) });
}

/** DELETE /product/admin/curated-category-lists/:listId */
export async function deleteCuratedCategoryListAdminController(req, res) {
  const listId = String(req.params.listId ?? "");
  const deleted = await CuratedCategoryListModel.findByIdAndDelete(listId);
  if (!deleted) {
    return errorRes(res, 404, "Список не найден");
  }
  successRes(res, { deletedId: listId });
}

/** POST /product/admin/curated-category-lists/:listId/items */
export async function addCuratedCategoryListItemAdminController(req, res) {
  const listId = String(req.params.listId ?? "");
  const kind = String(req.body?.kind ?? "").trim();
  const refId = String(req.body?.refId ?? "").trim();

  const doc = await CuratedCategoryListModel.findById(listId);
  if (!doc) {
    return errorRes(res, 404, "Список не найден");
  }

  await assertCuratedCategoryListItemAddable(kind, refId, doc.regionCode);

  const itemKey = buildCuratedCategoryItemKey(kind, refId);
  const existingKeys = (doc.items ?? []).map((item) =>
    buildCuratedCategoryItemKey(item.kind, String(item.refId)),
  );
  if (existingKeys.includes(itemKey)) {
    return errorRes(res, 409, "Категория уже есть в этом списке");
  }

  doc.items = [...(doc.items ?? []), { kind, refId }];
  doc.updatedBy = req.userId ?? null;
  await doc.save();

  successRes(res, { list: toCuratedCategoryListPayload(doc.toObject()) });
}

/** DELETE /product/admin/curated-category-lists/:listId/items/:itemKey */
export async function removeCuratedCategoryListItemAdminController(req, res) {
  const listId = String(req.params.listId ?? "");
  const itemKey = String(req.params.itemKey ?? "").trim();

  const doc = await CuratedCategoryListModel.findById(listId);
  if (!doc) {
    return errorRes(res, 404, "Список не найден");
  }

  const nextItems = (doc.items ?? []).filter(
    (item) => buildCuratedCategoryItemKey(item.kind, String(item.refId)) !== itemKey,
  );

  if (nextItems.length === (doc.items ?? []).length) {
    return errorRes(res, 404, "Категория не найдена в списке");
  }

  doc.items = nextItems;
  doc.updatedBy = req.userId ?? null;
  await doc.save();

  successRes(res, { list: toCuratedCategoryListPayload(doc.toObject()) });
}
