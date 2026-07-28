export const resolveYandexMapsApiKey = (): string => {
  const raw = process.env.EXPO_PUBLIC_YANDEX_MAPS_API_KEY;
  return typeof raw === "string" ? raw.trim() : "";
};

export const isYandexMapsApiKeyConfigured = (): boolean =>
  resolveYandexMapsApiKey().length > 0;
