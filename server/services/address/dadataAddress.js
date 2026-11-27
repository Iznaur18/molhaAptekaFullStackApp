import { DADATA_SUGGEST_COUNT } from "../../constants/dadataConstants.js";
import { AppError } from "../../errors/AppError.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  geolocateRuAddresses,
  isDadataSuggestConfigured,
  suggestRuAddresses,
} from "../../utils/dadata/dadataClient.js";

/**
 * @param {{ value: string; unrestricted_value?: string; data?: unknown }} item
 */
const toSuggestionPayload = (item) => ({
  value: item.value,
  unrestrictedValue: item.unrestricted_value,
  data: item.data,
});

/**
 * @param {{ query: unknown }} args
 */
export async function suggestAddresses({ query }) {
  const q = String(query ?? "").trim();

  // Suggest API нужен только Token (API key). SECRET — для cleaner; раньше
  // из‑за isDadataConfigured() подсказки молча пустели при одном API key.
  if (!isDadataSuggestConfigured()) {
    return { suggestions: [], configured: false };
  }

  try {
    const suggestions = await suggestRuAddresses(q);
    return {
      configured: true,
      suggestions: suggestions.map(toSuggestionPayload),
    };
  } catch (error) {
    logServerEvent("error", {
      event: "address.suggest_failed",
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(503, "Подсказки адресов временно недоступны");
  }
}

/**
 * @param {{ lat: unknown; lon: unknown }} args
 */
export async function geolocateAddresses({ lat, lon }) {
  if (!isDadataSuggestConfigured()) {
    return { suggestions: [], configured: false };
  }

  try {
    const suggestions = await geolocateRuAddresses(Number(lat), Number(lon), {
      count: DADATA_SUGGEST_COUNT,
      radiusMeters: 300,
    });
    return {
      configured: true,
      suggestions: suggestions.map(toSuggestionPayload),
    };
  } catch (error) {
    logServerEvent("error", {
      event: "address.geolocate_failed",
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(503, "Определение адреса по карте временно недоступно");
  }
}
