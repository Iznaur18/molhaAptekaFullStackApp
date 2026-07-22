import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type UnlockRaffleCreateResult = {
  message: string;
  loyaltyPointsBalance: number;
  hasPaidUnlock: boolean;
};

export const unlockRaffleCreate = async (): Promise<UnlockRaffleCreateResult> => {
  try {
    const { data } = await apiClient.post("/product/raffles/unlock-create");
    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as UnlockRaffleCreateResult;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.UNLOCK_RAFFLE_CREATE_FALLBACK));
  }
};
