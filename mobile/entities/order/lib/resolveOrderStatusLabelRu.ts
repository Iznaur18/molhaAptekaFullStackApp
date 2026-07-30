import {
  ORDER_STATUS_LABEL_RU,
  SALES_ORDER_STATUS_LABEL_RU,
  type OrderStatus,
} from "@/entities/order/model/constants";

type OrderStatusAttentionRole = "buyer" | "seller";

/** Лейбл статуса: в продажах shipped → «Принят», иначе общий RU-словарь. */
export const resolveOrderStatusLabelRu = (
  status: string | undefined,
  attentionRole: OrderStatusAttentionRole = "buyer",
): string => {
  if (!status) {
    return "—";
  }
  const labels =
    attentionRole === "seller" ? SALES_ORDER_STATUS_LABEL_RU : ORDER_STATUS_LABEL_RU;
  return labels[status as OrderStatus] ?? status;
};
