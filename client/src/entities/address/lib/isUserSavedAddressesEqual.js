import { userSavedAddressDuplicateKey } from "@molha/api-contract";

/**
 * @param {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue} a
 * @param {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue} b
 */
export function isUserSavedAddressEqual(a, b) {
  return (
    String(a?.id ?? "") === String(b?.id ?? "") &&
    String(a?.label ?? "").trim() === String(b?.label ?? "").trim() &&
    String(a?.line ?? "").trim() === String(b?.line ?? "").trim() &&
    String(a?.flat ?? "").trim() === String(b?.flat ?? "").trim() &&
    Boolean(a?.isDefault) === Boolean(b?.isDefault)
  );
}

/**
 * @param {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue[]} a
 * @param {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue[]} b
 */
export function isUserSavedAddressesEqual(a, b) {
  const left = Array.isArray(a) ? a : [];
  const right = Array.isArray(b) ? b : [];

  if (left.length !== right.length) {
    return false;
  }

  const sortById = (list) =>
    [...list].sort((itemA, itemB) => String(itemA.id).localeCompare(String(itemB.id)));

  const sortedLeft = sortById(left);
  const sortedRight = sortById(right);

  return sortedLeft.every((item, index) => isUserSavedAddressEqual(item, sortedRight[index]));
}

/**
 * @param {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue[]} addresses
 * @returns {string | null}
 */
export function findDuplicateUserSavedAddressKey(addresses) {
  const keys = new Set();

  for (const item of addresses) {
    const key = userSavedAddressDuplicateKey(item.line, item.flat);
    if (keys.has(key)) {
      return key;
    }
    keys.add(key);
  }

  return null;
}

/**
 * @param {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue[]} addresses
 * @returns {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue | null}
 */
export function findDefaultUserSavedAddress(addresses) {
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return null;
  }
  return addresses.find((item) => item.isDefault) ?? addresses[0] ?? null;
}
