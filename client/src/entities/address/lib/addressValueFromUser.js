import { splitAddressForForm } from "./splitAddressForForm.js";

/**
 * @param {Partial<{
 *   userAddress?: string;
 *   userAddressFlat?: string;
 *   userAddressFiasId?: string;
 *   userAddressGeo?: { lat?: number; lon?: number } | null;
 * }>} user
 * @returns {import('../model/types.js').RuDeliveryAddressValue}
 */
export function addressValueFromUser(user) {
  const { line } = splitAddressForForm(user.userAddress, user.userAddressFlat);
  const fiasId = String(user.userAddressFiasId ?? "").trim();
  const geoRaw = user.userAddressGeo;
  const lat = Number(geoRaw?.lat);
  const lon = Number(geoRaw?.lon);
  const geo = Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;

  const hasSaved = line.length > 0;

  return {
    line,
    flat: "",
    fiasId,
    geo,
    selectedFromSuggest: hasSaved,
  };
}
