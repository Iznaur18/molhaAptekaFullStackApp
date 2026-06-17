import { CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH } from "../../constants/curatedProductListConstants.js";
import CuratedProductListModel from "../../models/CuratedProductListModel.js";
import { getHiddenSellerIds } from "../../services/access/adminUserGuard.js";
import {
  assertCuratedListProductCatalogVisible,
  buildAdminCuratedListsResponse,
  buildHomeCuratedListsResponse,
  normalizeCuratedProductListTitle,
  reorderCuratedProductLists,
  toCuratedProductListPayload,
} from "../../services/product/curatedProductListHelpers.js";
import { resolveBuyerCityFilter } from "../../services/user/userCityCatalogFilter.js";
import { errorRes, successRes } from "../../services/http/index.js";

const sortCuratedLists = { sortOrder: 1, createdAt: 1 };

const parseTruthyQueryFlag = (raw) =>
  raw != null && String(raw).trim().toLowerCase() === "true";

/** GET /product/curated-lists/home */
export async function getHomeCuratedProductListsController(req, res) {
  const hiddenSellerIds = await getHiddenSellerIds();
  const allCities = parseTruthyQueryFlag(req.query.allCities);
  const buyerCityKey = allCities ? null : await resolveBuyerCityFilter(req.userId);

  const lists = await CuratedProductListModel.find().sort(sortCuratedLists).lean();
  const curatedLists = await buildHomeCuratedListsResponse(lists, hiddenSellerIds, {
    buyerCityKey,
  });
  successRes(res, { lists: curatedLists });
}

/** GET /product/admin/curated-lists */
export async function listCuratedProductListsAdminController(_req, res) {
  const hiddenSellerIds = await getHiddenSellerIds();
  const lists = await CuratedProductListModel.find().sort(sortCuratedLists).lean();
  const curatedLists = await buildAdminCuratedListsResponse(lists, hiddenSellerIds);
  successRes(res, { lists: curatedLists });
}

/** POST /product/admin/curated-lists */
export async function createCuratedProductListAdminController(req, res) {
  const title = normalizeCuratedProductListTitle(req.body?.title);
  if (title.length > CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH) {
    return errorRes(res, 400, "Слишком длинный заголовок");
  }

  const maxSortOrder = await CuratedProductListModel.findOne()
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean();
  const sortOrder = Number(maxSortOrder?.sortOrder ?? -1) + 1;

  const doc = await CuratedProductListModel.create({
    title,
    sortOrder,
    updatedBy: req.userId ?? null,
  });

  successRes(res, { list: toCuratedProductListPayload(doc.toObject()) }, 201);
}

/** PATCH /product/admin/curated-lists/reorder */
export async function reorderCuratedProductListsAdminController(req, res) {
  const orderedListIds = Array.isArray(req.body?.orderedListIds)
    ? req.body.orderedListIds.map((id) => String(id))
    : [];
  if (!orderedListIds.length) {
    return errorRes(res, 400, "Укажите orderedListIds");
  }

  await reorderCuratedProductLists(orderedListIds);
  const hiddenSellerIds = await getHiddenSellerIds();
  const lists = await CuratedProductListModel.find().sort(sortCuratedLists).lean();
  const curatedLists = await buildAdminCuratedListsResponse(lists, hiddenSellerIds);
  successRes(res, { lists: curatedLists });
}

/** PATCH /product/admin/curated-lists/:listId */
export async function patchCuratedProductListAdminController(req, res) {
  const listId = String(req.params.listId ?? "");
  const doc = await CuratedProductListModel.findById(listId);
  if (!doc) {
    return errorRes(res, 404, "Список не найден");
  }

  if (req.body?.title !== undefined) {
    const title = normalizeCuratedProductListTitle(req.body.title);
    if (title.length > CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH) {
      return errorRes(res, 400, "Слишком длинный заголовок");
    }
    doc.title = title;
  }

  doc.updatedBy = req.userId ?? null;
  await doc.save();
  successRes(res, { list: toCuratedProductListPayload(doc.toObject()) });
}

/** DELETE /product/admin/curated-lists/:listId */
export async function deleteCuratedProductListAdminController(req, res) {
  const listId = String(req.params.listId ?? "");
  const deleted = await CuratedProductListModel.findByIdAndDelete(listId);
  if (!deleted) {
    return errorRes(res, 404, "Список не найден");
  }
  successRes(res, { deletedId: listId });
}

/** POST /product/admin/curated-lists/:listId/products */
export async function addCuratedProductListItemAdminController(req, res) {
  const listId = String(req.params.listId ?? "");
  const productId = String(req.body?.productId ?? "").trim();

  const doc = await CuratedProductListModel.findById(listId);
  if (!doc) {
    return errorRes(res, 404, "Список не найден");
  }

  await assertCuratedListProductCatalogVisible(productId);

  const existingIds = (doc.productIds ?? []).map((id) => String(id));
  if (existingIds.includes(productId)) {
    return errorRes(res, 409, "Товар уже есть в этом списке");
  }

  doc.productIds = [...existingIds, productId];
  doc.updatedBy = req.userId ?? null;
  await doc.save();

  successRes(res, { list: toCuratedProductListPayload(doc.toObject()) });
}

/** DELETE /product/admin/curated-lists/:listId/products/:productId */
export async function removeCuratedProductListItemAdminController(req, res) {
  const listId = String(req.params.listId ?? "");
  const productId = String(req.params.productId ?? "").trim();

  const doc = await CuratedProductListModel.findById(listId);
  if (!doc) {
    return errorRes(res, 404, "Список не найден");
  }

  const nextIds = (doc.productIds ?? [])
    .map((id) => String(id))
    .filter((id) => id !== productId);

  if (nextIds.length === (doc.productIds ?? []).length) {
    return errorRes(res, 404, "Товар не найден в списке");
  }

  doc.productIds = nextIds;
  doc.updatedBy = req.userId ?? null;
  await doc.save();

  successRes(res, { list: toCuratedProductListPayload(doc.toObject()) });
}
