import { apiClient } from "../../../shared/api/index.js";
import { clearDevAuthTokens } from "../../../shared/api/devAuthTokenStorage.js";
import { reportClientIssue } from "../../../shared/lib/reportClientIssue.js";

/** `POST /auth/logout` — сброс httpOnly cookie на сервере. */
export async function logoutUser() {
  clearDevAuthTokens();
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    // выход на клиенте не блокируем
    reportClientIssue("logoutUser", error);
  }
}
