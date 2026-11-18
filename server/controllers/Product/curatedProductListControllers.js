import { successRes } from "../../services/http/index.js";
import {
  addCuratedProductListItem,
  createCuratedProductList,
  deleteCuratedProductList,
  listAdminCuratedProductLists,
  listHomeCuratedProductLists,
  patchCuratedProductList,
  previewCuratedListProduct,
  removeCuratedProductListItem,
  reorderAdminCuratedProductLists,
} from "../../services/product/curatedProductListsAdmin.js";

/** GET /product/curated-lists/home */
export async function getHomeCuratedProductListsController(req, res) {
  const data = await listHomeCuratedProductLists({
    userId: req.userId ?? null,
    queryRegionCode: req.query.regionCode,
  });
  return successRes(res, data);
}

/** GET /product/admin/curated-lists */
export async function listCuratedProductListsAdminController(_req, res) {
  const data = await listAdminCuratedProductLists();
  return successRes(res, data);
}

/** GET /product/admin/curated-lists/product-preview/:productId */
export async function previewCuratedListProductAdminController(req, res) {
  const data = await previewCuratedListProduct({
    productId: req.params.productId,
  });
  return successRes(res, data);
}

/** POST /product/admin/curated-lists */
export async function createCuratedProductListAdminController(req, res) {
  const data = await createCuratedProductList({
    title: req.body?.title,
    regionCode: req.body?.regionCode,
    userId: req.userId ?? null,
  });
  return successRes(res, { list: data.list }, data.statusCode ?? 201);
}

/** PATCH /product/admin/curated-lists/reorder */
export async function reorderCuratedProductListsAdminController(req, res) {
  const data = await reorderAdminCuratedProductLists({
    orderedListIds: req.body?.orderedListIds,
  });
  return successRes(res, data);
}

/** PATCH /product/admin/curated-lists/:listId */
export async function patchCuratedProductListAdminController(req, res) {
  const data = await patchCuratedProductList({
    listId: req.params.listId,
    title: req.body?.title,
    regionCode: req.body?.regionCode,
    userId: req.userId ?? null,
  });
  return successRes(res, data);
}

/** DELETE /product/admin/curated-lists/:listId */
export async function deleteCuratedProductListAdminController(req, res) {
  const data = await deleteCuratedProductList({ listId: req.params.listId });
  return successRes(res, data);
}

/** POST /product/admin/curated-lists/:listId/products */
export async function addCuratedProductListItemAdminController(req, res) {
  const data = await addCuratedProductListItem({
    listId: req.params.listId,
    productId: req.body?.productId,
    userId: req.userId ?? null,
  });
  return successRes(res, data);
}

/** DELETE /product/admin/curated-lists/:listId/products/:productId */
export async function removeCuratedProductListItemAdminController(req, res) {
  const data = await removeCuratedProductListItem({
    listId: req.params.listId,
    productId: req.params.productId,
    userId: req.userId ?? null,
  });
  return successRes(res, data);
}
