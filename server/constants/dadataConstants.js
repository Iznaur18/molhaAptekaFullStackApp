import {
  ADDRESS_FLAT_MAX_LENGTH,
  ADDRESS_LINE_MAX_LENGTH,
} from "@molha/api-contract";

// Длина адреса живёт в контракте: её видят и схемы запросов, и модели, и обе
// формы ввода. Своя копия здесь однажды разошлась бы с zod, и пользователь
// получил бы английскую ошибку mongoose вместо человеческой.
export { ADDRESS_FLAT_MAX_LENGTH, ADDRESS_LINE_MAX_LENGTH };

/**
 * Soft qc только когда нет `house_fias_id`.
 * Clean часто возвращает qc_complete=5 при валидном доме — тогда смотрим FIAS.
 */
export const DADATA_QC_COMPLETE_MAX = 1;

/** Soft qc_geo только без `house_fias_id`. С FIAS допускаем street-level geo. */
export const DADATA_QC_GEO_MAX = 1;

export const DADATA_SUGGEST_COUNT = 7;

