export const USER_BACKGROUND_PRESET_PREFIX = "preset:";

export const USER_BACKGROUND_PRESETS = [
  { id: "steel", hex: "#284B7E", labelRu: "Синий" },
  { id: "gold", hex: "#FFC700", labelRu: "Золотой" },
  { id: "grape", hex: "#552781", labelRu: "Фиолетовый" },
  { id: "teal", hex: "#009999", labelRu: "Бирюзовый" },
  { id: "leaf", hex: "#64AA2B", labelRu: "Зелёный" },
  { id: "mist", hex: "#DBDBDB", labelRu: "Светло-серый" },
  { id: "ink", hex: "#121616", labelRu: "Тёмный" },
] as const;

export const DEFAULT_USER_BACKGROUND_PRESET_ID = "mist";

const PRESET_ID_SET = new Set<string>(USER_BACKGROUND_PRESETS.map((row) => row.id));

export const isUserBackgroundPresetId = (id: string): boolean => PRESET_ID_SET.has(id);

export const parseUserBackgroundPresetId = (stored: unknown): string | null => {
  if (typeof stored !== "string") {
    return null;
  }
  const trimmed = stored.trim();
  if (!trimmed.startsWith(USER_BACKGROUND_PRESET_PREFIX)) {
    return null;
  }
  const id = trimmed.slice(USER_BACKGROUND_PRESET_PREFIX.length);
  return isUserBackgroundPresetId(id) ? id : null;
};

export const getUserBackgroundPresetById = (id: string) =>
  USER_BACKGROUND_PRESETS.find((row) => row.id === id) ?? null;
