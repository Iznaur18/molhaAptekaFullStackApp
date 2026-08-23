import { resolveUserAddressCityNormalized } from "../product/ruCityNormalized.js";

/**
 * @param {Record<string, unknown>} updateData
 * @param {Array<{
 *   id: string;
 *   label: string;
 *   line: string;
 *   flat: string;
 *   city: string;
 *   district: string;
 *   street: string;
 *   house: string;
 *   fiasId: string;
 *   geo: { lat: number; lon: number } | null;
 *   isDefault: boolean;
 * }>} verifiedAddresses
 */
export function applyVerifiedUserAddressesUpdate(updateData, verifiedAddresses) {
  updateData.userAddresses = verifiedAddresses.map((item) => ({
    id: item.id,
    label: item.label ?? "",
    line: item.line,
    flat: item.flat ?? "",
    city: item.city ?? "",
    district: item.district ?? "",
    street: item.street ?? "",
    house: item.house ?? "",
    fiasId: item.fiasId ?? "",
    geo: item.geo ?? null,
    isDefault: item.isDefault === true,
  }));

  const defaultAddress =
    verifiedAddresses.find((item) => item.isDefault === true) ?? null;

  if (!defaultAddress) {
    updateData.userAddress = null;
    updateData.userAddressFlat = null;
    updateData.userAddressCity = null;
    updateData.userAddressDistrict = null;
    updateData.userAddressStreet = null;
    updateData.userAddressHouse = null;
    updateData.userAddressFiasId = null;
    updateData.userAddressGeo = null;
    updateData.userAddressCityNormalized = "";
    return;
  }

  updateData.userAddress = defaultAddress.line;
  updateData.userAddressFlat = defaultAddress.flat ?? "";
  updateData.userAddressCity = defaultAddress.city ?? "";
  updateData.userAddressDistrict = defaultAddress.district ?? "";
  updateData.userAddressStreet = defaultAddress.street ?? "";
  updateData.userAddressHouse = defaultAddress.house ?? "";
  updateData.userAddressFiasId = defaultAddress.fiasId ?? "";
  updateData.userAddressGeo = defaultAddress.geo ?? null;
  updateData.userAddressCityNormalized = resolveUserAddressCityNormalized(
    defaultAddress.city ?? "",
  );
}
