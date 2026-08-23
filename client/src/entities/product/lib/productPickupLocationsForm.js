import {
  PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
  PRODUCT_PICKUP_LOCATIONS_MAX,
  PRODUCT_PICKUP_LOCATION_LABEL_MAX_LENGTH,
  ensureSingleDefaultProductPickupLocation,
  productPickupLocationDuplicateKey,
  productPickupLocationsFromProduct,
  syncLegacyPickupFieldsFromLocations,
} from "@molha/api-contract";

import { splitAddressForForm } from "../../address/lib/splitAddressForForm.js";
import { fetchAddressSuggestions } from "../../address/api/fetchAddressSuggestions.js";
import { mapDadataSuggestion } from "../../address/lib/mapDadataSuggestion.js";
import { pickFirstHouseSuggestion } from "../../address/lib/pickFirstHouseSuggestion.js";
import { ADDRESS_SUGGEST_MIN_QUERY_LENGTH } from "../../address/model/constants.js";

/**
 * @typedef {{
 *   id: string;
 *   label: string;
 *   address: string;
 *   lat: number | null;
 *   lon: number | null;
 *   isDefault: boolean;
 *   selectedFromSuggest?: boolean;
 * }} ProductPickupLocationFormValue
 */

/**
 * @returns {string}
 */
