import {
  PRODUCT_CATALOG_NEAR_ADDRESS_REQUIRED_MESSAGE,
  PRODUCT_CATALOG_NEAR_AUTH_MESSAGE,
  PRODUCT_CATALOG_NEAR_RADIUS_METERS,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";

/**
 * @typedef {{
 *   lat: number;
 *   lon: number;
 *   maxDistanceMeters: number;
 * }} CatalogNearContext
 */

/**
 * @param {string | undefined} userId
 * @returns {Promise<CatalogNearContext>}
 */
export async function resolveCatalogNearContext(userId) {
  if (!userId) {
    throw new AppError(401, PRODUCT_CATALOG_NEAR_AUTH_MESSAGE);
  }

  const user = await UserModel.findById(userId).select("userAddressGeo").lean();
  const lat = Number(user?.userAddressGeo?.lat);
  const lon = Number(user?.userAddressGeo?.lon);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new AppError(400, PRODUCT_CATALOG_NEAR_ADDRESS_REQUIRED_MESSAGE);
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw new AppError(400, PRODUCT_CATALOG_NEAR_ADDRESS_REQUIRED_MESSAGE);
  }

  return {
    lat,
    lon,
    maxDistanceMeters: PRODUCT_CATALOG_NEAR_RADIUS_METERS,
  };
}
