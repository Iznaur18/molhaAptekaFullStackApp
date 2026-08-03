import { resolveRuRegionCodeFromDadataData } from "@molha/api-contract";

import type { AddressSuggestionDto } from "../model/types";

export const mapDadataSuggestion = (suggestion: AddressSuggestionDto) => {
  const data = suggestion.data ?? {};
  const fiasIdRaw = data.house_fias_id;
  const fiasId = fiasIdRaw != null ? String(fiasIdRaw).trim() : "";

  const lat = Number(data.geo_lat);
  const lon = Number(data.geo_lon);
  const geo = Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;

  return {
    line: suggestion.value?.trim() ?? "",
    fiasId,
    geo,
    regionCode: resolveRuRegionCodeFromDadataData(data),
  };
};
