import { PRODUCT_CATEGORY_ELECTRONICS } from "../model/productConstants.js";
import { createImageRow, imageRowsFromUrls } from "./productImageRowHelpers.js";
import { resolveProductImageUrls } from "./resolveProductImageUrls.js";
import { characteristicRowsFromApi } from "./characteristicRowsFromApi.js";
import { formatIntegerGroupRu } from "../../../shared/lib/numericInput.js";
import { resolveProductLoyaltyPointsPerUnit } from "./resolveProductLoyaltyPointsPerUnit.js";
import { isProductListingOrigin } from "./productListingOrigin.js";
import { mapProductReturnTermsToRows } from "./productReturnTermRows.js";
import { IS_PRODUCT_CATEGORY_TREE_PICKER_ENABLED } from "../../product-category-tree/lib/isProductCategoryTreePickerEnabled.js";

export const CREATE_PRODUCT_INITIAL_FORM = {
  productName: "",
  productListingOrigin: null,
  productIsOriginal: null,
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
  affiliateEnabled: false,
  affiliatePercent: "10",
  productCharacteristicRows: [],
  categoryDefaultCharacteristicKeys: [],
  productCharacteristicsSellerTouched: false,
  productCharacteristicsAutoAppliedForCategoryId: null,
  productRegionCode: "RU-MOW",
  productPickupAddress: "",
  productPickupLat: null,
  productPickupLon: null,
  productPickupEnabled: true,
  productDeliveryEnabled: false,
  productReturnEnabled: null,
  returnTermRows: [],
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
    productListingOrigin: isProductListingOrigin(product.productListingOrigin)
      ? product.productListingOrigin
      : null,
    productIsOriginal: product.productIsOriginal === true,
    productDescription: product.productDescription?.trim() ?? "",
    productImageRows: imageRowsFromUrls(urls),
    productPreviewVideoUrl: product.productPreviewVideoUrl?.trim() ?? "",
    productPrice: priceStr ? formatIntegerGroupRu(priceStr) : "",
    productOldPrice: oldPriceStr ? formatIntegerGroupRu(oldPriceStr) : "",
    productCategory: product.productCategory ?? PRODUCT_CATEGORY_ELECTRONICS,
    productCategoryId: IS_PRODUCT_CATEGORY_TREE_PICKER_ENABLED
      ? (product.productCategoryId ?? null)
      : null,
    categoryBreadcrumbRu: IS_PRODUCT_CATEGORY_TREE_PICKER_ENABLED
      ? (product.categoryBreadcrumbRu?.trim() ?? "")
      : "",
    productIsAvailable: product.productIsAvailable !== false,
    productStockQuantity:
      product.productIsAvailable !== false && product.productStockQuantity != null
        ? String(Math.max(0, Math.floor(Number(product.productStockQuantity))))
        : "1",
    loyaltyPointsPerUnit: String(resolveProductLoyaltyPointsPerUnit(product)),
    affiliateEnabled: product.affiliateEnabled === true,
    affiliatePercent: String(
      Math.max(0, Math.floor(Number(product.affiliatePercent) || 0)) || 10,
    ),
    productCharacteristicRows: characteristicRowsFromApi(product.productCharacteristics),
    categoryDefaultCharacteristicKeys: [],
    productCharacteristicsSellerTouched: true,
    productCharacteristicsAutoAppliedForCategoryId: null,
    productRegionCode: product.productRegionCode?.trim() || "RU-MOW",
    productPickupAddress: String(product.productPickupAddress ?? "").trim(),
    productPickupLat:
      product.productPickupLat != null && Number.isFinite(Number(product.productPickupLat))
        ? Number(product.productPickupLat)
        : null,
    productPickupLon:
      product.productPickupLon != null && Number.isFinite(Number(product.productPickupLon))
        ? Number(product.productPickupLon)
        : null,
    productPickupEnabled: product.productPickupEnabled !== false,
    productDeliveryEnabled: product.productDeliveryEnabled === true,
    productReturnEnabled: product.productReturnEnabled === true,
    returnTermRows:
      product.productReturnEnabled === true
        ? mapProductReturnTermsToRows(product.productReturnTerms)
        : [],
  };
}
