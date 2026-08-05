/**
 * @param {import('../model/types.js').AddressSuggestionDto[]} suggestions
 * @returns {import('../model/types.js').AddressSuggestionDto | null}
 */
export function pickFirstHouseSuggestion(suggestions) {
  if (!Array.isArray(suggestions)) {
    return null;
  }
  for (const item of suggestions) {
    const fiasId = item?.data?.house_fias_id;
    if (fiasId != null && String(fiasId).trim().length > 0) {
      return item;
    }
  }
  return null;
}
