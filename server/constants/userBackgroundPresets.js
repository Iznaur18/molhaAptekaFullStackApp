export const USER_BACKGROUND_PRESET_PREFIX = "preset:";

/** @type {readonly { id: string; hex: string; labelRu: string }[]} */
export const USER_BACKGROUND_PRESETS = [
  { id: "steel", hex: "#284B7E", labelRu: "Синий" },
  { id: "gold", hex: "#FFC700", labelRu: "Золотой" },
  { id: "grape", hex: "#552781", labelRu: "Фиолетовый" },
  { id: "teal", hex: "#009999", labelRu: "Бирюзовый" },
  { id: "leaf", hex: "#64AA2B", labelRu: "Зелёный" },
  { id: "mist", hex: "#DBDBDB", labelRu: "Светло-серый" },
  { id: "ink", hex: "#121616", labelRu: "Тёмный" },
];

export const DEFAULT_USER_BACKGROUND_PRESET_ID = "mist";

const PRESET_ID_SET = new Set(USER_BACKGROUND_PRESETS.map((row) => row.id));

/**
 * @param {string} id
 */
export function isUserBackgroundPresetId(id) {
  return PRESET_ID_SET.has(id);
}

/**
 * @param {string} id
 */
export function formatUserBackgroundPresetValue(id) {
  return `${USER_BACKGROUND_PRESET_PREFIX}${id}`;
}

/**
 * @param {string} [stored]
 */
export function parseUserBackgroundPresetId(stored) {
  if (typeof stored !== "string") {
    return null;
  }
  const trimmed = stored.trim();
  if (!trimmed.startsWith(USER_BACKGROUND_PRESET_PREFIX)) {
    return null;
  }
  const id = trimmed.slice(USER_BACKGROUND_PRESET_PREFIX.length);
  return isUserBackgroundPresetId(id) ? id : null;
}

/**
 * @param {string} id
 */
export function getUserBackgroundPresetById(id) {
  return USER_BACKGROUND_PRESETS.find((row) => row.id === id) ?? null;
}

export function getDefaultUserBackgroundStoredValue() {
  return formatUserBackgroundPresetValue(DEFAULT_USER_BACKGROUND_PRESET_ID);
}
