import { z } from "zod";

import {
  ADDRESS_FLAT_MAX_LENGTH,
  ADDRESS_LINE_MAX_LENGTH,
} from "./userFields.js";

export const USER_SAVED_ADDRESSES_MAX = 5;
export const USER_SAVED_ADDRESS_LABEL_MAX_LENGTH = 30;
export const USER_SAVED_ADDRESS_ID_MAX_LENGTH = 64;
export const USER_ADDRESS_PATCH_CONFLICT_MESSAGE =
  "Нельзя передавать userAddress и userAddresses в одном запросе";

/**
 * @param {string} line
 * @param {string} flat
 */
export function userSavedAddressDuplicateKey(line, flat) {
  return `${String(line ?? "").trim().toLowerCase()}|${String(flat ?? "").trim().toLowerCase()}`;
}

export const userSavedAddressPatchItemSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "id адреса обязателен")
    .max(
      USER_SAVED_ADDRESS_ID_MAX_LENGTH,
      `id адреса не длиннее ${USER_SAVED_ADDRESS_ID_MAX_LENGTH} символов`,
    ),
  label: z
    .union([z.string(), z.null(), z.literal("")])
    .optional()
    .transform((value) => {
      if (value === undefined || value === null || value === "") return "";
      return String(value).trim().slice(0, USER_SAVED_ADDRESS_LABEL_MAX_LENGTH);
    }),
  line: z
    .string()
    .trim()
    .max(ADDRESS_LINE_MAX_LENGTH, `Адрес не длиннее ${ADDRESS_LINE_MAX_LENGTH} символов`),
  flat: z
    .string()
    .trim()
    .max(ADDRESS_FLAT_MAX_LENGTH)
    .optional()
    .transform((value) => String(value ?? "").trim()),
  isDefault: z.boolean(),
});

export const userAddressesPatchFieldSchema = z
  .array(userSavedAddressPatchItemSchema)
  .max(USER_SAVED_ADDRESSES_MAX, `Не больше ${USER_SAVED_ADDRESSES_MAX} адресов`)
  .superRefine((items, ctx) => {
    if (items.length === 0) {
      return;
    }

    const keys = new Set();
    let defaultCount = 0;

    for (const item of items) {
      if (item.line === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Адрес не может быть пустым",
        });
        continue;
      }

      const key = userSavedAddressDuplicateKey(item.line, item.flat);
      if (keys.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Такой адрес уже добавлен",
        });
      } else {
        keys.add(key);
      }

      if (item.isDefault) {
        defaultCount += 1;
      }
    }

    if (defaultCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите один адрес по умолчанию",
      });
    }
  });

/**
 * @param {unknown} raw
 * @returns {Array<{
 *   id: string;
 *   label: string;
 *   line: string;
 *   flat: string;
 *   fiasId: string;
 *   geo: { lat: number; lon: number } | null;
 *   isDefault: boolean;
 * }>}
 */
export function userSavedAddressesFromProfile(raw) {
  const list = Array.isArray(raw?.userAddresses) ? raw.userAddresses : [];
  if (list.length > 0) {
    return list
      .map((item) => normalizeStoredUserSavedAddress(item))
      .filter((item) => item.line.length > 0)
      .slice(0, USER_SAVED_ADDRESSES_MAX);
  }

  const line = String(raw?.userAddress ?? "").trim();
  if (line === "") {
    return [];
  }

  const flat = String(raw?.userAddressFlat ?? "").trim();
  const fiasId = String(raw?.userAddressFiasId ?? "").trim();
  const geoRaw = raw?.userAddressGeo;
  const lat = Number(geoRaw?.lat);
  const lon = Number(geoRaw?.lon);
  const geo = Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;

  return [
    {
      id: "legacy-default",
      label: "",
      line,
      flat,
      fiasId,
      geo,
      isDefault: true,
    },
  ];
}

/**
 * @param {unknown} item
 */
function normalizeStoredUserSavedAddress(item) {
  const line = String(item?.line ?? item?.displayAddress ?? "").trim();
  const flat = String(item?.flat ?? "").trim();
  const fiasId = String(item?.fiasId ?? "").trim();
  const geoRaw = item?.geo;
  const lat = Number(geoRaw?.lat);
  const lon = Number(geoRaw?.lon);
  const geo = Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;

  return {
    id: String(item?.id ?? "").trim() || "legacy-default",
    label: String(item?.label ?? "").trim().slice(0, USER_SAVED_ADDRESS_LABEL_MAX_LENGTH),
    line,
    flat,
    fiasId,
    geo,
    isDefault: item?.isDefault === true,
  };
}

/**
 * @param {Array<{ line?: string; flat?: string; isDefault?: boolean }>} items
 */
export function ensureSingleDefaultUserSavedAddress(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const normalized = items.map((item) => ({
    ...item,
    isDefault: item.isDefault === true,
  }));

  const defaultIndexes = normalized
    .map((item, index) => (item.isDefault ? index : -1))
    .filter((index) => index >= 0);

  const defaultIndex = defaultIndexes[0] ?? 0;

  return normalized.map((item, index) => ({
    ...item,
    isDefault: index === defaultIndex,
  }));
}
