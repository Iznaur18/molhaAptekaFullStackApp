import { UserModel } from "../../models/index.js";

/**
 * Geo адреса профиля для бейджа дистанции (без throw — нет адреса = null).
 *
 * @param {string | undefined} userId
 * @returns {Promise<{ lat: number; lon: number } | null>}
 */
export async function resolveOptionalViewerCatalogGeo(userId) {
  if (!userId) {
    return null;
  }

  const user = await UserModel.findById(userId).select("userAddressGeo").lean();
  const lat = Number(user?.userAddressGeo?.lat);
  const lon = Number(user?.userAddressGeo?.lon);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return null;
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    return null;
  }

  return { lat, lon };
}
