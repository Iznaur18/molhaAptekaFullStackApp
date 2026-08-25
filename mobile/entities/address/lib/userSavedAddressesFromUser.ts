import {
  userSavedAddressDuplicateKey,
  userSavedAddressesFromProfile,
} from "@molha/api-contract";

import { ensureSingleDefaultUserSavedAddress } from "@/entities/address/lib/ensureSingleDefaultUserSavedAddress";
import type { UserSavedAddressFormValue } from "@/entities/address/model/userSavedAddressTypes";

/** @deprecated форма записи совпала с формой профиля — используйте UserSavedAddressFormValue */
export type UserSavedAddressReadOnly = UserSavedAddressFormValue;

const normalizeUserGeo = (
  geo: { lat?: unknown; lon?: unknown } | null | undefined,
): { lat: number; lon: number } | null => {
  const lat = Number(geo?.lat);
  const lon = Number(geo?.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
};

/**
 * Легаси-адрес из полей `userAddress*` приходит с id "legacy-default" —
 * это один и тот же id у всех, поэтому выводим стабильный из самого адреса,
 * иначе редактирование и удаление промахиваются мимо строки.
 */
const createStableLegacyAddressId = (line: string, flat: string): string => {
  const key = userSavedAddressDuplicateKey(line, flat);
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return `legacy-${hash.toString(36)}`;
};

/**
 * Книга адресов профиля в значения формы.
 * Порт `client/src/entities/address/lib/userSavedAddressesFromUser.js`.
 */
export const userSavedAddressesFromUser = (
  user: Record<string, unknown> | null | undefined,
): UserSavedAddressFormValue[] => {
  const legacyGeo = normalizeUserGeo(
    user?.userAddressGeo as { lat?: unknown; lon?: unknown } | null | undefined,
  );
  const mapped = userSavedAddressesFromProfile(user ?? {}).map((item) => ({
    id:
      item.id === "legacy-default"
        ? createStableLegacyAddressId(item.line, item.flat)
        : item.id,
    label: item.label ?? "",
    line: item.line,
    flat: item.flat ?? "",
    fiasId: item.fiasId ?? "",
    geo:
      normalizeUserGeo(item.geo) ??
      (item.isDefault === true && legacyGeo ? legacyGeo : null),
    regionCode: null,
    selectedFromSuggest: item.line.length > 0,
    isDefault: item.isDefault === true,
  }));

  return ensureSingleDefaultUserSavedAddress(mapped);
};

export const createEmptyUserSavedAddressDraft = (): UserSavedAddressFormValue => ({
  id: "",
  label: "",
  line: "",
  flat: "",
  fiasId: "",
  geo: null,
  regionCode: null,
  selectedFromSuggest: false,
  isDefault: false,
});
