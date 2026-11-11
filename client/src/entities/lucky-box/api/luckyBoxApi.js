import { apiClient } from "../../../shared/api/index.js";

/**
 * @param {unknown} error
 * @param {string} fallback
 */
function readApiError(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

/**
 * Публичное состояние игры на витрине продавца. Раскладки в ответе нет до
 * совершённой попытки — её отдаёт только POST /play.
 *
 * Схемы контракта тут нет намеренно: ответ простой, а строгий разбор
 * ронял бы витрину целиком из-за необязательного блока.
 *
 * @param {string} sellerId
 */
export async function fetchSellerLuckyBoxState(sellerId) {
  try {
    const { data } = await apiClient.get(
      `/seller-lucky-box/seller/${encodeURIComponent(sellerId)}`,
    );
    return data?.data ?? { enabled: false, boxesTotal: 6 };
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось загрузить игру"));
  }
}

/**
 * @param {string} sellerId
 * @param {number} boxIndex
 */
export async function playLuckyBox(sellerId, boxIndex) {
  try {
    const { data } = await apiClient.post(
      `/seller-lucky-box/seller/${encodeURIComponent(sellerId)}/play`,
      { boxIndex },
    );
    return data?.data ?? null;
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось открыть коробку"));
  }
}

export async function fetchMyLuckyBoxConfig() {
  try {
    const { data } = await apiClient.get("/seller-lucky-box/me/config");
    return data?.data?.config ?? null;
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось загрузить настройки игры"));
  }
}

/**
 * @param {{ enabled: boolean; prizes: Array<{ discountPercent: number; durationHours: number }> }} body
 */
export async function putMyLuckyBoxConfig(body) {
  try {
    const { data } = await apiClient.put("/seller-lucky-box/me/config", body);
    return data?.data?.config ?? null;
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось сохранить настройки игры"));
  }
}

export async function fetchMyLuckyBoxWins() {
  try {
    const { data } = await apiClient.get("/seller-lucky-box/me/wins");
    const wins = data?.data?.wins;
    return Array.isArray(wins) ? wins : [];
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось загрузить выигрыши"));
  }
}
