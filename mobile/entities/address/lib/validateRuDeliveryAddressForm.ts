import { IS_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST_ENABLED } from "@/shared/config/featureFlags";

import { ADDRESS_LINE_MAX_LENGTH } from "../model/constants";
import type { RuDeliveryAddressValue } from "../model/types";

export const validateRuDeliveryAddressForm = (
  value: RuDeliveryAddressValue,
  options: { required?: boolean } = {},
): string | null => {
  const { required = false } = options;
  const line = value.line.trim();

  if (line === "") {
    return required ? "Укажите адрес доставки" : null;
  }

  if (IS_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST_ENABLED && !value.selectedFromSuggest) {
    return "Выберите адрес из списка подсказок";
  }

  if (line.length > ADDRESS_LINE_MAX_LENGTH) {
    return `Адрес не длиннее ${ADDRESS_LINE_MAX_LENGTH} символов`;
  }

  return null;
};
