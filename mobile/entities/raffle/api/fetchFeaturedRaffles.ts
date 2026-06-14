import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type FeaturedRaffle = {
  _id: string;
  title?: string;
  description?: string;
  status?: string;
};

export const fetchFeaturedRaffles = async (): Promise<FeaturedRaffle[]> => {
  try {
    const { data } = await apiClient.get("/product/raffles/featured");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const raffles = data.data?.raffles;
    if (Array.isArray(raffles)) {
      return raffles;
    }
    if (data.data?.raffle) {
      return [data.data.raffle];
    }
    return [];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить розыгрыши"));
  }
};
