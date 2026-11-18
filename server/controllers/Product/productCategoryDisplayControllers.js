import { successRes } from "../../services/http/index.js";
import {
  listProductCategoryDisplays,
  patchProductCategoryDisplayById,
  patchProductCategoryDisplayBySlug,
  patchProductCategoryDisplaySettings,
} from "../../services/product/productCategoryDisplayAdmin.js";

/** GET /product/category-displays */
export async function getProductCategoryDisplaysController(_req, res) {
  const data = await listProductCategoryDisplays();
  return successRes(res, data);
}

/** PATCH /product/category-display-settings — только admin. */
export async function patchProductCategoryDisplaySettingsController(req, res) {
  const data = await patchProductCategoryDisplaySettings({
    tileImagesEnabled: req.body.tileImagesEnabled,
    adminId: String(req.userId),
  });
  return successRes(res, data);
}

/** PATCH /product/category-displays/:categorySlug — только admin. */
export async function patchProductCategoryDisplayController(req, res) {
  const data = await patchProductCategoryDisplayBySlug({
    categorySlug: String(req.params.categorySlug ?? "").trim(),
    body: req.body ?? {},
    adminId: String(req.userId),
  });
  return successRes(res, data);
}

/** PATCH /product/category-node-displays/:categoryId — только admin. */
export async function patchProductCategoryNodeDisplayController(req, res) {
  const data = await patchProductCategoryDisplayById({
    categoryId: String(req.params.categoryId ?? "").trim(),
    body: req.body ?? {},
    adminId: String(req.userId),
  });
  return successRes(res, data);
}
