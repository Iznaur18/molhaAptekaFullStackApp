import {
  PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
  PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS,
  PRODUCT_CHARACTERISTICS_MAX_ITEMS,
} from "@molha/api-contract";

type CharacteristicRowLike = {
  key?: string;
  value?: string;
};

/**
 * Проверка строк характеристик — те же правила и те же формулировки, что в
 * вебовской `validateProductCharacteristicsRows`.
 *
 * Без неё отправка молча выбрасывала строку, заполненную наполовину (payload
 * фильтрует `key && value`), и продавец был уверен, что характеристика
 * сохранилась. Дубликаты ключей уезжали на сервер как есть.
 *
 * Полностью пустая строка — не ошибка: это ещё не заполненная заготовка,
 * добавленная кнопкой.
 */
export const validateProductCharacteristicsRows = (
  rows: readonly CharacteristicRowLike[],
): string | null => {
  const seenKeysLower = new Map<string, string>();
  let filledCount = 0;

  for (const row of rows) {
    const key = String(row?.key ?? "").trim();
    const value = String(row?.value ?? "").trim();

    if (!key && !value) {
      continue;
    }
    if (!key || !value) {
      return "У каждой характеристики должны быть и ключ, и значение";
    }
    if (key.length > PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS) {
      return `Ключ характеристики не длиннее ${PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS} символов`;
    }
    if (value.length > PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS) {
      return `Значение характеристики не длиннее ${PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS} символов`;
    }

    const keyLower = key.toLowerCase();
    const seen = seenKeysLower.get(keyLower);
    if (seen != null) {
      return `Дубликат ключа характеристики: «${seen}»`;
    }
    seenKeysLower.set(keyLower, key);
    filledCount += 1;
  }

  if (filledCount > PRODUCT_CHARACTERISTICS_MAX_ITEMS) {
    return `Не более ${PRODUCT_CHARACTERISTICS_MAX_ITEMS} характеристик`;
  }

  return null;
};
