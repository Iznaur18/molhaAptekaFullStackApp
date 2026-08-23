/**
 * @param {Record<string, unknown>} payload
 * @param {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue[]} addresses
 */
export function appendUserAddressesToPayload(payload, addresses) {
  payload.userAddresses = addresses.map((item) => ({
    id: String(item.id ?? "").trim(),
    label: String(item.label ?? "").trim() || null,
    line: String(item.line ?? "").trim(),
    flat: String(item.flat ?? "").trim(),
    isDefault: item.isDefault === true,
  }));
}
