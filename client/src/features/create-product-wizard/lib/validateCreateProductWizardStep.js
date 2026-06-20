import { normalizeUploadUrlForStorage } from "@izibuy/shared-lib";

import { PRODUCT_SALE_CITY_MAX_LENGTH } from "../../../entities/address/model/constants.js";
import { IS_PRODUCT_CATEGORY_TREE_PICKER_ENABLED } from "../../../entities/product-category-tree/lib/isProductCategoryTreePickerEnabled.js";
import {
  parseProductPriceInput,
  validateProductOldPricePair,
} from "../../../entities/product/lib/computeProductDiscountPercent.js";
import { getProductPriceRubMaxError } from "../../../entities/product/lib/productPriceRubValidation.js";
import { urlsFromImageRows } from "../../../entities/product/lib/productImageRowHelpers.js";
import { prepareCreateProductSubmit } from "../../../entities/product/lib/prepareCreateProductSubmit.js";
import { validateProductCharacteristicsRows } from "../../../entities/product/lib/validateProductCharacteristicsRows.js";
import { validateProductDescription } from "../../../entities/product/lib/validateProductDescription.js";
import { validateProductName } from "../../../entities/product/lib/validateProductName.js";
import {
  PRODUCT_STOCK_QUANTITY_MAX,
  PRODUCT_STOCK_QUANTITY_MIN,
} from "../../../entities/product/model/productStockConstants.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { CREATE_PRODUCT_WIZARD_STEP_IDS } from "./createProductWizardSteps.js";

/**
 * @param {string} stepId
 * @param {Record<string, unknown>} form
 * @param {{
 *   sellerPointsMaxPerUnit: number;
 *   sellerCatalogCommitted: number;
 * }} context
 * @returns {string | null}
 */
export function validateCreateProductWizardStep(stepId, form, context) {
  switch (stepId) {
    case "basic": {
      const nameError = validateProductName(form.productName);
      if (nameError) {
        return nameError;
      }

      const descriptionError = validateProductDescription(form.productDescription);
      if (descriptionError) {
        return descriptionError;
      }

      return validateProductCharacteristicsRows(form.productCharacteristicRows);
    }

    case "media": {
      const urls = urlsFromImageRows(form.productImageRows).map((url) =>
        normalizeUploadUrlForStorage(url),
      );
      const previewVideoUrl = normalizeUploadUrlForStorage(
        String(form.productPreviewVideoUrl ?? "").trim(),
      );
      if (previewVideoUrl && urls.length === 0) {
        return CREATE_PRODUCT_MODAL_UI.ERROR_PREVIEW_VIDEO_REQUIRES_PHOTO;
      }
      return null;
    }

    case "category": {
      if (IS_PRODUCT_CATEGORY_TREE_PICKER_ENABLED) {
        if (!form.productCategoryId && !form.productCategory) {
          return CREATE_PRODUCT_MODAL_UI.ERROR_CATEGORY_LEAF;
        }
      } else if (!form.productCategory) {
        return CREATE_PRODUCT_MODAL_UI.ERROR_CATEGORY_LEAF;
      }

      const productSaleCity = String(form.productSaleCity ?? "").trim();
      if (productSaleCity.length > PRODUCT_SALE_CITY_MAX_LENGTH) {
        return CREATE_PRODUCT_MODAL_UI.ERROR_SALE_CITY_MAX;
      }
      return null;
    }

    case "commerce": {
      const productPrice = parseProductPriceInput(form.productPrice);
      if (productPrice == null) {
        return CREATE_PRODUCT_MODAL_UI.ERROR_PRICE;
      }

      const productPriceMaxError = getProductPriceRubMaxError(productPrice);
      if (productPriceMaxError) {
        return CREATE_PRODUCT_MODAL_UI.ERROR_PRICE_MAX;
      }

      const productOldPrice = parseProductPriceInput(form.productOldPrice);
      if (productOldPrice != null) {
        const oldPriceMaxError = getProductPriceRubMaxError(productOldPrice);
        if (oldPriceMaxError) {
          return CREATE_PRODUCT_MODAL_UI.ERROR_PRICE_MAX;
        }
      }

      const oldPriceError = validateProductOldPricePair(productOldPrice, productPrice);
      if (oldPriceError) {
        return CREATE_PRODUCT_MODAL_UI.ERROR_OLD_PRICE;
      }

      if (form.productIsAvailable === true) {
        const stockParsed = Math.floor(Number(form.productStockQuantity));
        if (
          !Number.isFinite(stockParsed) ||
          stockParsed < PRODUCT_STOCK_QUANTITY_MIN ||
          stockParsed > PRODUCT_STOCK_QUANTITY_MAX
        ) {
          return CREATE_PRODUCT_MODAL_UI.ERROR_STOCK;
        }
      }

      const loyaltyParsed = Math.floor(Number(form.loyaltyPointsPerUnit));
      const loyaltyPointsPerUnit =
        Number.isFinite(loyaltyParsed) && loyaltyParsed >= 0 ? loyaltyParsed : 0;
      if (loyaltyPointsPerUnit > context.sellerPointsMaxPerUnit) {
        return CREATE_PRODUCT_MODAL_UI.ERROR_LOYALTY_POINTS_MAX(
          context.sellerPointsMaxPerUnit,
          context.sellerCatalogCommitted,
        );
      }

      return null;
    }

    case "review": {
      const prepared = prepareCreateProductSubmit({
        form,
        isEdit: false,
        showCatalogAvailabilityToggle: true,
        sellerPointsMaxPerUnit: context.sellerPointsMaxPerUnit,
        sellerCatalogCommitted: context.sellerCatalogCommitted,
      });
      return prepared.ok ? null : prepared.message;
    }

    default:
      return null;
  }
}

/** @param {string} stepId */
export function isCreateProductWizardStepId(stepId) {
  return CREATE_PRODUCT_WIZARD_STEP_IDS.includes(
    /** @type {import('./createProductWizardSteps.js').CreateProductWizardStepId} */ (stepId),
  );
}
