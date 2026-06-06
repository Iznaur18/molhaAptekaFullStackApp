import { ADDRESS_LINE_MAX_LENGTH } from "../model/constants.js";

/** Временно: не требовать выбор адреса из DaData-подсказок на клиенте. */
const REQUIRE_SELECTED_FROM_SUGGEST = false;

/**
 * @param {import('../model/types.js').RuDeliveryAddressValue} value
 * @param {{ required?: boolean }} [options]
 * @returns {string | null}
 */
export function validateRuDeliveryAddressForm(value, options = {}) {
  const { required = false } = options;
  const line = String(value.line ?? "").trim();

  if (line === "") {
    return required ? "Укажите адрес доставки" : null;
  }

  if (REQUIRE_SELECTED_FROM_SUGGEST && !value.selectedFromSuggest) {
    return "Выберите адрес из списка подсказок";
  }

  if (line.length > ADDRESS_LINE_MAX_LENGTH) {
    return `Адрес не длиннее ${ADDRESS_LINE_MAX_LENGTH} символов`;
  }

  return null;
}
