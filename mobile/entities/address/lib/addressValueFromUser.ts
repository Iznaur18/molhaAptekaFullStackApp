import type { RuDeliveryAddressValue } from "../model/types";

type UserAddressSource = {
  userAddress?: string;
  userAddressFiasId?: string;
  userAddressGeo?: { lat?: number; lon?: number } | null;
};

export const addressValueFromUser = (
  user?: UserAddressSource | Record<string, unknown> | null,
): RuDeliveryAddressValue => {
  const source = user as UserAddressSource | null | undefined;
  const line = String(source?.userAddress ?? "").trim();
  const fiasId = String(source?.userAddressFiasId ?? "").trim();
  const lat = Number(source?.userAddressGeo?.lat);
  const lon = Number(source?.userAddressGeo?.lon);
  const geo = Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;

  return {
    line,
    flat: "",
    fiasId,
    geo,
    selectedFromSuggest: line.length > 0,
  };
};
