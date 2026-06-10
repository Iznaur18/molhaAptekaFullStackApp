/**
 * @param {Record<string, unknown>} payload
 * @param {import('../model/structuredTypes.js').RuStructuredDeliveryAddressValue} value
 */
export function appendStructuredAddressToPayload(payload, value) {
  const city = String(value.city ?? "").trim();
  const district = String(value.district ?? "").trim();
  const street = String(value.street ?? "").trim();
  const house = String(value.house ?? "").trim();
  const flat = String(value.flat ?? "").trim();
  const anyFilled = city || district || street || house || flat;

  if (!anyFilled) {
    payload.userAddressCity = null;
    payload.userAddressDistrict = null;
    payload.userAddressStreet = null;
    payload.userAddressHouse = null;
    payload.userAddressFlat = null;
    payload.userAddress = null;
    return;
  }

  payload.userAddressCity = city;
  payload.userAddressDistrict = district || null;
  payload.userAddressStreet = street;
  payload.userAddressHouse = house;
  payload.userAddressFlat = flat || null;
}
