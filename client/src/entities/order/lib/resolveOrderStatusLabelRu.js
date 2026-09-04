import {
  ORDER_STATUS_LABEL_RU,
  SALES_ORDER_STATUS_LABEL_RU,
} from "../model/constants.js";
import { COMMON_UI, ORDER_CARD_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Лейбл статуса: в продажах shipped → «Отгружен», иначе общий RU-словарь.
 * При поиске курьера Gitorg — «Ищем курьера», а не «Готов к отгрузке».
 *
 * @param {string | undefined} status
 * @param {"buyer" | "seller"} [attentionRole="buyer"]
 * @param {{ awaitingGitorgCourier?: boolean }} [options]
 */
export const resolveOrderStatusLabelRu = (
  status,
  attentionRole = "buyer",
  options = {},
) => {
  if (!status) {
    return COMMON_UI.EM_DASH;
  }
  if (options.awaitingGitorgCourier) {
    return ORDER_CARD_UI.AWAITING_COURIER;
  }
  const labels =
    attentionRole === "seller" ? SALES_ORDER_STATUS_LABEL_RU : ORDER_STATUS_LABEL_RU;
  return labels[status] ?? status;
};
