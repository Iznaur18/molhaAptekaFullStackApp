import { apiClient } from "../../../shared/api/apiClient.js";

/**
 * Подключение СДЭК у продавца. Secure password уходит на сервер и обратно
 * никогда не возвращается — только признак «подключено» и маска Account.
 */

/**
 * @param {unknown} error
 * @returns {never}
 */
function rethrowCdekError(error) {
  const message =
    error?.response?.data?.message ?? error?.message ?? "Не удалось связаться с СДЭК";
  throw new Error(message);
}

export async function fetchCdekConnection() {
  try {
    const { data } = await apiClient.get("/user/me/cdek-credentials");
    return data?.data?.cdek ?? null;
  } catch (error) {
    return rethrowCdekError(error);
  }
}

/**
 * @param {{ account: string; secure: string; environment?: "prod" | "test" }} credentials
 */
export async function saveCdekConnection(credentials) {
  try {
    const { data } = await apiClient.put("/user/me/cdek-credentials", credentials);
    return data?.data?.cdek ?? null;
  } catch (error) {
    return rethrowCdekError(error);
  }
}

export async function removeCdekConnection() {
  try {
    const { data } = await apiClient.delete("/user/me/cdek-credentials");
    return data?.data?.cdek ?? null;
  } catch (error) {
    return rethrowCdekError(error);
  }
}
