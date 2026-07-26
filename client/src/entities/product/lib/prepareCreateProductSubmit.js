import { normalizeUploadUrlForStorage } from "@izibuy/shared-lib";

import { IS_PRODUCT_CATEGORY_TREE_PICKER_ENABLED } from "../../product-category-tree/lib/isProductCategoryTreePickerEnabled.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { isRuRegionCode } from "@molha/api-contract";
import {
  computeProductDiscountPercent,
  parseProductPriceInput,
  validateProductOldPricePair,
} from "./computeProductDiscountPercent.js";
import { getProductPriceRubMaxError } from "./productPriceRubValidation.js";
import { validateProductDescription } from "./validateProductDescription.js";
import { validateProductName } from "./validateProductName.js";
import { isProductListingOrigin } from "./productListingOrigin.js";
import { isProductIsOriginalSelected } from "./productIsOriginal.js";
import {
  productCharacteristicsFromRows,
  validateProductCharacteristicsRows,
} from "./validateProductCharacteristicsRows.js";
import {
  serializeProductReturnTermRows,
  validateProductReturnTermRows,
} from "./productReturnTermRows.js";
import { urlsFromImageRows } from "./productImageRowHelpers.js";
import { PRODUCT_STOCK_QUANTITY_MAX, PRODUCT_STOCK_QUANTITY_MIN } from "../model/productStockConstants.js";

/**
 * @typedef {{
 *   form: Record<string, unknown>;
 *   isEdit: boolean;
 *   showCatalogAvailabilityToggle: boolean;
 *   sellerPointsMaxPerUnit: number;
 *   sellerCatalogCommitted: number;
 * }} PrepareCreateProductSubmitInput
 */

/**
 * @param {PrepareCreateProductSubmitInput} input
 * @returns {{ ok: false; message: string } | { ok: true; patchBody?: Record<string, unknown>; createBody?: Record<string, unknown> }}
 */
