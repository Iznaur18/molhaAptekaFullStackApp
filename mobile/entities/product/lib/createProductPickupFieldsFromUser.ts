import { addressValueFromUser } from "@/entities/address/lib/addressValueFromUser";

type UserAddressSource = {
  userAddress?: string;
  userAddressFiasId?: string;
  userAddressGeo?: { lat?: number; lon?: number } | null;
};

export const createProductPickupFieldsFromUser = (
  user?: UserAddressSource | Record<string, unknown> | null,
) => {
  const address = addressValueFromUser(user);
  return {
    productPickupAddress: address.line,
    productPickupLat: address.geo?.lat ?? null,
    productPickupLon: address.geo?.lon ?? null,
    productPickupSelectedFromSuggest: address.selectedFromSuggest === true,
  };
};
