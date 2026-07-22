import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type UsersLoyaltyRaffleSettings = {
  description: string;
  goal: number;
  updatedAt?: string | Date | null;
};

export const fetchUsersLoyaltyRaffleSettings = async (): Promise<UsersLoyaltyRaffleSettings> => {
  try {
    const { data } = await apiClient.get("/users-loyalty-raffle");
    if (!data?.success || data.data?.settings == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const settings = data.data.settings;
    return {
      description: String(settings.description ?? "").trim(),
      goal: Math.max(1, Math.floor(Number(settings.goal) || 0)),
      updatedAt: settings.updatedAt ?? null,
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_USERS_LOYALTY_RAFFLE_SETTINGS_FALLBACK),
    );
  }
};

export type PatchUsersLoyaltyRaffleSettingsBody = {
  description?: string;
  goal?: number;
};

export const patchUsersLoyaltyRaffleSettings = async (
  body: PatchUsersLoyaltyRaffleSettingsBody,
): Promise<UsersLoyaltyRaffleSettings> => {
  try {
    const { data } = await apiClient.patch("/users-loyalty-raffle", body);
    if (!data?.success || data.data?.settings == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const settings = data.data.settings;
    return {
      description: String(settings.description ?? "").trim(),
      goal: Math.max(1, Math.floor(Number(settings.goal) || 0)),
      updatedAt: settings.updatedAt ?? null,
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.PATCH_USERS_LOYALTY_RAFFLE_SETTINGS_FALLBACK),
    );
  }
};
