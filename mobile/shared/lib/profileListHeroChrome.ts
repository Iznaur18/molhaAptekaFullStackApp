/**
 * Паритет web `ProfileListHero.css`.
 * caption ls 0.05em @12 → 0.6; value ls −0.03em @34 → −1.02; без box-shadow.
 */
export const PROFILE_LIST_HERO_CHROME = {
  padding: 20,
  gap: 14,
  radiusDefault: 18,
  /** Advertising hero — web AdvertisingPage */
  radiusAdvertising: 20,
  captionFontSize: 12,
  captionLetterSpacing: 0.6,
  valueFontSize: 34,
  valueLetterSpacing: -1.02,
  valueFontWeight: "800" as const,
  iconSize: 48,
} as const;

/** Явно без тени (web ProfileListHero не рисует box-shadow). */
export const PROFILE_LIST_HERO_NO_SHADOW = {
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
  elevation: 0,
} as const;
