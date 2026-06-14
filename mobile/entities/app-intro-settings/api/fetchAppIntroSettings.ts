import { appIntroSettingsDataSchema } from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";

import type { AppIntroPublicResponse } from "../model/types";

export const fetchAppIntroSettings = async (): Promise<AppIntroPublicResponse> => {
  try {
    const { data } = await apiClient.get("/app-intro");
    return parseApiContractData(data, appIntroSettingsDataSchema);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось загрузить настройки intro";
    throw new Error(message);
  }
};
