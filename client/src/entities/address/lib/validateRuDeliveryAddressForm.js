import { IS_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST_ENABLED } from "../../../shared/config/featureFlags.js";
import { isAddressServiceUnavailable } from "../api/addressServiceAvailability.js";
import { ADDRESS_LINE_MAX_LENGTH } from "../model/constants.js";

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

  const requireSuggest =
    IS_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST_ENABLED &&
    !isAddressServiceUnavailable();

  if (requireSuggest && !value.selectedFromSuggest) {
    return "Выберите адрес из списка подсказок";
  }

  if (line.length > ADDRESS_LINE_MAX_LENGTH) {
    return `Адрес не длиннее ${ADDRESS_LINE_MAX_LENGTH} символов`;
  }

  return null;
}
