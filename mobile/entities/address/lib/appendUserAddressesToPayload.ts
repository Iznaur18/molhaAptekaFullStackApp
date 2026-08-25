import type { UserSavedAddressFormValue } from "@/entities/address/model/userSavedAddressTypes";

/**
 * Книга адресов в тело PATCH профиля.
 * Порт `client/src/entities/address/lib/appendUserAddressesToPayload.js`.
 */
export const appendUserAddressesToPayload = (
  payload: Record<string, unknown>,
  addresses: UserSavedAddressFormValue[],
): void => {
  payload.userAddresses = addresses.map((item) => ({
    id: String(item.id ?? "").trim(),
    label: String(item.label ?? "").trim() || null,
    line: String(item.line ?? "").trim(),
    flat: String(item.flat ?? "").trim(),
    isDefault: item.isDefault === true,
  }));
};
