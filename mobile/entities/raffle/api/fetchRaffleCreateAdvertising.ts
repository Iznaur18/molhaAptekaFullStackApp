import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type RaffleCreateAdvertisingStatus = {
  pricePoints: number;
  hasPaidUnlock: boolean;
  hasOpenRaffle: boolean;
  canPay: boolean;
  canOpenForm: boolean;
  blockReason: string | null;
  loyaltyPointsBalance: number;
  raffle: Record<string, unknown> | null;
};

export const fetchRaffleCreateAdvertising = async (): Promise<RaffleCreateAdvertisingStatus> => {
  try {
    const { data } = await apiClient.get("/product/raffles/create-advertising");
    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as RaffleCreateAdvertisingStatus;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_RAFFLE_CREATE_ADVERTISING_FALLBACK),
    );
  }
};
