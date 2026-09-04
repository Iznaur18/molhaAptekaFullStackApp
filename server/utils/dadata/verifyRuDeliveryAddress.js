import {
  dadataSuggestionGeo,
  dadataSuggestionObjectFiasId,
  hasDadataSuggestionHouseNumber,
  resolveRuRegionCodeFromDadataData,
} from "@molha/api-contract";

import {
  ADDRESS_FLAT_MAX_LENGTH,
  ADDRESS_LINE_MAX_LENGTH,
  DADATA_QC_COMPLETE_MAX,
  DADATA_QC_GEO_MAX,
} from "../../constants/dadataConstants.js";
import {
  cleanRuAddress,
  isDadataConfigured,
  isDadataSuggestConfigured,
  suggestRuAddresses,
} from "./dadataClient.js";

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
 * Разбор одной подсказки DaData в тот же формат, что даёт clean.
 *
 * Принимаем адрес, только если он доведён до дома: либо у него есть
 * идентификатор объекта в ФИАС (`house_fias_id` / `stead_fias_id`), либо DaData
 * хотя бы разобрала номер дома. Дома, которого нет в ФИАС, — обычное дело:
 * «г Грозный, р-н Ахматовский, ул Субры Кишиевой, д 56» приходит с `house: 56`,
 * пустым `house_fias_id` и координатами улицы. Без этой ветки такой адрес
 * сохранялся вообще без координат, и продавец не мог сделать его точкой
 * отправления товара. Подсказку без разобранного дома по-прежнему отбрасываем:
 * иначе к произвольной строке прилипнет центр улицы или города.
 *
 * @param {{ value?: unknown; data?: unknown } | null | undefined} suggestion
 * @param {{ line: string; flatInput: string }} context
 * @returns {ReturnType<typeof softAcceptVerifiedAddress> | null}
 */
export function mapSuggestionToVerifiedAddress(suggestion, { line, flatInput }) {
  const data = suggestion?.data;
  if (!data || typeof data !== "object") return null;

  const geo = dadataSuggestionGeo(data);
  if (!geo) return null;

  const fiasId = dadataSuggestionObjectFiasId(data);
  if (!fiasId && !hasDadataSuggestionHouseNumber(data)) return null;

  const structured = pickStructuredFromCleaned(data);
  const value = suggestion?.value;
  const resultLine =
    typeof value === "string" && value.trim() !== "" ? value.trim() : line;

  return {
    displayAddress:
      resultLine.length > ADDRESS_LINE_MAX_LENGTH
        ? resultLine.slice(0, ADDRESS_LINE_MAX_LENGTH)
        : resultLine,
    flat: pickFlatFromCleaned(data) ?? flatInput,
    fiasId,
    geo,
    city: structured.city,
    district: structured.district,
    street: structured.street,
    // У участка `house` пустой, номер лежит в `stead` («уч 51»).
    house: structured.house || (pickStringField(data, "stead") ?? ""),
    regionCode: resolveRuRegionCodeFromDadataData(data),
  };
}

/**
 * Координаты из подсказок, когда «Стандартизация» (clean) недоступна.
 *
 * У DaData это две разные услуги: подсказки могут работать, а clean отвечать
 * 403 «Feature CLEAN disabled» — тогда сайт принимал адрес, но без координат,
 * и товар нельзя было ни привязать к точке самовывоза, ни найти в «рядом».
 * Поля в `suggestion.data` называются так же, как в ответе clean, поэтому
 * разбор общий.
 *
 * Обогащает, но **никогда не отклоняет**: если уверенности нет, возвращаем
 * `null`, и вызывающий код мягко принимает адрес как раньше. Иначе включение
 * фолбэка начало бы резать адреса, которые сейчас спокойно сохраняются.
 *
 * @param {string} line
 * @param {string} flatInput
 * @returns {Promise<ReturnType<typeof softAcceptVerifiedAddress> | null>}
 */
async function resolveFromSuggestions(line, flatInput) {
  if (!isDadataSuggestConfigured()) return null;

  let suggestions;
  try {
    suggestions = await suggestRuAddresses(
      buildAddressQueryForClean(line, flatInput),
    );
  } catch {
    return null;
  }

  const top = Array.isArray(suggestions) ? suggestions[0] : null;
  return mapSuggestionToVerifiedAddress(top, { line, flatInput });
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
    // Секрет для clean не задан — координаты всё ещё можно взять из подсказок.
    return (
      (await resolveFromSuggestions(line, flatInput)) ??
      softAcceptVerifiedAddress(line, flatInput)
    );
  }

  let cleaned;
  try {
    cleaned = await cleanRuAddress(buildAddressQueryForClean(line, flatInput));
  } catch {
    // DaData clean недоступен (не оплачен, лимит, сбой) — не блокируем заказ,
    // но пробуем достать координаты подсказками, прежде чем сдаться.
    return (
      (await resolveFromSuggestions(line, flatInput)) ??
      softAcceptVerifiedAddress(line, flatInput)
    );
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
