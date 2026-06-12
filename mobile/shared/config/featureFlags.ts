const rawRequireAddressFromDadata =
  process.env.EXPO_PUBLIC_FF_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST ?? "";

export const IS_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST_ENABLED =
  rawRequireAddressFromDadata === "true" || rawRequireAddressFromDadata === "1";
