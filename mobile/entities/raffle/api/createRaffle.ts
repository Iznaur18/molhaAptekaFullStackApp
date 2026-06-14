import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type CreateRaffleBody = {
  title: string;
  description?: string;
  prizeMediaType?: "image" | "video";
  prizeImageUrl?: string;
  prizeVideoUrl?: string;
  prizeImageFocus?: { x: number; y: number };
  targetSales: number;
  instagramUrl: string;
};

export const createRaffle = async (body: CreateRaffleBody) => {
  try {
    const { data } = await apiClient.post("/product/raffles", body);
    if (!data?.success || !data.data?.raffle) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.raffle;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.CREATE_RAFFLE_FALLBACK));
  }
};
