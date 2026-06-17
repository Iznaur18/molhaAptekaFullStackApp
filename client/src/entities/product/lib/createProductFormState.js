import { PRODUCT_CATEGORY_ELECTRONICS } from "../model/productConstants.js";
import { createImageRow, imageRowsFromUrls } from "./productImageRowHelpers.js";
import { resolveProductImageUrls } from "./resolveProductImageUrls.js";
import { characteristicRowsFromApi } from "./characteristicRowsFromApi.js";
import { formatIntegerGroupRu } from "../../../shared/lib/numericInput.js";
import { resolveProductLoyaltyPointsPerUnit } from "./resolveProductLoyaltyPointsPerUnit.js";

export const CREATE_PRODUCT_INITIAL_FORM = {
  productName: "",
  productDescription: "",
  productImageRows: [createImageRow("")],
  productPreviewVideoUrl: "",
  productPrice: "",
  productOldPrice: "",
  productCategory: PRODUCT_CATEGORY_ELECTRONICS,
  productCategoryId: null,
  categoryBreadcrumbRu: "",
  productIsAvailable: true,
  productStockQuantity: "1",
  loyaltyPointsPerUnit: "0",
  productCharacteristicRows: [],
  productSaleCity: "",
};

/**
 * @param {import('../model/types.js').ProductFromApi} product
 */
export function createProductFormStateFromProduct(product) {
  const urls = resolveProductImageUrls(product);
  const priceRaw = product.productPrice;
  const priceStr =
    priceRaw != null && Number.isFinite(Number(priceRaw)) ? String(priceRaw) : "";
  const oldPriceRaw = product.productOldPrice;
  const oldPriceStr =
    oldPriceRaw != null && Number.isFinite(Number(oldPriceRaw))
      ? String(Math.floor(Number(oldPriceRaw)))
      : "";
  return {
    productName: product.productName?.trim() ?? "",
    productDescription: product.productDescription?.trim() ?? "",
    productImageRows: imageRowsFromUrls(urls),
    productPreviewVideoUrl: product.productPreviewVideoUrl?.trim() ?? "",
    productPrice: priceStr ? formatIntegerGroupRu(priceStr) : "",
    productOldPrice: oldPriceStr ? formatIntegerGroupRu(oldPriceStr) : "",
    productCategory: product.productCategory ?? PRODUCT_CATEGORY_ELECTRONICS,
    productCategoryId: product.productCategoryId ?? null,
    categoryBreadcrumbRu: product.categoryBreadcrumbRu?.trim() ?? "",
    productIsAvailable: product.productIsAvailable !== false,
    productStockQuantity:
      product.productIsAvailable !== false && product.productStockQuantity != null
        ? String(Math.max(0, Math.floor(Number(product.productStockQuantity))))
        : "1",
    loyaltyPointsPerUnit: String(resolveProductLoyaltyPointsPerUnit(product)),
    productCharacteristicRows: characteristicRowsFromApi(product.productCharacteristics),
    productSaleCity: product.productSaleCity?.trim() ?? "",
  };
}
