import { PRODUCT_CATEGORY_ELECTRONICS } from "../model/productConstants.js";
import { createImageRow, imageRowsFromUrls } from "./productImageRowHelpers.js";
import { resolveProductImageUrls } from "./resolveProductImageUrls.js";
import { characteristicRowsFromApi } from "./characteristicRowsFromApi.js";
import { formatIntegerGroupRu } from "../../../shared/lib/numericInput.js";
import { isProductListingOrigin } from "./productListingOrigin.js";
import { mapProductReturnTermsToRows } from "./productReturnTermRows.js";
import {
  legacyPickupFieldsFromLocations,
  productPickupLocationsFromApiProduct,
} from "./productPickupLocationsForm.js";

export const CREATE_PRODUCT_INITIAL_FORM = {
  productName: "",
  productListingOrigin: null,
  productIsOriginal: false,
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
  productRegionCode: "",
  productPickupLocations: [],
  productPickupAddress: "",
  productPickupLat: null,
  productPickupLon: null,
  productPickupSelectedFromSuggest: false,
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
    productCategoryId: product.productCategoryId ?? null,
    categoryBreadcrumbRu: product.categoryBreadcrumbRu?.trim() ?? "",
    productIsAvailable: product.productIsAvailable !== false,
    productStockQuantity:
      product.productIsAvailable !== false && product.productStockQuantity != null
        ? String(Math.max(0, Math.floor(Number(product.productStockQuantity))))
        : "1",
    loyaltyPointsPerUnit: "0",
    affiliateEnabled: product.affiliateEnabled === true,
    affiliatePercent: String(
      Math.max(0, Math.floor(Number(product.affiliatePercent) || 0)) || 10,
    ),
    productCharacteristicRows: characteristicRowsFromApi(
      product.productCharacteristics,
    ),
    categoryDefaultCharacteristicKeys: [],
    productCharacteristicsSellerTouched: true,
    productCharacteristicsAutoAppliedForCategoryId: null,
    productRegionCode: product.productRegionCode?.trim() || "RU-MOW",
    ...(() => {
      const productPickupLocations = productPickupLocationsFromApiProduct(product);
      return {
        productPickupLocations,
        ...legacyPickupFieldsFromLocations(productPickupLocations),
      };
    })(),
    productPickupEnabled: product.productPickupEnabled !== false,
    productDeliveryEnabled: product.productDeliveryEnabled === true,
    productReturnEnabled: product.productReturnEnabled === true,
    returnTermRows:
      product.productReturnEnabled === true
        ? mapProductReturnTermsToRows(product.productReturnTerms)
        : [],
  };
}

/**
 * Префилл визарда создания из существующего товара.
 * Без полей «Управление»: партнёрка выкл., объявление снова видимое.
 *
 * @param {import('../model/types.js').ProductFromApi} product
 */
export function createProductFormStateFromCopiedProduct(product) {
  const copied = createProductFormStateFromProduct(product);
  const stockRaw = Number.parseInt(String(product.productStockQuantity ?? ""), 10);
  return {
    ...copied,
    loyaltyPointsPerUnit: "0",
    affiliateEnabled: false,
    affiliatePercent: CREATE_PRODUCT_INITIAL_FORM.affiliatePercent,
    productIsAvailable: true,
    productStockQuantity: Number.isFinite(stockRaw) && stockRaw > 0 ? String(stockRaw) : "1",
  };
}
