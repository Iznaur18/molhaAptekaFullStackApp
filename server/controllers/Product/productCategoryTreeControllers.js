import { successRes } from "../../services/http/index.js";
import {
  getProductCategoryBreadcrumb,
  listProductCategoryChildren,
  listProductCategoryRoots,
  searchProductCategories,
} from "../../services/product/productCategoryTree.js";

/** GET /product/categories/roots */
export const getProductCategoryRootsController = async (_req, res) => {
  const data = await listProductCategoryRoots();
  return successRes(res, data);
};

/** GET /product/categories/search?query=… */
export const getProductCategorySearchController = async (req, res) => {
  const data = await searchProductCategories({ query: req.query.query });
  return successRes(res, data);
};

/** GET /product/categories/:categoryId/children */
export const getProductCategoryChildrenController = async (req, res) => {
  const data = await listProductCategoryChildren({
    categoryId: String(req.params.categoryId),
  });
  return successRes(res, data);
};

/** GET /product/categories/:categoryId/breadcrumb */
export const getProductCategoryBreadcrumbController = async (req, res) => {
  const data = await getProductCategoryBreadcrumb({
    categoryId: String(req.params.categoryId),
  });
  return successRes(res, data);
};
