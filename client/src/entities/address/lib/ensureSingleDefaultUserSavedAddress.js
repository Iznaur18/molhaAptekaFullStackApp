/**
 * @param {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue[]} addresses
 * @returns {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue[]}
 */
export function ensureSingleDefaultUserSavedAddress(addresses) {
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return [];
  }

  const defaultIndexes = addresses
    .map((item, index) => (item.isDefault ? index : -1))
    .filter((index) => index >= 0);
  const defaultIndex = defaultIndexes[0] ?? 0;

  return addresses.map((item, index) => ({
    ...item,
    isDefault: index === defaultIndex,
  }));
}
