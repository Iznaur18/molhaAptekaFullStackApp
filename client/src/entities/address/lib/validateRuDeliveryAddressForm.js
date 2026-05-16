import { ADDRESS_FLAT_MAX_LENGTH, ADDRESS_LINE_MAX_LENGTH } from "../model/constants.js";

/**
 * @param {import('../model/types.js').RuDeliveryAddressValue} value
 * @param {{ required?: boolean }} [options]
 * @returns {string | null}
 */
export function validateRuDeliveryAddressForm(value, options = {}) {
  const { required = false } = options;
  const line = String(value.line ?? "").trim();
  const flat = String(value.flat ?? "").trim();

  if (line === "" && flat === "") {
    return required ? "Укажите адрес доставки" : null;
  }

  if (line === "") {
    return "Выберите адрес из подсказок";
  }

  if (!value.selectedFromSuggest) {
    return "Выберите адрес из списка подсказок";
  }

  if (line.length > ADDRESS_LINE_MAX_LENGTH) {
    return `Адрес не длиннее ${ADDRESS_LINE_MAX_LENGTH} символов`;
  }

  if (flat === "") {
    return "Укажите номер квартиры";
  }

  if (flat.length > ADDRESS_FLAT_MAX_LENGTH) {
    return `Квартира: не более ${ADDRESS_FLAT_MAX_LENGTH} символов`;
  }

  return null;
}
