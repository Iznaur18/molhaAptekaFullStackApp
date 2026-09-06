// Длина адреса — из контракта, одна на сервер, веб и мобилку.
export {
  ADDRESS_LINE_MAX_LENGTH,
  ADDRESS_FLAT_MAX_LENGTH,
} from "@molha/api-contract";

/** Как `contract/src/addressStructured.js`. */
export const ADDRESS_CITY_MAX_LENGTH = 80;
export const ADDRESS_DISTRICT_MAX_LENGTH = 80;
export const ADDRESS_STREET_MAX_LENGTH = 80;
export const ADDRESS_HOUSE_MAX_LENGTH = 20;
export const PRODUCT_SALE_CITY_MAX_LENGTH = 80;

export const ADDRESS_SUGGEST_MIN_QUERY_LENGTH = 2;

export const ADDRESS_SUGGEST_DEBOUNCE_MS = 350;
