import {
  PRODUCT_CHARACTERISTIC_EMPTY_PAIR_MESSAGE,
  PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
  PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS,
  PRODUCT_CHARACTERISTICS_MAX_ITEMS,
} from "../constants/productCharacteristicsConstants.js";

/**
 * @param {unknown} raw
 * @returns {{ key: string; value: string }[]}
 */
export const normalizeProductCharacteristics = (raw) => {
  if (raw == null) {
    return [];
  }

  if (!Array.isArray(raw)) {
    throw new Error("productCharacteristics должен быть массивом");
  }

  const result = [];
  const seenKeysLower = new Map();

  for (const item of raw) {
    if (item == null || typeof item !== "object") {
      throw new Error(
        "Каждая характеристика должна быть объектом с key и value",
      );
    }

    const key = item.key == null ? "" : String(item.key).trim();
    const value = item.value == null ? "" : String(item.value).trim();

    if (!key && !value) {
      continue;
    }

    if (!key || !value) {
      throw new Error(PRODUCT_CHARACTERISTIC_EMPTY_PAIR_MESSAGE);
    }

    if (key.length > PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS) {
      throw new Error(
        `Ключ характеристики не длиннее ${PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS} символов`,
      );
    }

    if (value.length > PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS) {
      throw new Error(
        `Значение характеристики не длиннее ${PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS} символов`,
      );
    }

    const keyLower = key.toLowerCase();
    if (seenKeysLower.has(keyLower)) {
      throw new Error(
        `Дубликат ключа характеристики: «${seenKeysLower.get(keyLower)}»`,
      );
    }

    seenKeysLower.set(keyLower, key);
    result.push({ key, value });
  }

  if (result.length > PRODUCT_CHARACTERISTICS_MAX_ITEMS) {
    throw new Error(
      `Не более ${PRODUCT_CHARACTERISTICS_MAX_ITEMS} характеристик`,
    );
  }

  return result;
};
