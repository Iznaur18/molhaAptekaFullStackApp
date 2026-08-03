import {
  isRuRegionCode,
  PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_COORDS_REQUIRED_MESSAGE,
  PRODUCT_SALE_REGION_FROM_ADDRESS_FAILED_MESSAGE,
  resolveRuRegionCodeFromDadataData,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";
import {
  geolocateRuAddresses,
  isDadataConfigured,
  isDadataSuggestConfigured,
} from "../../utils/dadata/dadataClient.js";
import { verifyRuDeliveryAddress } from "../../utils/dadata/verifyRuDeliveryAddress.js";
import {
  normalizeProductPickupAddress,
  normalizeProductPickupCoords,
} from "./productPickup.js";

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<string | null>}
 */
async function resolveRegionCodeByGeolocate(lat, lon) {
  if (!isDadataSuggestConfigured()) {
    return null;
  }
  try {
    const suggestions = await geolocateRuAddresses(lat, lon);
    const data = suggestions[0]?.data;
    return resolveRuRegionCodeFromDadataData(
      data && typeof data === "object" ? data : null,
    );
  } catch {
    return null;
  }
}

/**
 * Адрес продажи + coords → нормализованные поля + `productRegionCode`.
 *
 * @param {{
 *   address: unknown;
 *   lat: unknown;
 *   lon: unknown;
 *   fallbackRegionCode?: unknown;
 * }} input
 */
export async function resolveProductSaleLocation({
  address,
  lat,
  lon,
  fallbackRegionCode,
}) {
  let productPickupAddress;
  try {
    productPickupAddress = normalizeProductPickupAddress(address);
  } catch (error) {
    throw new AppError(
      400,
      error instanceof Error ? error.message : PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
    );
  }

  let coords;
  try {
    coords = normalizeProductPickupCoords(lat, lon);
  } catch (error) {
    throw new AppError(
      400,
      error instanceof Error ? error.message : PRODUCT_PICKUP_COORDS_REQUIRED_MESSAGE,
    );
  }

  if (coords.productPickupLat == null || coords.productPickupLon == null) {
    throw new AppError(400, PRODUCT_PICKUP_COORDS_REQUIRED_MESSAGE);
  }

  const fallback =
    isRuRegionCode(fallbackRegionCode) ? String(fallbackRegionCode).trim() : null;

  if (isDadataConfigured()) {
    try {
      const verified = await verifyRuDeliveryAddress({
        addressLine: productPickupAddress,
      });
      if (verified.geo && verified.regionCode) {
        const verifiedCoords = normalizeProductPickupCoords(
          verified.geo.lat,
          verified.geo.lon,
        );
        let nextAddress = productPickupAddress;
        try {
          nextAddress = normalizeProductPickupAddress(verified.displayAddress);
        } catch {
          /* leave client/normalized address if clean result too long */
        }
        return {
          productPickupAddress: nextAddress,
          ...verifiedCoords,
          productRegionCode: verified.regionCode,
        };
      }
      if (verified.geo && !verified.regionCode) {
        const regionFromGeo = await resolveRegionCodeByGeolocate(
          verified.geo.lat,
          verified.geo.lon,
        );
        if (regionFromGeo) {
          const verifiedCoords = normalizeProductPickupCoords(
            verified.geo.lat,
            verified.geo.lon,
          );
          let nextAddress = productPickupAddress;
          try {
            nextAddress = normalizeProductPickupAddress(verified.displayAddress);
          } catch {
            /* leave client/normalized address if clean result too long */
          }
          return {
            productPickupAddress: nextAddress,
            ...verifiedCoords,
            productRegionCode: regionFromGeo,
          };
        }
      }
    } catch {
      // pin / неполный адрес — geolocate по клиентским coords
    }
  }

  const regionFromGeo = await resolveRegionCodeByGeolocate(
    coords.productPickupLat,
    coords.productPickupLon,
  );
  if (regionFromGeo) {
    return {
      productPickupAddress,
      ...coords,
      productRegionCode: regionFromGeo,
    };
  }

  if (fallback) {
    return {
      productPickupAddress,
      ...coords,
      productRegionCode: fallback,
    };
  }

  throw new AppError(400, PRODUCT_SALE_REGION_FROM_ADDRESS_FAILED_MESSAGE);
}
