import { successRes } from "../../services/http/index.js";
import {
  addCuratedCategoryListItem,
  createCuratedCategoryList,
  deleteCuratedCategoryList,
  listAdminCuratedCategoryLists,
  listHomeCuratedCategoryLists,
  patchCuratedCategoryList,
  previewCuratedCategoryListItem,
  removeCuratedCategoryListItem,
  reorderAdminCuratedCategoryLists,
} from "../../services/product/curatedCategoryListsAdmin.js";

/** GET /product/curated-category-lists/home */
export async function getHomeCuratedCategoryListsController(req, res) {
  const data = await listHomeCuratedCategoryLists({
    userId: req.userId ?? null,
    queryRegionCode: req.query.regionCode,
  });
  return successRes(res, data);
}

/** GET /product/admin/curated-category-lists */
export async function listCuratedCategoryListsAdminController(_req, res) {
  const data = await listAdminCuratedCategoryLists();
  return successRes(res, data);
}

/** GET /product/admin/curated-category-lists/item-preview */
export async function previewCuratedCategoryListItemAdminController(req, res) {
  const data = await previewCuratedCategoryListItem({
    kind: req.query.kind,
    refId: req.query.refId,
  });
  return successRes(res, data);
}

/** POST /product/admin/curated-category-lists */
export async function createCuratedCategoryListAdminController(req, res) {
  const data = await createCuratedCategoryList({
    title: req.body?.title,
    regionCode: req.body?.regionCode,
    userId: req.userId ?? null,
  });
  return successRes(res, { list: data.list }, data.statusCode ?? 201);
}

/** PATCH /product/admin/curated-category-lists/reorder */
export async function reorderCuratedCategoryListsAdminController(req, res) {
  const data = await reorderAdminCuratedCategoryLists({
    orderedListIds: req.body?.orderedListIds,
  });
  return successRes(res, data);
}

/** PATCH /product/admin/curated-category-lists/:listId */
export async function patchCuratedCategoryListAdminController(req, res) {
  const data = await patchCuratedCategoryList({
    listId: req.params.listId,
    title: req.body?.title,
    regionCode: req.body?.regionCode,
    userId: req.userId ?? null,
  });
  return successRes(res, data);
}

/** DELETE /product/admin/curated-category-lists/:listId */
export async function deleteCuratedCategoryListAdminController(req, res) {
  const data = await deleteCuratedCategoryList({ listId: req.params.listId });
  return successRes(res, data);
}

/** POST /product/admin/curated-category-lists/:listId/items */
export async function addCuratedCategoryListItemAdminController(req, res) {
  const data = await addCuratedCategoryListItem({
    listId: req.params.listId,
    kind: req.body?.kind,
    refId: req.body?.refId,
    userId: req.userId ?? null,
  });
  return successRes(res, data);
}

/** DELETE /product/admin/curated-category-lists/:listId/items/:itemKey */
export async function removeCuratedCategoryListItemAdminController(req, res) {
  const data = await removeCuratedCategoryListItem({
    listId: req.params.listId,
    itemKey: req.params.itemKey,
    userId: req.userId ?? null,
  });
  return successRes(res, data);
}
