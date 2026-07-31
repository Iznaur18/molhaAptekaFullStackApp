import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";
import { myAffiliateEarningsDataSchema } from "@molha/api-contract";

export async function fetchMyAffiliateEarnings() {
  try {
    const { data } = await apiClient.get("/user/me/affiliate/earnings");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return myAffiliateEarningsDataSchema.parse(data.data);
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, "Не удалось загрузить начисления"),
    );
  }
}
