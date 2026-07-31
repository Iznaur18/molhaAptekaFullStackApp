import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { myAffiliateEarningsDataSchema } from "@molha/api-contract";

export async function fetchMyAffiliateEarnings() {
  try {
    const { data } = await apiClient.get("/user/me/affiliate/earnings");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return myAffiliateEarningsDataSchema.parse(data.data);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, "Не удалось загрузить начисления"),
    );
  }
}
