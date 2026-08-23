import { userSavedAddressesFromProfile, userSavedAddressDuplicateKey } from "@molha/api-contract";

import { ensureSingleDefaultUserSavedAddress } from "./ensureSingleDefaultUserSavedAddress.js";

/**
 * @param {{ lat?: number; lon?: number } | null | undefined} geo
 */
function normalizeUserGeo(geo) {
  const lat = Number(geo?.lat);
  const lon = Number(geo?.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

/**
 * @param {string} line
 * @param {string} flat
 */
function createStableLegacyAddressId(line, flat) {
  const key = userSavedAddressDuplicateKey(line, flat);
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return `legacy-${hash.toString(36)}`;
}

/**
 * @param {Partial<import('../../user/model/types.js').UserPublicProfile>} user
 * @returns {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue[]}
 */
export function userSavedAddressesFromUser(user) {
  const legacyGeo = normalizeUserGeo(user?.userAddressGeo);
  const mapped = userSavedAddressesFromProfile(user).map((item) => ({
    id:
      item.id === "legacy-default"
        ? createStableLegacyAddressId(item.line, item.flat)
        : item.id,
    label: item.label ?? "",
    line: item.line,
    flat: item.flat ?? "",
    fiasId: item.fiasId ?? "",
    geo:
      normalizeUserGeo(item.geo) ??
      (item.isDefault === true && legacyGeo ? legacyGeo : null),
    regionCode: null,
    selectedFromSuggest: item.line.length > 0,
    isDefault: item.isDefault === true,
  }));

  return ensureSingleDefaultUserSavedAddress(mapped);
}

/**
 * @returns {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue}
 */
export function createEmptyUserSavedAddressDraft() {
  return {
    id: "",
    label: "",
    line: "",
    flat: "",
    fiasId: "",
    geo: null,
    regionCode: null,
    selectedFromSuggest: false,
    isDefault: false,
  };
}
