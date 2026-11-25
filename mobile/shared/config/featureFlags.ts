const readBoolEnv = (raw: string | undefined, defaultValue: boolean): boolean => {
  if (raw === undefined || raw === "") {
    return defaultValue;
  }

  const normalized = String(raw).trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return defaultValue;
};

/** Паритет web `VITE_FF_CATALOG_BROWSER_SUBCATEGORY_FILTER` (дефолт true). */
export const IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED = readBoolEnv(
  process.env.EXPO_PUBLIC_FF_CATALOG_BROWSER_SUBCATEGORY_FILTER,
  true,
);

export const IS_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST_ENABLED = readBoolEnv(
  process.env.EXPO_PUBLIC_FF_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST,
  false,
);
