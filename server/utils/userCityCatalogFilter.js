import {
  escapeRegExpForRuCity,
  normalizeRuCityKey,
} from "@molha/api-contract";

import { UserModel } from "../models/index.js";
import { resolveUserAddressCityNormalized } from "./ruCityNormalized.js";

/**
 * @param {string} cityKey
 */
function buildLegacyProductSaleCityRegexMatch(cityKey) {
  const escaped = escapeRegExpForRuCity(cityKey);
  const pattern = new RegExp(
    `^(?:город\\s+|гор\\.?\\s+|г\\.?\\s+)?${escaped}$`,
    "i",
  );

  return {
    $and: [
      {
        $or: [
          { productSaleCityNormalized: { $in: [null, ""] } },
          { productSaleCityNormalized: { $exists: false } },
        ],
      },
      { productSaleCity: { $regex: pattern } },
    ],
  };
}

/**
 * @param {string | null | undefined} userId
 * @returns {Promise<string | null>}
 */
export async function resolveBuyerCityFilter(userId) {
  if (userId == null || String(userId).trim() === "") {
    return null;
  }

  const user = await UserModel.findById(String(userId))
    .select("userAddressCity userAddressCityNormalized")
    .lean();

  const fromStored = String(user?.userAddressCityNormalized ?? "").trim();
  if (fromStored !== "") {
    return fromStored;
  }

  const cityKey = resolveUserAddressCityNormalized(user?.userAddressCity);
  return cityKey === "" ? null : cityKey;
}

/**
 * Товары из города покупателя + без указанного города («везде»).
 *
 * @param {string} buyerCityKey
 */
export function buildProductSaleCityMatch(buyerCityKey) {
  const cityKey = normalizeRuCityKey(buyerCityKey);
  if (cityKey === "") {
    return null;
  }

  const legacyMatch = buildLegacyProductSaleCityRegexMatch(cityKey);

  return {
    $or: [
      { productSaleCityNormalized: cityKey },
      legacyMatch,
      {
        $or: [
          { productSaleCity: { $in: [null, ""] } },
          { productSaleCity: { $exists: false } },
        ],
      },
    ],
  };
}

/**
 * @param {string} buyerCityKey
 * @returns {Record<string, unknown> | null}
 */
export function buildCatalogCitySortPriorityStage(buyerCityKey) {
  const cityKey = normalizeRuCityKey(buyerCityKey);
  if (cityKey === "") {
    return null;
  }

  return {
    $addFields: {
      _citySortPriority: {
        $cond: [{ $eq: ["$productSaleCityNormalized", cityKey] }, 0, 1],
      },
    },
  };
}

/** @returns {Record<string, unknown>} */
export function buildCatalogCitySortStage() {
  return {
    $sort: {
      _citySortPriority: 1,
      productSaleCity: 1,
      createdAt: -1,
    },
  };
}

/** @returns {Record<string, unknown>} */
export function buildCatalogCitySortStagePlain() {
  return {
    $sort: {
      productSaleCity: 1,
      createdAt: -1,
    },
  };
}
