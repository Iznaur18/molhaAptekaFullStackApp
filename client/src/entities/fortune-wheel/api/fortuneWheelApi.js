import { apiClient } from "../../../shared/api/index.js";

/**
 * @param {unknown} error
 * @param {string} fallback
 */
function readApiError(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

/**
 * Публичное состояние колеса на витрине продавца. Секции приходят без
 * шансов — их сервер нарочно не отдаёт.
 *
 * Схемы контракта тут нет намеренно: ответ простой, а строгий разбор
 * ронял бы витрину целиком из-за необязательного блока.
 *
 * @param {string} sellerId
 */
export async function fetchSellerFortuneWheelState(sellerId) {
  try {
    const { data } = await apiClient.get(
      `/seller-fortune-wheel/seller/${encodeURIComponent(sellerId)}`,
    );
    return data?.data ?? { enabled: false };
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось загрузить игру"));
  }
}

/**
 * @param {string} sellerId
 */
export async function spinFortuneWheel(sellerId) {
  try {
    const { data } = await apiClient.post(
      `/seller-fortune-wheel/seller/${encodeURIComponent(sellerId)}/spin`,
    );
    return data?.data ?? null;
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось крутить колесо"));
  }
}

export async function fetchMyFortuneWheelConfig() {
  try {
    const { data } = await apiClient.get("/seller-fortune-wheel/me/config");
    return data?.data?.config ?? null;
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось загрузить настройки игры"));
  }
}

/**
 * @param {{ enabled: boolean; sectors: Array<{ discountPercent: number; durationHours: number; chancePercent: number; enabled: boolean }> }} body
 */
export async function putMyFortuneWheelConfig(body) {
  try {
    const { data } = await apiClient.put("/seller-fortune-wheel/me/config", body);
    return data?.data?.config ?? null;
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось сохранить настройки игры"));
  }
}

export async function fetchMyFortuneWheelWins() {
  try {
    const { data } = await apiClient.get("/seller-fortune-wheel/me/wins");
    const wins = data?.data?.wins;
    return Array.isArray(wins) ? wins : [];
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось загрузить выигрыши"));
  }
}
