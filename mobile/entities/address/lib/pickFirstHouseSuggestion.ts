import { pickAddressSuggestionForGeo } from "@molha/api-contract";

import type { AddressSuggestionDto } from "../model/types";

/**
 * Первая подсказка до дома/участка — тот же критерий, что на сервере и в вебе
 * (`pickAddressSuggestionForGeo`): ФИАС или номер дома/участка с координатами.
 */
export const pickFirstHouseSuggestion = (
  suggestions: AddressSuggestionDto[] | null | undefined,
): AddressSuggestionDto | null =>
  pickAddressSuggestionForGeo(suggestions) as AddressSuggestionDto | null;
