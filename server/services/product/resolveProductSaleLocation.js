import {
  isRuRegionCode,
  PRODUCT_PICKUP_ADDRESS_MAX_LENGTH,
  PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
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
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import {
  normalizeProductPickupAddress,
  normalizeProductPickupCoords,
} from "./productPickup.js";

/**
 * Адрес из DaData, если он укладывается в лимиты поля; иначе — прежний.
 * Длинную «чистую» строку DaData лучше не брать, чем срывать сохранение.
 *
 * @param {unknown} cleanAddress
 * @param {string} fallbackAddress
 */
function pickCleanPickupAddress(cleanAddress, fallbackAddress) {
  const clean = String(cleanAddress ?? "").trim();
  return clean.length >= PRODUCT_PICKUP_ADDRESS_MIN_LENGTH &&
    clean.length <= PRODUCT_PICKUP_ADDRESS_MAX_LENGTH
    ? clean
    : fallbackAddress;
}

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
  } catch (error) {
    // Регион тогда возьмётся из запасного варианта; сбой DaData — в журнал.
    logServerEvent("warn", {
      event: "product.sale_region_geolocate_failed",
      ...formatLogError(error),
    });
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

  const fallback = isRuRegionCode(fallbackRegionCode)
    ? String(fallbackRegionCode).trim()
    : null;

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
        return {
          productPickupAddress: pickCleanPickupAddress(
            verified.displayAddress,
            productPickupAddress,
          ),
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
          return {
            productPickupAddress: pickCleanPickupAddress(
              verified.displayAddress,
              productPickupAddress,
            ),
            ...verifiedCoords,
            productRegionCode: regionFromGeo,
          };
        }
      }
    } catch (error) {
      // Метка на карте / неполный адрес — регион найдём по координатам клиента
      // ниже. Отказ DaData оставляем в журнале.
      logServerEvent("warn", {
        event: "product.sale_address_verify_failed",
        ...formatLogError(error),
      });
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
