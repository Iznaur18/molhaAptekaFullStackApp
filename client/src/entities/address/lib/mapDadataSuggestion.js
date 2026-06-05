/**
 * @param {import('../model/types.js').AddressSuggestionDto} suggestion
 * @returns {{ line: string; fiasId: string; geo: { lat: number; lon: number } | null }}
 */
export function mapDadataSuggestion(suggestion) {
  const data = suggestion.data ?? {};
  const fiasIdRaw = data.house_fias_id ?? data.fias_id;
  const fiasId = fiasIdRaw != null ? String(fiasIdRaw).trim() : "";

  const lat = Number(data.geo_lat);
  const lon = Number(data.geo_lon);
  const geo = Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;

  return {
    line: suggestion.value?.trim() ?? "",
    fiasId,
    geo,
  };
}
