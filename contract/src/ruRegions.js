import { z } from "zod";

import ruRegionsJson from "./ruRegions.json" with { type: "json" };

/**
 * @typedef {{ code: string; name: string; aliases: string[] }} RuRegion
 */

/** @type {readonly RuRegion[]} */
export const RU_REGIONS = Object.freeze(
  ruRegionsJson.map((region) =>
    Object.freeze({
      code: String(region.code),
      name: String(region.name),
      aliases: Object.freeze([...(region.aliases ?? [])].map(String)),
    }),
  ),
);

/** Дефолт зрителя без региона в профиле (спека). */
export const DEFAULT_VIEWER_REGION_CODE = "RU-MOW";

const CODE_BY_NORMALIZED_LABEL = new Map();

for (const region of RU_REGIONS) {
  CODE_BY_NORMALIZED_LABEL.set(normalizeRuRegionLabelKey(region.name), region.code);
  for (const alias of region.aliases) {
    CODE_BY_NORMALIZED_LABEL.set(normalizeRuRegionLabelKey(alias), region.code);
  }
}

const REGION_BY_CODE = new Map(RU_REGIONS.map((region) => [region.code, region]));

/**
 * @param {string | null | undefined} raw
 */
export function normalizeRuRegionLabelKey(raw) {
  return String(raw ?? "")
    .trim()
    .toLocaleLowerCase("ru")
    .replace(/\s+/g, " ");
}

/**
 * @returns {readonly RuRegion[]}
 */
export function listRuRegions() {
  return RU_REGIONS;
}

/**
 * @param {string | null | undefined} code
 */
export function isRuRegionCode(code) {
  const key = String(code ?? "").trim();
  return REGION_BY_CODE.has(key);
}

/**
 * @param {string | null | undefined} code
 * @returns {RuRegion | null}
 */
export function getRuRegionByCode(code) {
  const key = String(code ?? "").trim();
  return REGION_BY_CODE.get(key) ?? null;
}

/**
 * Name или alias → code. Неизвестный → null.
 *
 * @param {string | null | undefined} raw
 */
export function resolveRuRegionCodeFromLabel(raw) {
  const key = normalizeRuRegionLabelKey(raw);
  if (key === "") return null;
  return CODE_BY_NORMALIZED_LABEL.get(key) ?? null;
}

/**
 * Невалидный / пустой → дефолт Москва.
 *
 * @param {string | null | undefined} code
 */
export function resolveViewerRegionCode(code) {
  if (isRuRegionCode(code)) {
    return String(code).trim();
  }
  return DEFAULT_VIEWER_REGION_CODE;
}

export const ruRegionCodeSchema = z
  .string()
  .trim()
  .refine((value) => isRuRegionCode(value), "Укажите регион из списка");

/** Обязательный регион в create/update body. */
export const requiredRuRegionCodeFieldSchema = ruRegionCodeSchema;

/** Опциональный регион (например patch профиля). */
export const optionalRuRegionCodeFieldSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return String(value).trim();
  })
  .refine(
    (value) => value === undefined || value === null || isRuRegionCode(value),
    "Укажите регион из списка",
  );
