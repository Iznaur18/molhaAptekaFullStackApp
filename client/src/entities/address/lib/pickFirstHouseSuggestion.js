import { pickAddressSuggestionForGeo } from "@molha/api-contract";

/**
 * Первая подсказка до дома/участка — общий критерий с контрактом
 * (`pickAddressSuggestionForGeo`): ФИАС или номер дома/участка с координатами.
 *
 * @param {import('../model/types.js').AddressSuggestionDto[]} suggestions
 * @returns {import('../model/types.js').AddressSuggestionDto | null}
 */
export function pickFirstHouseSuggestion(suggestions) {
  return pickAddressSuggestionForGeo(suggestions);
}
