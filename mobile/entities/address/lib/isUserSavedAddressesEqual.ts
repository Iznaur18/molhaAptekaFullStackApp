import { userSavedAddressDuplicateKey } from "@molha/api-contract";

import type { UserSavedAddressFormValue } from "@/entities/address/model/userSavedAddressTypes";

/** Порт `client/src/entities/address/lib/isUserSavedAddressesEqual.js`. */
export const isUserSavedAddressEqual = (
  a: UserSavedAddressFormValue | null | undefined,
  b: UserSavedAddressFormValue | null | undefined,
): boolean =>
  String(a?.id ?? "") === String(b?.id ?? "") &&
  String(a?.label ?? "").trim() === String(b?.label ?? "").trim() &&
  String(a?.line ?? "").trim() === String(b?.line ?? "").trim() &&
  String(a?.flat ?? "").trim() === String(b?.flat ?? "").trim() &&
  Boolean(a?.isDefault) === Boolean(b?.isDefault);

/** Сравнение без учёта порядка — списки сортируются по id. */
export const isUserSavedAddressesEqual = (
  a: UserSavedAddressFormValue[] | null | undefined,
  b: UserSavedAddressFormValue[] | null | undefined,
): boolean => {
  const left = Array.isArray(a) ? a : [];
  const right = Array.isArray(b) ? b : [];

  if (left.length !== right.length) {
    return false;
  }

  const sortById = (list: UserSavedAddressFormValue[]) =>
    [...list].sort((itemA, itemB) => String(itemA.id).localeCompare(String(itemB.id)));

  const sortedLeft = sortById(left);
  const sortedRight = sortById(right);

  return sortedLeft.every((item, index) => isUserSavedAddressEqual(item, sortedRight[index]));
};

/** Ключ первого повтора «улица + квартира» или null. */
export const findDuplicateUserSavedAddressKey = (
  addresses: UserSavedAddressFormValue[],
): string | null => {
  const keys = new Set<string>();

  for (const item of addresses) {
    const key = userSavedAddressDuplicateKey(item.line, item.flat);
    if (keys.has(key)) {
      return key;
    }
    keys.add(key);
  }

  return null;
};
