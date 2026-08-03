export type RuDeliveryAddressValue = {
  line: string;
  flat: string;
  fiasId: string;
  geo: { lat: number; lon: number } | null;
  regionCode?: string | null;
  selectedFromSuggest: boolean;
};

export type AddressSuggestionDto = {
  value: string;
  unrestrictedValue?: string;
  data?: Record<string, unknown>;
};
