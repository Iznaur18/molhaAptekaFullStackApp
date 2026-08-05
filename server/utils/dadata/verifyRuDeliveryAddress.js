import { resolveRuRegionCodeFromDadataData } from "@molha/api-contract";

import {
  ADDRESS_FLAT_MAX_LENGTH,
  ADDRESS_LINE_MAX_LENGTH,
  DADATA_QC_COMPLETE_MAX,
  DADATA_QC_GEO_MAX,
} from "../../constants/dadataConstants.js";
import { cleanRuAddress, isDadataConfigured } from "./dadataClient.js";

/**
 * @param {string} line
 * @param {string} flat
 */
export function buildAddressQueryForClean(line, flat) {
  const base = String(line).trim();
  const apartment = String(flat).trim();
  if (!apartment) return base;
  return `${base}, кв ${apartment}`;
}

/**
 * @param {Record<string, unknown>} cleaned
 * @returns {string | null}
 */
function pickFlatFromCleaned(cleaned) {
  const flat = cleaned.flat;
  if (flat == null) return null;
  const text = String(flat).trim();
  return text === "" ? null : text;
}

/**
 * @param {Record<string, unknown>} cleaned
 * @returns {string | null}
 */
function pickStringField(cleaned, key) {
  const raw = cleaned[key];
  if (raw == null) return null;
  const text = String(raw).trim();
  return text === "" ? null : text;
}

/**
 * @param {Record<string, unknown>} cleaned
 */
function pickStructuredFromCleaned(cleaned) {
  const city =
    pickStringField(cleaned, "city") ?? pickStringField(cleaned, "settlement") ?? "";
  const district =
    pickStringField(cleaned, "city_district") ?? pickStringField(cleaned, "area") ?? "";
  const street =
    pickStringField(cleaned, "street") ?? pickStringField(cleaned, "stead") ?? "";
  const house =
    pickStringField(cleaned, "house") ?? pickStringField(cleaned, "block") ?? "";

  return { city, district, street, house };
}

/**
 * @param {string} line
 * @param {string} flatInput
 */
function softAcceptVerifiedAddress(line, flatInput) {
  return {
    displayAddress: line,
    flat: flatInput,
    fiasId: "",
    geo: null,
    city: "",
    district: "",
    street: "",
    house: "",
    regionCode: null,
  };
}

/**
 * @param {{ addressLine: string; flat?: string }} params
 * @returns {Promise<{
 *   displayAddress: string;
 *   flat: string;
 *   fiasId: string;
 *   geo: { lat: number; lon: number } | null;
 *   city: string;
 *   district: string;
 *   street: string;
 *   house: string;
 *   regionCode: string | null;
 * }>}
 */
export async function verifyRuDeliveryAddress({ addressLine, flat = "" }) {
  const line = String(addressLine ?? "").trim();
  const flatInput = String(flat ?? "").trim();

  if (line.length === 0) {
    throw new Error("Укажите адрес доставки");
  }
  if (line.length > ADDRESS_LINE_MAX_LENGTH) {
    throw new Error(`Адрес не длиннее ${ADDRESS_LINE_MAX_LENGTH} символов`);
  }
  if (flatInput.length > ADDRESS_FLAT_MAX_LENGTH) {
    throw new Error(`Квартира: не более ${ADDRESS_FLAT_MAX_LENGTH} символов`);
  }

  if (!isDadataConfigured()) {
    return softAcceptVerifiedAddress(line, flatInput);
  }

  let cleaned;
  try {
    cleaned = await cleanRuAddress(buildAddressQueryForClean(line, flatInput));
  } catch {
    // DaData clean недоступен — не блокируем заказ, принимаем введённую строку.
    return softAcceptVerifiedAddress(line, flatInput);
  }

  const cleanedFlat = pickFlatFromCleaned(cleaned) ?? flatInput;

  // Clean часто даёт qc_complete=5 / qc_geo=2 даже при валидном house_fias_id (FIAS).
  // Источник истины для «до дома» — house_fias_id, не мягкие qc-пороги suggest≠clean.
  const fiasIdRaw = cleaned.house_fias_id;
  const fiasId = fiasIdRaw != null ? String(fiasIdRaw).trim() : "";
  if (!fiasId) {
    const qcComplete = Number(cleaned.qc_complete ?? 10);
    if (Number.isNaN(qcComplete) || qcComplete > DADATA_QC_COMPLETE_MAX) {
      throw new Error("Адрес неполный — выберите вариант из подсказок DaData");
    }
    const qcGeo = Number(cleaned.qc_geo ?? 10);
    if (Number.isNaN(qcGeo) || qcGeo > DADATA_QC_GEO_MAX) {
      throw new Error("Уточните адрес до дома (улица и номер дома)");
    }
    throw new Error("Не удалось определить дом по адресу");
  }

  const resultLine =
    typeof cleaned.result === "string" && cleaned.result.trim() !== ""
      ? cleaned.result.trim()
      : line;
  const displayAddress =
    resultLine.length > ADDRESS_LINE_MAX_LENGTH
      ? resultLine.slice(0, ADDRESS_LINE_MAX_LENGTH)
      : resultLine;

  const lat = Number(cleaned.geo_lat);
  const lon = Number(cleaned.geo_lon);
  const geo = Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
  const structured = pickStructuredFromCleaned(cleaned);

  return {
    displayAddress,
    flat: cleanedFlat,
    fiasId,
    geo,
    city: structured.city,
    district: structured.district,
    street: structured.street,
    house: structured.house,
    regionCode: resolveRuRegionCodeFromDadataData(cleaned),
  };
}
