import {
  CATEGORY_DEAL_TYPE_SERVICE,
  normalizeCategoryDealType,
  normalizeProductServiceLocations,
  normalizeProductServicePriceMode,
  normalizeProductServicePriceUnit,
} from "@molha/api-contract";

/** Паритет web `buildProductDealTermsFields`. */
export function buildProductDealTermsFields(
  form: Record<string, unknown>,
): Record<string, unknown> {
  const dealType = normalizeCategoryDealType(form?.categoryDealType);

  if (dealType === CATEGORY_DEAL_TYPE_SERVICE) {
    return {
      productServicePriceMode: normalizeProductServicePriceMode(
        form.productServicePriceMode,
      ),
      productServicePriceUnit: normalizeProductServicePriceUnit(
        form.productServicePriceUnit,
      ),
      productServiceLocations: normalizeProductServiceLocations(
        form.productServiceLocations,
      ),
    };
  }

  return {};
}
