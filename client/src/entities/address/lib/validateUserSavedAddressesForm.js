import {
  USER_SAVED_ADDRESSES_MAX,
  USER_SAVED_ADDRESS_LABEL_MAX_LENGTH,
} from "@molha/api-contract";

import { validateRuDeliveryAddressForm } from "./validateRuDeliveryAddressForm.js";
import { findDuplicateUserSavedAddressKey } from "./isUserSavedAddressesEqual.js";
import { USER_SAVED_ADDRESSES_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue[]} addresses
 * @returns {string | null}
 */
export function validateUserSavedAddressesForm(addresses) {
  const list = Array.isArray(addresses) ? addresses : [];

  if (list.length > USER_SAVED_ADDRESSES_MAX) {
    return USER_SAVED_ADDRESSES_UI.ERROR_MAX_COUNT(USER_SAVED_ADDRESSES_MAX);
  }

  if (list.length === 0) {
    return null;
  }

  if (!list.some((item) => item.isDefault)) {
    return USER_SAVED_ADDRESSES_UI.ERROR_DEFAULT_REQUIRED;
  }

  if (findDuplicateUserSavedAddressKey(list)) {
    return USER_SAVED_ADDRESSES_UI.ERROR_DUPLICATE;
  }

  for (const item of list) {
    const label = String(item.label ?? "").trim();
    if (label.length > USER_SAVED_ADDRESS_LABEL_MAX_LENGTH) {
      return USER_SAVED_ADDRESSES_UI.ERROR_LABEL_MAX(USER_SAVED_ADDRESS_LABEL_MAX_LENGTH);
    }

    const addressError = validateRuDeliveryAddressForm(item);
    if (addressError) {
      return addressError;
    }
  }

  return null;
}

/**
 * @param {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue} draft
 * @returns {string | null}
 */
export function validateUserSavedAddressDraft(draft) {
  const label = String(draft.label ?? "").trim();
  if (label.length > USER_SAVED_ADDRESS_LABEL_MAX_LENGTH) {
    return USER_SAVED_ADDRESSES_UI.ERROR_LABEL_MAX(USER_SAVED_ADDRESS_LABEL_MAX_LENGTH);
  }

  return validateRuDeliveryAddressForm(draft);
}
