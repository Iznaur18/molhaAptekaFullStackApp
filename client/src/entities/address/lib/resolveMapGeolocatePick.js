import { pickFirstHouseSuggestion } from "./pickFirstHouseSuggestion.js";

/**
 * @param {import('../model/types.js').AddressSuggestionDto[]} suggestions
 * @returns {{
 *   suggestion: import('../model/types.js').AddressSuggestionDto;
 *   isHouse: boolean;
 * } | null}
 */
export function resolveMapGeolocatePick(suggestions) {
  const house = pickFirstHouseSuggestion(suggestions);
  if (house) {
    return { suggestion: house, isHouse: true };
  }
  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    return null;
  }
  const first = suggestions.find((item) => String(item?.value ?? "").trim().length > 0);
  if (!first) {
    return null;
  }
  return { suggestion: first, isHouse: false };
}
