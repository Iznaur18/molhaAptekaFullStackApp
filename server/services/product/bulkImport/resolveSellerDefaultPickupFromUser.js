import { PRODUCT_PICKUP_ADDRESS_MIN_LENGTH } from "@molha/api-contract";

/**
 * @param {{
 *   userAddress?: string;
 *   userAddressFlat?: string;
 *   userAddressGeo?: { lat?: number; lon?: number } | null;
 * } | null | undefined} user
 */
export function resolveSellerDefaultPickupFromUser(user) {
  const flat = String(user?.userAddressFlat ?? "").trim();
  let line = String(user?.userAddress ?? "").trim();

  if (flat && line) {
    const suffixes = [`, кв ${flat}`, `, кв. ${flat}`, `, квартира ${flat}`];
    for (const suffix of suffixes) {
      if (line.endsWith(suffix)) {
        line = line.slice(0, -suffix.length).trim();
        break;
      }
    }
  }

  const geoRaw = user?.userAddressGeo;
  const lat = Number(geoRaw?.lat);
  const lon = Number(geoRaw?.lon);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);

  if (line.length < PRODUCT_PICKUP_ADDRESS_MIN_LENGTH || !hasCoords) {
    throw new Error(
      "Укажите адрес самовывоза в профиле (с координатами) перед импортом товаров",
    );
  }

  return {
    productPickupAddress: line,
    productPickupLat: lat,
    productPickupLon: lon,
  };
}
