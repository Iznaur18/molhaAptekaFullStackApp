import {
  CATEGORY_DEAL_TYPE_SERVICE,
  CATEGORY_DEAL_TYPE_VIEWING,
  normalizeCategoryDealType,
  normalizeProductServiceLocations,
  normalizeProductServicePriceMode,
  normalizeProductServicePriceUnit,
} from "@molha/api-contract";

/**
 * Условия сделки для тела запроса создания и правки объявления.
 *
 * У обычного товара возвращает пустой объект: его форма этих полей не
 * показывает, и слать дефолты значило бы писать в товар то, чего продавец не
 * выбирал.
 *
 * @param {Record<string, unknown>} form
 * @returns {Record<string, unknown>}
 */
export function buildProductDealTermsFields(form) {
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

  if (dealType === CATEGORY_DEAL_TYPE_VIEWING) {
    return { productViewingSchedule: String(form.productViewingSchedule ?? "").trim() };
  }

  return {};
}
