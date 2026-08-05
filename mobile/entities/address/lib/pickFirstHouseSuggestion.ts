import type { AddressSuggestionDto } from "../model/types";

export const pickFirstHouseSuggestion = (
  suggestions: AddressSuggestionDto[] | null | undefined,
): AddressSuggestionDto | null => {
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
};
