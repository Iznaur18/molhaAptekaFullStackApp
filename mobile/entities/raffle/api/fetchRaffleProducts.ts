import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

const DEFAULT_RAFFLE_PRODUCTS_LIMIT = 60;

export const fetchRaffleProducts = async (
  raffleId: string,
  { page = 1, limit = DEFAULT_RAFFLE_PRODUCTS_LIMIT }: { page?: number; limit?: number } = {},
) => {
  try {
    const { data } = await apiClient.get(`/product/raffles/${raffleId}/products`, {
      params: { page, limit },
    });
    if (!data?.success || !Array.isArray(data.data?.products)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      products: data.data.products as Array<Record<string, unknown> & { _id: string }>,
      pagination: data.data.pagination ?? null,
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_RAFFLE_PRODUCTS_FALLBACK),
    );
  }
};
