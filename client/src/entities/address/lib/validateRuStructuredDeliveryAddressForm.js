import {
  ADDRESS_CITY_MAX_LENGTH,
  ADDRESS_DISTRICT_MAX_LENGTH,
  ADDRESS_FLAT_MAX_LENGTH,
  ADDRESS_HOUSE_MAX_LENGTH,
  ADDRESS_STREET_MAX_LENGTH,
} from "../model/constants.js";

/**
 * @param {import('../model/structuredTypes.js').RuStructuredDeliveryAddressValue} value
 * @returns {string | null}
 */
export function validateRuStructuredDeliveryAddressForm(value) {
  const city = String(value.city ?? "").trim();
  const district = String(value.district ?? "").trim();
  const street = String(value.street ?? "").trim();
  const house = String(value.house ?? "").trim();
  const flat = String(value.flat ?? "").trim();
  const anyFilled = city || district || street || house || flat;

  if (!anyFilled) {
    return null;
  }

  if (!city) return "Укажите город";
  if (!street) return "Укажите улицу";
  if (!house) return "Укажите номер дома";

  if (city.length > ADDRESS_CITY_MAX_LENGTH) {
    return `Город не длиннее ${ADDRESS_CITY_MAX_LENGTH} символов`;
  }
  if (district.length > ADDRESS_DISTRICT_MAX_LENGTH) {
    return `Район не длиннее ${ADDRESS_DISTRICT_MAX_LENGTH} символов`;
  }
  if (street.length > ADDRESS_STREET_MAX_LENGTH) {
    return `Улица не длиннее ${ADDRESS_STREET_MAX_LENGTH} символов`;
  }
  if (house.length > ADDRESS_HOUSE_MAX_LENGTH) {
    return `Дом не длиннее ${ADDRESS_HOUSE_MAX_LENGTH} символов`;
  }
  if (flat.length > ADDRESS_FLAT_MAX_LENGTH) {
    return `Квартира: не более ${ADDRESS_FLAT_MAX_LENGTH} символов`;
  }

  return null;
}
