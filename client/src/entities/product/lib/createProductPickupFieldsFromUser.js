/**
 * Pickup locations are chosen explicitly on the pickup wizard step.
 * Do not prefill from profile — avoids saving unselected profile addresses.
 *
 * @param {Partial<import('../../user/model/types.js').UserPublicProfile>} _user
 */
export function createProductPickupFieldsFromUser(_user) {
  return {
    productPickupLocations: [],
    productPickupAddress: "",
    productPickupLat: null,
    productPickupLon: null,
    productPickupSelectedFromSuggest: false,
  };
}
