import { apiClient } from "../../../shared/api/index.js";
import { clearDevAuthTokens } from "../../../shared/api/devAuthTokenStorage.js";

/** `POST /auth/logout` — сброс httpOnly cookie на сервере. */
export async function logoutUser() {
  clearDevAuthTokens();
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // выход на клиенте не блокируем
  }
}
