import { DADATA_SUGGEST_COUNT } from "../../constants/dadataConstants.js";

const SUGGEST_URL =
  "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
const CLEAN_URL = "https://cleaner.dadata.ru/api/v1/clean/address";

export function isDadataConfigured() {
  return Boolean(
    process.env.DADATA_API_KEY?.trim() && process.env.DADATA_SECRET_KEY?.trim(),
  );
}

function getSuggestHeaders() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Token ${process.env.DADATA_API_KEY.trim()}`,
  };
}

function getCleanHeaders() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Token ${process.env.DADATA_API_KEY.trim()}`,
    "X-Secret": process.env.DADATA_SECRET_KEY.trim(),
  };
}

/**
 * @param {string} query
 * @returns {Promise<{ value: string; unrestricted_value: string; data: Record<string, unknown> }[]>}
 */
export async function suggestRuAddresses(query) {
  const response = await fetch(SUGGEST_URL, {
    method: "POST",
    headers: getSuggestHeaders(),
    body: JSON.stringify({
      query,
      count: DADATA_SUGGEST_COUNT,
      from_bound: { value: "city" },
      to_bound: { value: "house" },
      locations: [{ country: "Россия" }],
    }),
  });

  if (!response.ok) {
    throw new Error(`DaData suggest: HTTP ${response.status}`);
  }

  const json = await response.json();
  return Array.isArray(json?.suggestions) ? json.suggestions : [];
}

/**
 * @param {string} addressLine
 * @returns {Promise<Record<string, unknown>>}
 */
export async function cleanRuAddress(addressLine) {
  const response = await fetch(CLEAN_URL, {
    method: "POST",
    headers: getCleanHeaders(),
    body: JSON.stringify([addressLine]),
  });

  if (!response.ok) {
    throw new Error(`DaData clean: HTTP ${response.status}`);
  }

  const json = await response.json();
  const row = Array.isArray(json) ? json[0] : null;
  if (!row || typeof row !== "object") {
    throw new Error("DaData clean: пустой ответ");
  }
  return row;
}
