import { APP_INTRO_SETTINGS_DEFAULTS } from "@molha/api-contract";

/**
 * @param {import('../model/types.js').AppIntroSettings | null | undefined} settings
 */
export function mapAppIntroSettingsToForm(settings) {
  const source = settings ?? APP_INTRO_SETTINGS_DEFAULTS;

  return {
    videoMp4Url: source.videoMp4Url ?? "",
    posterUrl: source.posterUrl ?? "",
    fallbackTitle: source.fallbackTitle ?? APP_INTRO_SETTINGS_DEFAULTS.fallbackTitle,
    fallbackHint: source.fallbackHint ?? APP_INTRO_SETTINGS_DEFAULTS.fallbackHint,
    minMs: String(source.minMs ?? APP_INTRO_SETTINGS_DEFAULTS.minMs),
    maxMs: String(source.maxMs ?? APP_INTRO_SETTINGS_DEFAULTS.maxMs),
    fadeOutMs: String(source.fadeOutMs ?? APP_INTRO_SETTINGS_DEFAULTS.fadeOutMs),
    prioritizePlatformIntro: source.prioritizePlatformIntro !== false,
  };
}
