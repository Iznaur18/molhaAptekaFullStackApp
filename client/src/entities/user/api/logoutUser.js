import { apiClient } from "../../../shared/api/index.js";

/** `POST /auth/logout` — сброс httpOnly cookie на сервере. */
export async function logoutUser() {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // выход на клиенте не блокируем
  }
}
