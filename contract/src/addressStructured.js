import { z } from "zod";

/** Синхрон с `server/constants/addressStructuredConstants.js`. */
export const ADDRESS_CITY_MAX_LENGTH = 80;
export const ADDRESS_DISTRICT_MAX_LENGTH = 80;
export const ADDRESS_STREET_MAX_LENGTH = 80;
export const ADDRESS_HOUSE_MAX_LENGTH = 20;
export const PRODUCT_SALE_CITY_MAX_LENGTH = 80;

const clearableAddressPartSchema = (maxLength, label) =>
  z
    .union([z.string(), z.null(), z.literal("")])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (value === null || value === "") return null;
      return String(value).trim();
    })
    .refine(
      (value) => value === undefined || value === null || value.length <= maxLength,
      `${label} не длиннее ${maxLength} символов`,
    );

export const userAddressCityFieldSchema = clearableAddressPartSchema(
  ADDRESS_CITY_MAX_LENGTH,
  "Город",
);

export const userAddressDistrictFieldSchema = clearableAddressPartSchema(
  ADDRESS_DISTRICT_MAX_LENGTH,
  "Район",
);

export const userAddressStreetFieldSchema = clearableAddressPartSchema(
  ADDRESS_STREET_MAX_LENGTH,
  "Улица",
);

export const userAddressHouseFieldSchema = clearableAddressPartSchema(
  ADDRESS_HOUSE_MAX_LENGTH,
  "Дом",
);

export const productSaleCityFieldSchema = z
  .union([z.string(), z.null(), z.literal("")])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    return String(value).trim();
  })
  .refine(
    (value) =>
      value === undefined || value === null || value.length <= PRODUCT_SALE_CITY_MAX_LENGTH,
    `Город продажи не длиннее ${PRODUCT_SALE_CITY_MAX_LENGTH} символов`,
  );

/**
 * @param {string | null | undefined} raw
 */
export function normalizeRuCityLabel(raw) {
  return String(raw ?? "").trim();
}

const RU_CITY_PREFIX_PATTERN = /^(?:город\s+|гор\.?\s+|г\.?\s+)/iu;

/**
 * Ключ для сравнения городов: trim, снятие «г/город», lower case (ru).
 *
 * @param {string | null | undefined} raw
 */
export function normalizeRuCityKey(raw) {
  let label = normalizeRuCityLabel(raw);
  if (label === "") return "";
  label = label.replace(RU_CITY_PREFIX_PATTERN, "").trim();
  if (label === "") return "";
  return label.toLocaleLowerCase("ru");
}

/**
 * @param {string | null | undefined} a
 * @param {string | null | undefined} b
 */
export function ruCityLabelsEqual(a, b) {
  const left = normalizeRuCityKey(a);
  const right = normalizeRuCityKey(b);
  if (left === "" || right === "") return false;
  return left === right;
}

/**
 * @param {{
 *   city?: string | null;
 *   district?: string | null;
 *   street?: string | null;
 *   house?: string | null;
 * }} parts
 */
export function buildAddressLineFromStructured(parts) {
  const segments = [];
  const city = normalizeRuCityLabel(parts.city);
  const district = normalizeRuCityLabel(parts.district);
  const street = normalizeRuCityLabel(parts.street);
  const house = normalizeRuCityLabel(parts.house);

  if (city) segments.push(city);
  if (district) segments.push(district);
  if (street) segments.push(street);
  if (house) segments.push(house.startsWith("д ") ? house : `д ${house}`);

  return segments.join(", ");
}

/**
 * @param {string} value
 */
export function escapeRegExpForRuCity(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
