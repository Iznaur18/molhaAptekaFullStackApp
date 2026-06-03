import {
  PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
  PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS,
  PRODUCT_CHARACTERISTICS_MAX_ITEMS,
} from "../model/productCharacteristicsConstants.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ key: string; value: string }[]} rows
 * @returns {string | null}
 */
export function validateProductCharacteristicsRows(rows) {
  const normalized = [];
  const seenKeysLower = new Map();

  for (const row of rows) {
    const key = row.key.trim();
    const value = row.value.trim();

    if (!key && !value) {
      continue;
    }

    if (!key || !value) {
      return CREATE_PRODUCT_MODAL_UI.ERROR_CHARACTERISTIC_PAIR;
    }

    if (key.length > PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS) {
      return CREATE_PRODUCT_MODAL_UI.ERROR_CHARACTERISTIC_KEY_MAX(
        PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
      );
    }

    if (value.length > PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS) {
      return CREATE_PRODUCT_MODAL_UI.ERROR_CHARACTERISTIC_VALUE_MAX(
        PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS,
      );
    }

    const keyLower = key.toLowerCase();
    if (seenKeysLower.has(keyLower)) {
      return CREATE_PRODUCT_MODAL_UI.ERROR_CHARACTERISTIC_DUPLICATE_KEY(
        seenKeysLower.get(keyLower),
      );
    }

    seenKeysLower.set(keyLower, key);
    normalized.push({ key, value });
  }

  if (normalized.length > PRODUCT_CHARACTERISTICS_MAX_ITEMS) {
    return CREATE_PRODUCT_MODAL_UI.ERROR_CHARACTERISTICS_MAX(
      PRODUCT_CHARACTERISTICS_MAX_ITEMS,
    );
  }

  return null;
}

/**
 * @param {{ key: string; value: string }[]} rows
 * @returns {{ key: string; value: string }[]}
 */
export function productCharacteristicsFromRows(rows) {
  const error = validateProductCharacteristicsRows(rows);
  if (error) {
    throw new Error(error);
  }

  return rows
    .map((row) => ({
      key: row.key.trim(),
      value: row.value.trim(),
    }))
    .filter((row) => row.key || row.value);
}
