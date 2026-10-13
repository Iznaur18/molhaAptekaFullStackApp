import {
  PRODUCT_VIEWING_SCHEDULE_MAX_LENGTH,
  normalizeProductServiceLocations,
  normalizeProductServicePriceMode,
  normalizeProductServicePriceUnit,
} from "@molha/api-contract";

const hasBodyField = (body, field) => Object.prototype.hasOwnProperty.call(body, field);

/**
 * Условия сделки из тела запроса: вид цены услуги, где её оказывают, когда
 * можно приехать на осмотр.
 *
 * Возвращает только присланные поля — и создание, и правка кладут результат в
 * запись как есть, а правка не затирает то, чего в теле не было. Тип сделки
 * здесь не сверяется: у обычного товара эти поля никто не показывает, а
 * запрещать их значило бы ронять сохранение, когда админ сменил тип категории.
 *
 * @param {Record<string, unknown> | null | undefined} body
 * @returns {Record<string, unknown>}
 */
export const resolveProductDealTermsWrite = (body) => {
  const source = body ?? {};
  /** @type {Record<string, unknown>} */
  const fields = {};

  if (hasBodyField(source, "productServicePriceMode")) {
    fields.productServicePriceMode = normalizeProductServicePriceMode(
      source.productServicePriceMode,
    );
  }
  if (hasBodyField(source, "productServicePriceUnit")) {
    fields.productServicePriceUnit = normalizeProductServicePriceUnit(
      source.productServicePriceUnit,
    );
  }
  if (hasBodyField(source, "productServiceLocations")) {
    fields.productServiceLocations = normalizeProductServiceLocations(
      source.productServiceLocations,
    );
  }
  if (hasBodyField(source, "productViewingSchedule")) {
    fields.productViewingSchedule = String(source.productViewingSchedule ?? "")
      .trim()
      .slice(0, PRODUCT_VIEWING_SCHEDULE_MAX_LENGTH);
  }

  return fields;
};
