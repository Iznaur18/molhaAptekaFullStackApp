import { APP_INTRO_SETTINGS_DEFAULTS } from "@molha/api-contract";

export type IntroAdFormState = {
  videoMp4Url: string;
  videoWebmUrl: string;
  posterUrl: string;
  fallbackTitle: string;
  fallbackHint: string;
  minMs: string;
  maxMs: string;
  fadeOutMs: string;
};

export const createIntroAdFormState = (): IntroAdFormState => ({
  videoMp4Url: "",
  videoWebmUrl: "",
  posterUrl: "",
  fallbackTitle: APP_INTRO_SETTINGS_DEFAULTS.fallbackTitle ?? "",
  fallbackHint: APP_INTRO_SETTINGS_DEFAULTS.fallbackHint ?? "",
  minMs: String(APP_INTRO_SETTINGS_DEFAULTS.minMs ?? ""),
  maxMs: String(APP_INTRO_SETTINGS_DEFAULTS.maxMs ?? ""),
  fadeOutMs: String(APP_INTRO_SETTINGS_DEFAULTS.fadeOutMs ?? ""),
});
