import { getCatalogProductFacets } from "../../services/product/getCatalogProductFacets.js";
import { getCatalogProducts } from "../../services/product/getCatalogProducts.js";
import { getMyProducts } from "../../services/product/getMyProducts.js";
import { successRes } from "../../services/http/index.js";

export const getProductsController = async (req, res) => {
  const result = await getCatalogProducts({
    userId: req.userId,
    query: req.query,
  });

  return successRes(res, result);
};

/** Счётчики фильтров каталога: те же query, что у GET /product. */
export const getProductFacetsController = async (req, res) => {
  const result = await getCatalogProductFacets({
    userId: req.userId,
    query: req.query,
  });

  return successRes(res, result);
};

export const getMyProductsController = async (req, res) => {
  const result = await getMyProducts({
    userId: req.userId,
    query: req.query,
  });

  return successRes(res, result);
};