export function createProductPickupLocationId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `pickup_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * @returns {ProductPickupLocationFormValue}
 */
export function createEmptyProductPickupLocationDraft() {
  return {
    id: "",
    label: "",
    address: "",
    lat: null,
    lon: null,
    isDefault: false,
    selectedFromSuggest: false,
  };
}

/**
 * @param {unknown} product
 * @returns {ProductPickupLocationFormValue[]}
 */
export function productPickupLocationsFromApiProduct(product) {
  return productPickupLocationsFromProduct(product).map((item) => ({
    ...item,
    selectedFromSuggest:
      String(item.address ?? "").trim().length >= PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
  }));
}

/**
 * @param {ProductPickupLocationFormValue[]} locations
 */
export function legacyPickupFieldsFromLocations(locations) {
  const synced = syncLegacyPickupFieldsFromLocations(locations);
  return {
    productPickupAddress: synced.productPickupAddress,
    productPickupLat: synced.productPickupLat,
    productPickupLon: synced.productPickupLon,
    productPickupSelectedFromSuggest:
      String(synced.productPickupAddress ?? "").trim().length >=
      PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
  };
}

/**
 * @param {ProductPickupLocationFormValue[]} locations
 * @returns {string | null}
 */
export function validateProductPickupLocationsForm(locations) {
  const list = Array.isArray(locations) ? locations : [];
  if (list.length === 0) {
    return "Добавьте хотя бы одну точку самовывоза / отправления";
  }
  if (list.length > PRODUCT_PICKUP_LOCATIONS_MAX) {
    return `Не больше ${PRODUCT_PICKUP_LOCATIONS_MAX} точек самовывоза`;
  }
  if (!list.some((item) => item.isDefault)) {
    return "Укажите одну точку по умолчанию";
  }

  const keys = new Set();
  for (const item of list) {
    const label = String(item.label ?? "").trim();
    if (label.length > PRODUCT_PICKUP_LOCATION_LABEL_MAX_LENGTH) {
      return `Метка не длиннее ${PRODUCT_PICKUP_LOCATION_LABEL_MAX_LENGTH} символов`;
    }
    const address = String(item.address ?? "").trim();
    if (address.length < PRODUCT_PICKUP_ADDRESS_MIN_LENGTH) {
      return "Укажите адрес продажи";
    }
    const hasLat = item.lat != null && Number.isFinite(Number(item.lat));
    const hasLon = item.lon != null && Number.isFinite(Number(item.lon));
    if (!hasLat || !hasLon) {
      return "Укажите точку на карте или выберите адрес из подсказки";
    }
    const key = productPickupLocationDuplicateKey(address);
    if (keys.has(key)) {
      return "Такой адрес уже добавлен";
    }
    keys.add(key);
  }

  return null;
}

/**
 * @param {{ line?: string; address?: string; flat?: string }} saved
 */
export function savedAddressPickupLine(saved) {
  const { line } = splitAddressForForm(
    String(saved?.line ?? saved?.address ?? ""),
    String(saved?.flat ?? ""),
  );
  return String(line ?? "").trim();
}

/**
 * @param {{ line?: string; address?: string; flat?: string }} saved
 * @param {ProductPickupLocationFormValue[]} locations
 */
export function isSavedAddressInPickupLocations(saved, locations) {
  const line = savedAddressPickupLine(saved).toLowerCase();
  if (!line) {
    return false;
  }
  return (Array.isArray(locations) ? locations : []).some(
    (item) => String(item?.address ?? "").trim().toLowerCase() === line,
  );
}

/**
 * Keep only explicitly selected profile points + custom points added via map/input.
 *
 * @param {ProductPickupLocationFormValue[]} locations
 * @param {Array<{ id?: string; line?: string; flat?: string }>} profileAddresses
 * @param {Set<string> | Iterable<string>} selectedProfileIds
 * @param {Set<string> | Iterable<string>} [confirmedCustomLocationIds]
 */
export function pruneProductPickupLocationsToSelection(
  locations,
  profileAddresses,
  selectedProfileIds,
  confirmedCustomLocationIds = new Set(),
) {
  const list = Array.isArray(locations) ? locations : [];
  const profiles = Array.isArray(profileAddresses) ? profileAddresses : [];
  if (list.length === 0) {
    return [];
  }

  if (profiles.length === 0) {
    return list;
  }

  const selectedIdSet = new Set(
    [...selectedProfileIds].map((id) => String(id ?? "").trim()).filter(Boolean),
  );
  const confirmedCustomIdSet = new Set(
    [...confirmedCustomLocationIds].map((id) => String(id ?? "").trim()).filter(Boolean),
  );

  return list.filter((item) => {
    const locationId = String(item.id ?? "").trim();
    if (locationId && confirmedCustomIdSet.has(locationId)) {
      return true;
    }

    return profiles.some(
      (saved) =>
        selectedIdSet.has(String(saved.id ?? "")) &&
        isSavedAddressInPickupLocations(saved, [item]),
    );
  });
}

/**
 * @param {ProductPickupLocationFormValue[]} left
 * @param {ProductPickupLocationFormValue[]} right
 */
export function areProductPickupLocationListsEqual(left, right) {
  const a = Array.isArray(left) ? left : [];
  const b = Array.isArray(right) ? right : [];
  if (a.length !== b.length) {
    return false;
  }
  return a.every((item, index) => {
    const other = b[index];
    return (
      String(item.id ?? "") === String(other?.id ?? "") &&
      productPickupLocationDuplicateKey(item.address) ===
        productPickupLocationDuplicateKey(other?.address)
    );
  });
}

/**
 * @param {{ lat?: number | null; lon?: number | null } | null | undefined} geo
 */
export function hasValidPickupGeo(geo) {
  const lat = Number(geo?.lat);
  const lon = Number(geo?.lon);
  return Number.isFinite(lat) && Number.isFinite(lon);
}

/**
 * @param {{
 *   line?: string;
 *   address?: string;
 *   flat?: string;
 *   geo?: { lat?: number; lon?: number } | null;
 * }} saved
 * @returns {Promise<{ lat: number; lon: number } | null>}
 */
export async function resolvePickupGeoForSavedAddress(saved) {
  if (hasValidPickupGeo(saved?.geo)) {
    return { lat: Number(saved.geo.lat), lon: Number(saved.geo.lon) };
  }

  const line = savedAddressPickupLine(saved);
  if (line.length < ADDRESS_SUGGEST_MIN_QUERY_LENGTH) {
    return null;
  }

  try {
    const suggestions = await fetchAddressSuggestions(line);
    const pick = pickFirstHouseSuggestion(suggestions);
    if (!pick) {
      return null;
    }
    const mapped = mapDadataSuggestion(pick);
    if (!hasValidPickupGeo(mapped.geo)) {
      return null;
    }
    return { lat: Number(mapped.geo.lat), lon: Number(mapped.geo.lon) };
  } catch {
    return null;
  }
}

/**
 * @param {{
 *   label?: string;
 *   line?: string;
 *   address?: string;
 *   flat?: string;
 *   geo?: { lat?: number; lon?: number } | null;
 * }} saved
 * @returns {ProductPickupLocationFormValue}
 */
export function createPickupLocationFromSaved(saved) {
  const hasGeo = hasValidPickupGeo(saved?.geo);
  const profileId = String(saved?.id ?? "").trim();
  return {
    id: profileId || createProductPickupLocationId(),
    label: String(saved?.label ?? "").trim(),
    address: savedAddressPickupLine(saved),
    lat: hasGeo ? Number(saved.geo.lat) : null,
    lon: hasGeo ? Number(saved.geo.lon) : null,
    isDefault: false,
    selectedFromSuggest: true,
  };
}

/**
 * @param {ProductPickupLocationFormValue[]} locations
 * @param {string} addressLine
 */
export function removePickupLocationByAddressLine(locations, addressLine) {
  const key = String(addressLine ?? "").trim().toLowerCase();
  if (!key) {
    return ensureSingleDefaultProductPickupLocation(locations);
  }
  return ensureSingleDefaultProductPickupLocation(
    (Array.isArray(locations) ? locations : []).filter(
      (item) => String(item?.address ?? "").trim().toLowerCase() !== key,
    ),
  );
}

/**
 * @param {ProductPickupLocationFormValue} location
 */
export function pickupAddressValueFromLocation(location) {
  return {
    line: String(location?.address ?? "").trim(),
    flat: "",
    fiasId: "",
    geo:
      hasValidPickupGeo({ lat: location?.lat, lon: location?.lon })
        ? { lat: Number(location.lat), lon: Number(location.lon) }
        : null,
    regionCode: null,
    selectedFromSuggest: location?.selectedFromSuggest === true,
  };
}

/**
 * @param {ProductPickupLocationFormValue[]} locations
 * @param {Array<{ id?: string; line?: string; flat?: string }>} profileAddresses
 */
export function findCustomPickupLocations(locations, profileAddresses) {
  return (Array.isArray(locations) ? locations : []).filter(
    (item) =>
      !profileAddresses.some((saved) => isSavedAddressInPickupLocations(saved, [item])),
  );
}

/**
 * @param {Array<{ id?: string; line?: string; flat?: string }>} profileAddresses
 * @param {ProductPickupLocationFormValue[]} locations
 */
export function selectedProfileAddressIdsFromLocations(profileAddresses, locations) {
  return profileAddresses
    .filter((item) => isSavedAddressInPickupLocations(item, locations))
    .map((item) => String(item.id ?? ""))
    .filter(Boolean);
}

/**
 * @param {ProductPickupLocationFormValue[]} locations
 */
export function serializeProductPickupLocationsForApi(locations) {
  return ensureSingleDefaultProductPickupLocation(locations).map((item) => ({
    id: String(item.id ?? "").trim(),
    label: String(item.label ?? "").trim(),
    address: String(item.address ?? "").trim(),
    lat: Number(item.lat),
    lon: Number(item.lon),
    isDefault: item.isDefault === true,
  }));
}

export { ensureSingleDefaultProductPickupLocation, PRODUCT_PICKUP_LOCATIONS_MAX };
