/**
 * @param {Partial<{
 *   userAddressCity?: string;
 *   userAddressDistrict?: string;
 *   userAddressStreet?: string;
 *   userAddressHouse?: string;
 *   userAddressFlat?: string;
 * }>} user
 * @returns {import('../model/structuredTypes.js').RuStructuredDeliveryAddressValue}
 */
export function addressStructuredValueFromUser(user) {
  const city = String(user.userAddressCity ?? "").trim();
  const hasStructured = city.length > 0;

  if (!hasStructured) {
    return {
      city: "",
      district: "",
      street: "",
      house: "",
      flat: "",
    };
  }

  return {
    city,
    district: String(user.userAddressDistrict ?? "").trim(),
    street: String(user.userAddressStreet ?? "").trim(),
    house: String(user.userAddressHouse ?? "").trim(),
    flat: String(user.userAddressFlat ?? "").trim(),
  };
}
