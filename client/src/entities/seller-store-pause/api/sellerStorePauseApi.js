import { sellerStorePauseDataSchema } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { SELLER_STORE_PAUSE_UI } from "../../../shared/config/appUiCopy.js";

/** @param {unknown} e */
const toMessage = (e) =>
  e?.response?.data?.message ?? e?.message ?? SELLER_STORE_PAUSE_UI.ERROR_FALLBACK;

/**
 * `GET /sellers/store-pause/me` — на паузе ли магазин и сколько товаров затронуто.
 *
 * @returns {Promise<import("../model/types.js").SellerStorePause>}
 */
export async function fetchMySellerStorePause() {
  try {
    const { data } = await apiClient.get("/sellers/store-pause/me");
    return parseApiContractData(data, sellerStorePauseDataSchema).storePause;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/**
 * `PUT /sellers/store-pause` — скрыть все товары разом или вернуть их на витрину.
 *
 * @param {boolean} paused
 * @returns {Promise<import("../model/types.js").SellerStorePause>}
 */
export async function setMySellerStorePause(paused) {
  try {
    const { data } = await apiClient.put("/sellers/store-pause", { paused });
    return parseApiContractData(data, sellerStorePauseDataSchema).storePause;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}
