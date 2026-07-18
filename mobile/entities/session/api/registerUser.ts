import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type RegisterPayload = {
  email: string;
  password: string;
  passwordConfirm: string;
  userName: string;
  backgroundPresetId?: string;
  userGender?: string;
  notificationsEnabled?: boolean;
};

export type PendingRegistrationResult = {
  needsEmailVerification: true;
  pendingToken: string;
  email: string;
};

export const registerUser = async (
  payload: RegisterPayload,
): Promise<PendingRegistrationResult> => {
  try {
    const { data } = await apiClient.post("/auth/register", payload);
    const pending = data?.data;
    if (
      !data?.success ||
      pending?.needsEmailVerification !== true ||
      typeof pending?.pendingToken !== "string" ||
      typeof pending?.email !== "string"
    ) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      needsEmailVerification: true,
      pendingToken: pending.pendingToken,
      email: pending.email,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.REGISTER_FALLBACK));
  }
};
