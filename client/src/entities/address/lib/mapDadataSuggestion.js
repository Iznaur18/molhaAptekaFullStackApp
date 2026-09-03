import { resolveRuRegionCodeFromDadataData } from "@molha/api-contract";

/**
 * @param {import('../model/types.js').AddressSuggestionDto} suggestion
 * @returns {{
 *   line: string;
 *   fiasId: string;
 *   geo: { lat: number; lon: number } | null;
 *   regionCode: string | null;
 * }}
 */
export function mapDadataSuggestion(suggestion) {
  const data = suggestion.data ?? {};
  // У адреса на участке дома нет: идентификатор лежит в `stead_fias_id`.
  // Сервер читает оба поля, поэтому и здесь берём первый непустой — иначе
  // адрес «уч 27а» сохранялся без идентификатора.
  const fiasId =
    [data.house_fias_id, data.stead_fias_id]
      .map((value) => String(value ?? "").trim())
      .find((value) => value.length > 0) ?? "";

  const lat = Number(data.geo_lat);
  const lon = Number(data.geo_lon);
  const geo = Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;

  return {
    line: suggestion.value?.trim() ?? "",
    fiasId,
    geo,
    regionCode: resolveRuRegionCodeFromDadataData(data),
  };
}
