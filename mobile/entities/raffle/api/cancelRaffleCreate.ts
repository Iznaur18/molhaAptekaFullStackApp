import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type CancelRaffleCreateResult = {
  message: string;
  loyaltyPointsBalance: number;
  hasPaidUnlock: boolean;
};

export const cancelRaffleCreate = async (): Promise<CancelRaffleCreateResult> => {
  try {
    const { data } = await apiClient.post("/product/raffles/cancel-create");
    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as CancelRaffleCreateResult;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.CANCEL_RAFFLE_CREATE_FALLBACK));
  }
};
