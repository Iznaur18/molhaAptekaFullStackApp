import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type UsersMonthlyLoyaltyPointsSummary = {
  pointsAwarded: number;
  goal: number;
  description: string;
  year: number;
  month: number;
};

export const fetchUsersMonthlyLoyaltyPoints = async (): Promise<UsersMonthlyLoyaltyPointsSummary> => {
  try {
    const { data } = await apiClient.get("/user/loyalty-points/monthly-awarded");
    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const pointsAwarded = Math.max(0, Math.floor(Number(data.data.pointsAwarded) || 0));
    const goal = Math.max(0, Math.floor(Number(data.data.goal) || 0));
    const description = String(data.data.description ?? "").trim();
    const year = Math.floor(Number(data.data.year) || 0);
    const month = Math.floor(Number(data.data.month) || 0);

    return { pointsAwarded, goal, description, year, month };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_MONTHLY_LOYALTY_POINTS_FALLBACK),
    );
  }
};