export function prepareCreateProductSubmit({
  form,
  isEdit,
  showCatalogAvailabilityToggle,
  sellerPointsMaxPerUnit,
  sellerCatalogCommitted,
}) {
  const productPrice = parseProductPriceInput(form.productPrice);
  if (productPrice == null) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_PRICE };
  }

  const productPriceMaxError = getProductPriceRubMaxError(productPrice);
  if (productPriceMaxError) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_PRICE_MAX };
  }

  const productOldPrice = parseProductPriceInput(form.productOldPrice);
  if (productOldPrice != null) {
    const oldPriceMaxError = getProductPriceRubMaxError(productOldPrice);
    if (oldPriceMaxError) {
      return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_PRICE_MAX };
    }
  }

  const oldPriceError = validateProductOldPricePair(productOldPrice, productPrice);
  if (oldPriceError) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_OLD_PRICE };
  }

  const nameError = validateProductName(form.productName);
  if (nameError) {
    return { ok: false, message: nameError };
  }

  if (!isProductListingOrigin(form.productListingOrigin)) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_LISTING_ORIGIN };
  }

  if (!isProductIsOriginalSelected(form.productIsOriginal)) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_ORIGINALITY };
  }

  const descriptionError = validateProductDescription(form.productDescription);
  if (descriptionError) {
    return { ok: false, message: descriptionError };
  }

  const characteristicsError = validateProductCharacteristicsRows(
    form.productCharacteristicRows,
  );
  if (characteristicsError) {
    return { ok: false, message: characteristicsError };
  }

  const productCharacteristics = productCharacteristicsFromRows(
    form.productCharacteristicRows,
  );

  const urls = urlsFromImageRows(form.productImageRows).map((url) =>
    normalizeUploadUrlForStorage(url),
  );
  const previewVideoUrl = normalizeUploadUrlForStorage(
    String(form.productPreviewVideoUrl ?? "").trim(),
  );
  if (previewVideoUrl && urls.length === 0) {
    return {
      ok: false,
      message: CREATE_PRODUCT_MODAL_UI.ERROR_PREVIEW_VIDEO_REQUIRES_PHOTO,
    };
  }

  if (!isEdit && urls.length === 0) {
    return {
      ok: false,
      message: CREATE_PRODUCT_MODAL_UI.ERROR_IMAGE_REQUIRED,
    };
  }

  const stockParsed = Math.floor(Number(form.productStockQuantity));
  const listedInCatalog = form.productIsAvailable === true;
  const stockRequired = listedInCatalog || (isEdit && !showCatalogAvailabilityToggle);
  let productStockQuantity = 0;

  if (stockRequired) {
    if (
      !Number.isFinite(stockParsed) ||
      stockParsed < PRODUCT_STOCK_QUANTITY_MIN ||
      stockParsed > PRODUCT_STOCK_QUANTITY_MAX
    ) {
      return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_STOCK };
    }
    productStockQuantity = stockParsed;
  } else if (
    isEdit &&
    Number.isFinite(stockParsed) &&
    stockParsed >= 0 &&
    stockParsed <= PRODUCT_STOCK_QUANTITY_MAX
  ) {
    productStockQuantity = stockParsed;
  }

  const loyaltyParsed = Math.floor(Number(form.loyaltyPointsPerUnit));
  const loyaltyPointsPerUnit =
    Number.isFinite(loyaltyParsed) && loyaltyParsed >= 0 ? loyaltyParsed : 0;
  if (loyaltyPointsPerUnit > sellerPointsMaxPerUnit) {
    return {
      ok: false,
      message: CREATE_PRODUCT_MODAL_UI.ERROR_LOYALTY_POINTS_MAX(
        sellerPointsMaxPerUnit,
        sellerCatalogCommitted,
      ),
    };
  }

  if (IS_PRODUCT_CATEGORY_TREE_PICKER_ENABLED) {
    if (!form.productCategoryId && !form.productCategory) {
      return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_CATEGORY_LEAF };
    }
  } else if (!form.productCategory) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_CATEGORY_LEAF };
  }

  const productRegionCode = String(form.productRegionCode ?? "").trim();
  if (!isRuRegionCode(productRegionCode)) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_SALE_REGION_REQUIRED };
  }

  if (form.productReturnEnabled == null) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_RETURN_CHOICE };
  }

  const productReturnEnabled = form.productReturnEnabled === true;
  let productReturnTerms = [];
  if (productReturnEnabled) {
    const returnTermsError = validateProductReturnTermRows(
      Array.isArray(form.returnTermRows) ? form.returnTermRows : [],
    );
    if (returnTermsError) {
      return { ok: false, message: returnTermsError };
    }
    productReturnTerms = serializeProductReturnTermRows(
      Array.isArray(form.returnTermRows) ? form.returnTermRows : [],
    );
  }

  if (isEdit) {
    const patchBody = {
      productName: String(form.productName).trim(),
      productListingOrigin: form.productListingOrigin,
      productIsOriginal: form.productIsOriginal === true,
      productDescription: String(form.productDescription).trim(),
      productImageUrls: urls,
      productPreviewVideoUrl: previewVideoUrl,
      productPrice,
      productOldPrice,
      loyaltyPointsPerUnit,
      productCharacteristics,
      productRegionCode,
      productReturnEnabled,
      productReturnTerms,
    };

    if (IS_PRODUCT_CATEGORY_TREE_PICKER_ENABLED && form.productCategoryId) {
      patchBody.productCategoryId = form.productCategoryId;
    } else {
      patchBody.productCategory = form.productCategory;
    }

    if (showCatalogAvailabilityToggle) {
      patchBody.productIsAvailable = form.productIsAvailable;
    }
    if (isEdit || showCatalogAvailabilityToggle) {
      patchBody.productStockQuantity = productStockQuantity;
    }

    return { ok: true, patchBody };
  }

  return {
    ok: true,
    createBody: {
      productName: form.productName,
      productListingOrigin: form.productListingOrigin,
      productIsOriginal: form.productIsOriginal === true,
      productDescription: form.productDescription,
      productImageUrls: urls,
      productPreviewVideoUrl: previewVideoUrl || undefined,
      productPrice,
      productOldPrice,
      ...(IS_PRODUCT_CATEGORY_TREE_PICKER_ENABLED && form.productCategoryId
        ? { productCategoryId: form.productCategoryId }
        : { productCategory: form.productCategory }),
      productIsAvailable: form.productIsAvailable,
      productStockQuantity,
      loyaltyPointsPerUnit,
      productCharacteristics,
      productRegionCode,
      productReturnEnabled,
      productReturnTerms,
    },
  };
}

/** @param {string} productPrice @param {string} productOldPrice */
export function resolveCreateProductDiscountPreview(productPrice, productOldPrice) {
  return computeProductDiscountPercent(
    parseProductPriceInput(productOldPrice),
    parseProductPriceInput(productPrice),
  );
}
