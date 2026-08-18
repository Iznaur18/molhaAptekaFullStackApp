import { addressValueFromUser } from "../../address/lib/addressValueFromUser.js";

/**
 * @param {Partial<{
 *   userAddress?: string;
 *   userAddressFlat?: string;
 *   userAddressFiasId?: string;
 *   userAddressGeo?: { lat?: number; lon?: number } | null;
 * }> | null | undefined} user
 */
export function createProductPickupFieldsFromUser(user) {
  const address = addressValueFromUser(user ?? {});
  return {
    productPickupAddress: address.line,
    productPickupLat: address.geo?.lat ?? null,
    productPickupLon: address.geo?.lon ?? null,
    productPickupSelectedFromSuggest: address.selectedFromSuggest === true,
  };
}
