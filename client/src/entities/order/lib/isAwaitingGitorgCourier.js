import { ORDER_STATUS_READY_TO_SHIP } from "../model/constants.js";

/**
 * Курьеры Gitorg ещё не взяли отправление: товар готов, в «Свободных» свободен.
 *
 * @param {{
 *   status?: string | null;
 *   shipment?: {
 *     courierDelivery?: boolean | null;
 *     courierId?: unknown;
 *   } | null;
 * }} input
 */
export function isAwaitingGitorgCourier({ status, shipment }) {
  if (String(status ?? "") !== ORDER_STATUS_READY_TO_SHIP) return false;
  if (shipment?.courierDelivery !== true) return false;
  if (shipment?.courierId) return false;
  return true;
}
