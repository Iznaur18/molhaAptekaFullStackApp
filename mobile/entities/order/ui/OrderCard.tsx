import { Pressable, StyleSheet, Text, View } from "react-native";

import { getOrderItemIndex } from "@/entities/order/lib/getOrderItemIndex";
import { resolveOrderLineItemName } from "@/entities/order/lib/resolveOrderLineItemName";
import {
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_LABEL_RU,
  type OrderPaymentMethod,
  type OrderStatus,
} from "@/entities/order/model/constants";
import { ORDER_CARD_UI } from "@/shared/config";
import { formatIsoDateTime, formatPriceRub } from "@/shared/lib";

type OrderItemActionContext = {
  orderId: string;
  itemIndex: number;
};

type OrderCardProps = {
  order: {
    _id: string;
    status?: string;
    totalAmount?: number;
    deliveryAddress?: string;
    paymentMethod?: string;
    createdAt?: string;
    items?: unknown[];
  };
  onConfirmDelivered?: (ctx: OrderItemActionContext) => void | Promise<void>;
  onCancelItem?: (ctx: OrderItemActionContext) => void | Promise<void>;
  pendingActionKey?: string | null;
  itemActionErrors?: Record<string, string>;
};

const formatStatus = (status?: string) =>
  ORDER_STATUS_LABEL_RU[status as OrderStatus] ?? status ?? "—";

const formatPayment = (method?: string) =>
  ORDER_PAYMENT_METHOD_LABEL_RU[method as OrderPaymentMethod] ?? method ?? "—";

export const OrderCard = ({
  order,
  onConfirmDelivered,
  onCancelItem,
  pendingActionKey = null,
  itemActionErrors = {},
}: OrderCardProps) => {
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.status}>{formatStatus(order.status)}</Text>
        <Text style={styles.total}>{formatPriceRub(order.totalAmount)}</Text>
      </View>

      <Text style={styles.meta}>
        {ORDER_CARD_UI.CREATED_LABEL}: {formatIsoDateTime(order.createdAt)}
      </Text>
      <Text style={styles.meta}>
        {ORDER_CARD_UI.PAYMENT_LABEL}: {formatPayment(order.paymentMethod)}
      </Text>
      {order.deliveryAddress ? (
        <Text style={styles.meta} numberOfLines={2}>
          {ORDER_CARD_UI.ADDRESS_LABEL}: {order.deliveryAddress}
        </Text>
      ) : null}

      <Text style={styles.itemsHeading}>{ORDER_CARD_UI.ITEMS_HEADING}</Text>
      {items.map((item, index) => {
        const source = item as {
          quantity?: number;
          _id?: string;
          status?: string;
          itemIndex?: number;
        };
        const itemIndex = getOrderItemIndex(source, index);
        const actionKey = `${order._id}:${itemIndex}`;
        const isActionPending = pendingActionKey === actionKey;
        const actionError = itemActionErrors[actionKey] ?? "";
        const canCancel = source.status === ORDER_STATUS_PENDING && Boolean(onCancelItem);
        const canConfirm =
          source.status === ORDER_STATUS_DELIVERED && Boolean(onConfirmDelivered);
        const key = source._id ?? `item-${index}`;

        return (
          <View key={key} style={styles.itemBlock}>
            <Text style={styles.itemLine} numberOfLines={2}>
              {resolveOrderLineItemName(item)} × {source.quantity ?? 1}
            </Text>
            <Text style={styles.itemStatus}>
              {ORDER_CARD_UI.ITEM_STATUS_LABEL}: {formatStatus(source.status)}
            </Text>
            {canCancel || canConfirm ? (
              <View style={styles.itemActions}>
                {canConfirm ? (
                  <Pressable
                    style={[styles.actionButton, isActionPending && styles.actionDisabled]}
                    onPress={() => onConfirmDelivered?.({ orderId: order._id, itemIndex })}
                    disabled={isActionPending}
                  >
                    <Text style={styles.actionButtonText}>
                      {isActionPending
                        ? ORDER_CARD_UI.ACTION_PENDING
                        : ORDER_CARD_UI.ACTION_CONFIRM}
                    </Text>
                  </Pressable>
                ) : null}
                {canCancel ? (
                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.actionButtonCancel,
                      isActionPending && styles.actionDisabled,
                    ]}
                    onPress={() => onCancelItem?.({ orderId: order._id, itemIndex })}
                    disabled={isActionPending}
                  >
                    <Text style={[styles.actionButtonText, styles.actionButtonTextCancel]}>
                      {isActionPending
                        ? ORDER_CARD_UI.ACTION_PENDING
                        : ORDER_CARD_UI.ACTION_CANCEL}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            {actionError ? <Text style={styles.itemError}>{actionError}</Text> : null}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  total: {
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  itemsHeading: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  itemBlock: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
  },
  itemLine: {
    fontSize: 14,
    color: "#222",
  },
  itemStatus: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },
  itemActions: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#111",
  },
  actionButtonCancel: {
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#c62828",
  },
  actionDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  actionButtonTextCancel: {
    color: "#c62828",
  },
  itemError: {
    marginTop: 6,
    fontSize: 12,
    color: "#c62828",
  },
});
