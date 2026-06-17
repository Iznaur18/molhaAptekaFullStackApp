import { apiClient, parseAuthMeData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchAuthMe = async () => {
  try {
    const { data } = await apiClient.get("/auth/me");
    const parsed = parseAuthMeData(data);
    if (!parsed.user) {
      return null;
    }
    return parsed;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_ME_FALLBACK));
  }
};
