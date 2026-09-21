import { logServerEvent } from "../../utils/logServerEvent.js";

import { syncCdekWaybillStatuses } from "./cdek/cdekWaybill.js";
import { syncYandexDeliveryRequests } from "./yandex/yandexDeliveryRequest.js";

/**
 * Опрос статусов служб продавцов (СДЭК, Яндекс) одним заданием: интервал у
 * них общий, а сбой одной службы не должен останавливать другую.
 */
export async function syncCarrierStatuses() {
  const result = {};
  for (const [name, run] of [
    ["cdek", syncCdekWaybillStatuses],
    ["yandexDelivery", syncYandexDeliveryRequests],
  ]) {
    try {
      result[name] = await run();
    } catch (error) {
      logServerEvent("carrier.status_sync_failed", {
        carrier: name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return result;
}
