import {
  dadataSuggestionGeo,
  dadataSuggestionObjectFiasId,
  hasDadataSuggestionHouseNumber,
  resolveRuRegionCodeFromDadataData,
} from "@molha/api-contract";

/**
 * @param {import('../model/types.js').AddressSuggestionDto | null | undefined} suggestion
 * @returns {boolean}
 */
export function isCompleteDadataAddressSuggestion(suggestion) {
  const data = suggestion?.data;
  if (dadataSuggestionObjectFiasId(data).length > 0) {
    return true;
  }
  return hasDadataSuggestionHouseNumber(data) && dadataSuggestionGeo(data) != null;
}

/**
 * @param {import('../model/types.js').AddressSuggestionDto} suggestion
 * @returns {{
 *   line: string;
 *   fiasId: string;
 *   geo: { lat: number; lon: number } | null;
 *   regionCode: string | null;
 *   isComplete: boolean;
 * }}
 */
export function mapDadataSuggestion(suggestion) {
  const data = suggestion.data ?? {};
  // У адреса на участке дома нет: идентификатор лежит в `stead_fias_id`.
  // Сервер читает оба поля, поэтому и здесь берём первый непустой — иначе
  // адрес «уч 27а» сохранялся без идентификатора.
  const fiasId = dadataSuggestionObjectFiasId(data);
  const geo = dadataSuggestionGeo(data);

  return {
    line: suggestion.value?.trim() ?? "",
    fiasId,
    geo,
    regionCode: resolveRuRegionCodeFromDadataData(data),
    isComplete: isCompleteDadataAddressSuggestion(suggestion),
  };
}
