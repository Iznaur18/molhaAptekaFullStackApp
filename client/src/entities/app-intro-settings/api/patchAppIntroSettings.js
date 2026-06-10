import { appIntroSettingsDataSchema } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { APP_INTRO_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {import('../model/types.js').PatchAppIntroSettingsBody} body
 * @returns {Promise<import('../model/types.js').AppIntroPublicResponse>}
 */
export async function patchAppIntroSettings(body) {
  try {
    const { data } = await apiClient.patch("/app-intro", body);
    const parsed = parseApiContractData(data, appIntroSettingsDataSchema);
    return parsed;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? APP_INTRO_ADMIN_PAGE_UI.SAVE_ERROR;
    throw new Error(message);
  }
}
