import { appIntroSettingsDataSchema } from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { APP_INTRO_ADMIN_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const patchAppIntroSettings = async (body: Record<string, unknown>) => {
  try {
    const { data } = await apiClient.patch("/app-intro", body);
    return parseApiContractData(data, appIntroSettingsDataSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, APP_INTRO_ADMIN_PAGE_UI.SAVE_ERROR));
  }
};
