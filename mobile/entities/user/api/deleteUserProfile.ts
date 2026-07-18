import { apiClient } from "@/shared/api";
import { API_CLIENT_UI, DELETE_ACCOUNT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

/**
 * Удаление профиля: своего (самоудаление) либо чужого — админом.
 * Сервер отвечает 409, если у продавца есть незавершённые продажи.
 */
export const deleteUserProfile = async (userId: string) => {
  const normalizedUserId = String(userId ?? "").trim();
  if (!normalizedUserId) {
    throw new Error(DELETE_ACCOUNT_UI.UNKNOWN_USER);
  }

  try {
    const { data } = await apiClient.delete(
      `/user/${encodeURIComponent(normalizedUserId)}`,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, DELETE_ACCOUNT_UI.FALLBACK_ERROR));
  }
};
