import { successRes } from "../../services/http/index.js";
import {
  createProductSearchSynonymAdmin,
  deleteProductSearchSynonymAdmin,
  listProductSearchSynonymsAdmin,
  patchProductSearchSynonymAdmin,
} from "../../services/product/productSearchSynonymAdmin.js";

/** GET /product/admin/search-synonyms */
export async function listProductSearchSynonymsAdminController(_req, res) {
  const data = await listProductSearchSynonymsAdmin();
  return successRes(res, data);
}

/** POST /product/admin/search-synonyms */
export async function createProductSearchSynonymAdminController(req, res) {
  const data = await createProductSearchSynonymAdmin({
    token: req.body?.token,
    categories: req.body?.categories,
  });
  return successRes(res, data, 201);
}

/** PATCH /product/admin/search-synonyms/:synonymId */
export async function patchProductSearchSynonymAdminController(req, res) {
  const data = await patchProductSearchSynonymAdmin({
    synonymId: String(req.params.synonymId ?? ""),
    token: req.body?.token,
    categories: req.body?.categories,
  });
  return successRes(res, data);
}

/** DELETE /product/admin/search-synonyms/:synonymId */
export async function deleteProductSearchSynonymAdminController(req, res) {
  const data = await deleteProductSearchSynonymAdmin({
    synonymId: String(req.params.synonymId ?? ""),
  });
  return successRes(res, data);
}
