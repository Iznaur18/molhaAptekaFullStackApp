import { userSavedAddressesFromProfile } from "@molha/api-contract";

import type { RuDeliveryAddressValue } from "../model/types";

type UserAddressSource = {
  userAddress?: string;
  userAddressFlat?: string;
  userAddressFiasId?: string;
  userAddressGeo?: { lat?: number; lon?: number } | null;
  userAddresses?: unknown;
};

export const addressValueFromUser = (
  user?: UserAddressSource | Record<string, unknown> | null,
): RuDeliveryAddressValue => {
  const source = user as UserAddressSource | null | undefined;
  const saved = userSavedAddressesFromProfile(source ?? {});
  const defaultSaved = saved.find((item) => item.isDefault) ?? saved[0];

  const line = String(defaultSaved?.line ?? source?.userAddress ?? "").trim();
  const flat = String(defaultSaved?.flat ?? source?.userAddressFlat ?? "").trim();
  const fiasId = String(source?.userAddressFiasId ?? "").trim();
  const lat = Number(source?.userAddressGeo?.lat);
  const lon = Number(source?.userAddressGeo?.lon);
  const geo = Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;

  return {
    line,
    flat,
    fiasId,
    geo,
    selectedFromSuggest: line.length > 0,
  };
};
