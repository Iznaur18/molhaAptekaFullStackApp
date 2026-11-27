import {
  dadataSuggestionGeo,
  dadataSuggestionObjectFiasId,
  hasDadataSuggestionHouseNumber,
  resolveRuRegionCodeFromDadataData,
} from "@molha/api-contract";

import type { AddressSuggestionDto } from "../model/types";

/**
 * Подсказка «до дома/участка»: ФИАС-объект или разобранный номер с координатами.
 * Паритет с `pickAddressSuggestionForGeo` / server `mapSuggestionToVerifiedAddress`.
 */
export const isCompleteDadataAddressSuggestion = (
  suggestion: AddressSuggestionDto | null | undefined,
): boolean => {
  const data = suggestion?.data;
  if (dadataSuggestionObjectFiasId(data).length > 0) {
    return true;
  }
  return hasDadataSuggestionHouseNumber(data) && dadataSuggestionGeo(data) != null;
};

export const mapDadataSuggestion = (suggestion: AddressSuggestionDto) => {
  const data = suggestion.data ?? {};
  const fiasId = dadataSuggestionObjectFiasId(data);
  const geo = dadataSuggestionGeo(data);

  return {
    line: suggestion.value?.trim() ?? "",
    fiasId,
    geo,
    regionCode: resolveRuRegionCodeFromDadataData(data),
    isComplete: isCompleteDadataAddressSuggestion(suggestion),
  };
};
