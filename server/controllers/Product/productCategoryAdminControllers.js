import { successRes } from "../../services/http/index.js";
import {
  createProductCategoryAdmin,
  deleteProductCategoryAdmin,
  listProductCategoriesAdmin,
  patchProductCategoryAdmin,
} from "../../services/product/productCategoryAdmin.js";

/** GET /product/admin/categories */
export async function listProductCategoriesAdminController(_req, res) {
  const data = await listProductCategoriesAdmin();
  return successRes(res, data);
}

/** POST /product/admin/categories */
export async function createProductCategoryAdminController(req, res) {
  const data = await createProductCategoryAdmin(req.body);
  return successRes(
    res,
    { category: data.category, movedProductCount: data.movedProductCount },
    data.statusCode ?? 201,
  );
}

/** PATCH /product/admin/categories/:categoryId */
export async function patchProductCategoryAdminController(req, res) {
  const data = await patchProductCategoryAdmin({
    categoryId: req.params.categoryId,
    body: req.body,
  });
  return successRes(res, data);
}

/** DELETE /product/admin/categories/:categoryId — cascade: узел + всё поддерево */
export async function deleteProductCategoryAdminController(req, res) {
  const data = await deleteProductCategoryAdmin({
    categoryId: req.params.categoryId,
  });
  return successRes(res, data);
}
