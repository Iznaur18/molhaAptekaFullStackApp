import {
  siteHeaderBannerSettingsDataSchema,
  siteHeaderBannerSlidesDataSchema,
} from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";

import type { SiteHeaderBannerSettings, SiteHeaderBannerSlide } from "../model/types";

export const fetchSiteHeaderBannerSlides = async (): Promise<SiteHeaderBannerSlide[]> => {
  try {
    const { data } = await apiClient.get("/site-header-banner");
    const parsed = parseApiContractData(data, siteHeaderBannerSlidesDataSchema);
    return parsed.slides;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось загрузить баннеры";
    throw new Error(message);
  }
};

export const fetchGuestProfileLoginMenuBannerImageUrl = async (): Promise<
  string | null
> => {
  try {
    const { data } = await apiClient.get("/site-header-banner");
    const parsed = parseApiContractData(data, siteHeaderBannerSlidesDataSchema);
    return parsed.guestProfileLoginMenuBannerImageUrl ?? null;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось загрузить баннер входа профиля";
    throw new Error(message);
  }
};

export const fetchSiteHeaderBannerSettings = async (): Promise<SiteHeaderBannerSettings> => {
  try {
    const { data } = await apiClient.get("/site-header-banner/settings");
    const parsed = parseApiContractData(data, siteHeaderBannerSettingsDataSchema);
    return parsed.settings;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось загрузить настройки баннера";
    throw new Error(message);
  }
};

export const patchSiteHeaderBannerSettings = async (
  body: Record<string, unknown>,
): Promise<SiteHeaderBannerSettings> => {
  try {
    const { data } = await apiClient.patch("/site-header-banner/settings", body);
    const parsed = parseApiContractData(data, siteHeaderBannerSettingsDataSchema);
    return parsed.settings;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось сохранить настройки баннера";
    throw new Error(message);
  }
};
