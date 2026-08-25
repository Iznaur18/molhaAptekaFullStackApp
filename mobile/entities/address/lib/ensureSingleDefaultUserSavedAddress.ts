import type { UserSavedAddressFormValue } from "@/entities/address/model/userSavedAddressTypes";

/**
 * Ровно один адрес по умолчанию: берём первый помеченный, а если помеченных
 * нет — первый в списке. Порт `client/.../ensureSingleDefaultUserSavedAddress.js`.
 */
export const ensureSingleDefaultUserSavedAddress = (
  addresses: UserSavedAddressFormValue[] | null | undefined,
): UserSavedAddressFormValue[] => {
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return [];
  }

  const defaultIndexes = addresses
    .map((item, index) => (item.isDefault ? index : -1))
    .filter((index) => index >= 0);
  const defaultIndex = defaultIndexes[0] ?? 0;

  return addresses.map((item, index) => ({
    ...item,
    isDefault: index === defaultIndex,
  }));
};
