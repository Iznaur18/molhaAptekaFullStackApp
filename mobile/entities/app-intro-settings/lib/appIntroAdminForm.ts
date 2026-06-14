import { APP_INTRO_SETTINGS_DEFAULTS } from "@molha/api-contract";

import type { AppIntroSettings } from "../model/types";

export type AppIntroAdminForm = {
  videoMp4Url: string;
  videoWebmUrl: string;
  posterUrl: string;
  fallbackTitle: string;
  fallbackHint: string;
  minMs: string;
  maxMs: string;
  fadeOutMs: string;
};

export const mapAppIntroSettingsToForm = (
  settings: AppIntroSettings | null | undefined,
): AppIntroAdminForm => {
  const source = settings ?? APP_INTRO_SETTINGS_DEFAULTS;

  return {
    videoMp4Url: source.videoMp4Url ?? "",
    videoWebmUrl: source.videoWebmUrl ?? "",
    posterUrl: source.posterUrl ?? "",
    fallbackTitle: source.fallbackTitle ?? APP_INTRO_SETTINGS_DEFAULTS.fallbackTitle,
    fallbackHint: source.fallbackHint ?? APP_INTRO_SETTINGS_DEFAULTS.fallbackHint,
    minMs: String(source.minMs ?? APP_INTRO_SETTINGS_DEFAULTS.minMs),
    maxMs: String(source.maxMs ?? APP_INTRO_SETTINGS_DEFAULTS.maxMs),
    fadeOutMs: String(source.fadeOutMs ?? APP_INTRO_SETTINGS_DEFAULTS.fadeOutMs),
  };
};

export const buildPatchAppIntroSettingsBody = (form: AppIntroAdminForm) => {
  const trimOrNull = (value: string) => {
    const trimmed = String(value ?? "").trim();
    return trimmed === "" ? null : trimmed;
  };

  return {
    videoMp4Url: trimOrNull(form.videoMp4Url),
    videoWebmUrl: trimOrNull(form.videoWebmUrl),
    posterUrl: trimOrNull(form.posterUrl),
    fallbackTitle: String(form.fallbackTitle ?? "").trim(),
    fallbackHint: String(form.fallbackHint ?? "").trim(),
    minMs: Number(form.minMs) || 0,
    maxMs: Number(form.maxMs) || 0,
    fadeOutMs: Number(form.fadeOutMs) || 0,
  };
};
