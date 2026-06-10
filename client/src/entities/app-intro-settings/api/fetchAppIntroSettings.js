import { appIntroSettingsDataSchema } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { APP_INTRO_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<import('../model/types.js').AppIntroPublicResponse>}
 */
export async function fetchAppIntroSettings() {
  try {
    const { data } = await apiClient.get("/app-intro");
    return parseApiContractData(data, appIntroSettingsDataSchema);
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? APP_INTRO_ADMIN_PAGE_UI.LOAD_ERROR;
    throw new Error(message);
  }
}
