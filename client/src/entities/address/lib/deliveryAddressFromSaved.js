/** @param {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue | import('@molha/api-contract').ReturnType<import('@molha/api-contract').userSavedAddressesFromProfile>[number]} item */
export function deliveryAddressFromSaved(item) {
  return {
    line: String(item.line ?? "").trim(),
    flat: String(item.flat ?? "").trim(),
    fiasId: String(item.fiasId ?? "").trim(),
    geo: item.geo ?? null,
    regionCode: null,
    selectedFromSuggest: String(item.line ?? "").trim().length > 0,
  };
}

export const CHECKOUT_SAVED_ADDRESS_CUSTOM_ID = "__custom__";

/**
 * @param {Array<{ id?: string; isDefault?: boolean }>} addresses
 */
export function resolveInitialCheckoutSavedAddressId(addresses) {
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return CHECKOUT_SAVED_ADDRESS_CUSTOM_ID;
  }
  const defaultItem = addresses.find((item) => item.isDefault) ?? addresses[0];
  return defaultItem?.id ?? CHECKOUT_SAVED_ADDRESS_CUSTOM_ID;
}

/**
 * @param {import('../model/types.js').RuDeliveryAddressValue} deliveryAddress
 * @param {Array<{ id?: string; line?: string; flat?: string }>} addresses
 */
export function matchCheckoutSavedAddressId(deliveryAddress, addresses) {
  const line = String(deliveryAddress.line ?? "").trim();
  const flat = String(deliveryAddress.flat ?? "").trim();
  if (!line) {
    return CHECKOUT_SAVED_ADDRESS_CUSTOM_ID;
  }

  const matched = addresses.find(
    (item) =>
      String(item.line ?? "").trim() === line &&
      String(item.flat ?? "").trim() === flat,
  );

  return matched?.id ?? CHECKOUT_SAVED_ADDRESS_CUSTOM_ID;
}

/**
 * @param {string} line
 * @param {Array<{ id?: string; line?: string }>} addresses
 */
export function matchSavedAddressLineId(line, addresses) {
  const normalizedLine = String(line ?? "").trim();
  if (!normalizedLine) {
    return CHECKOUT_SAVED_ADDRESS_CUSTOM_ID;
  }

  const matched = addresses.find(
    (item) => String(item.line ?? "").trim() === normalizedLine,
  );

  return matched?.id ?? CHECKOUT_SAVED_ADDRESS_CUSTOM_ID;
}
