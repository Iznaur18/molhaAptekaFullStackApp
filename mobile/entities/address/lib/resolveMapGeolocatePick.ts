import { pickFirstHouseSuggestion } from "./pickFirstHouseSuggestion";
import type { AddressSuggestionDto } from "../model/types";

export const resolveMapGeolocatePick = (
  suggestions: AddressSuggestionDto[] | null | undefined,
): { suggestion: AddressSuggestionDto; isHouse: boolean } | null => {
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
};
