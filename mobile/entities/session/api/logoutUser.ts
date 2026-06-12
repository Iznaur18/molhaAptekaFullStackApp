import { apiClient, clearAuthTokens, getRefreshToken } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const logoutUser = async () => {
  try {
    const refreshToken = await getRefreshToken();
    await apiClient.post("/auth/logout", refreshToken ? { refreshToken } : {});
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.LOGOUT_FALLBACK));
  } finally {
    await clearAuthTokens();
  }
};
