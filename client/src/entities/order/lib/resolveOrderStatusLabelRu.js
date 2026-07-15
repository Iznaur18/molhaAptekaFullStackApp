import {
  ORDER_STATUS_LABEL_RU,
  SALES_ORDER_STATUS_LABEL_RU,
} from "../model/constants.js";
import { COMMON_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Лейбл статуса: в продажах shipped → «Принять», иначе общий RU-словарь.
 * @param {string | undefined} status
 * @param {"buyer" | "seller"} [attentionRole="buyer"]
 */
export const resolveOrderStatusLabelRu = (status, attentionRole = "buyer") => {
  if (!status) {
    return COMMON_UI.EM_DASH;
  }
  const labels =
    attentionRole === "seller" ? SALES_ORDER_STATUS_LABEL_RU : ORDER_STATUS_LABEL_RU;
  return labels[status] ?? status;
};
