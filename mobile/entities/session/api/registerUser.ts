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
  referralCode?: string;
};

export type PendingRegistration = {
  registrationId: string;
  email: string;
};

/**
 * Начало регистрации: аккаунт ещё НЕ создан — сервер сохраняет заявку
 * и отправляет код на почту. Сессия выдаётся только в `confirmRegistration`.
 */
export const registerUser = async (
  payload: RegisterPayload,
): Promise<PendingRegistration> => {
  try {
    const { data } = await apiClient.post("/auth/register", payload);

    if (data?.success !== true || data?.data?.pendingRegistration !== true) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      registrationId: String(data.data.registrationId),
      email: String(data.data.email ?? ""),
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.REGISTER_FALLBACK));
  }
};
