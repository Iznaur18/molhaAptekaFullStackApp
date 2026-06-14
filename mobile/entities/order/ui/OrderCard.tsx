import { Pressable, StyleSheet, Text, View } from "react-native";

import { getOrderItemIndex } from "@/entities/order/lib/getOrderItemIndex";
import { isOrderLineItemProductClickable } from "@/entities/order/lib/isOrderLineItemProductClickable";
import { resolveOrderLineItemName } from "@/entities/order/lib/resolveOrderLineItemName";
import {
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_LABEL_RU,
  type OrderPaymentMethod,
  type OrderStatus,
} from "@/entities/order/model/constants";
import { INSTALLMENT_UI, ORDER_CARD_UI, PRODUCT_CARD_UI } from "@/shared/config";
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
    priceOfferId?: string | null;
    installmentContractId?: string | null;
    items?: unknown[];
  };
  onProductClick?: (item: unknown) => void;
  onConfirmDelivered?: (ctx: OrderItemActionContext) => void | Promise<void>;
  onCancelItem?: (ctx: OrderItemActionContext) => void | Promise<void>;
  onMarkShipped?: (ctx: OrderItemActionContext) => void | Promise<void>;
  onMarkDelivered?: (ctx: OrderItemActionContext) => void | Promise<void>;
  pendingActionKey?: string | null;
  itemActionErrors?: Record<string, string>;
};

const formatStatus = (status?: string) =>
  ORDER_STATUS_LABEL_RU[status as OrderStatus] ?? status ?? "—";

const formatPayment = (method?: string) =>
  ORDER_PAYMENT_METHOD_LABEL_RU[method as OrderPaymentMethod] ?? method ?? "—";

const formatLoyaltyPoints = (value: unknown) => Math.floor(Number(value) || 0);

export const OrderCard = ({
  order,
  onProductClick,
  onConfirmDelivered,
  onCancelItem,
  onMarkShipped,
  onMarkDelivered,
  pendingActionKey = null,
  itemActionErrors = {},
}: OrderCardProps) => {
  const items = Array.isArray(order.items) ? order.items : [];
  const isAuctionOrder = Boolean(order.priceOfferId);
  const isInstallmentOrder = Boolean(order.installmentContractId);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerBadges}>
          <Text style={styles.status}>{formatStatus(order.status)}</Text>
          {isAuctionOrder ? (
            <Text style={styles.typeBadge}>{PRODUCT_CARD_UI.AUCTION_BADGE}</Text>
          ) : null}
          {isInstallmentOrder ? (
            <Text style={styles.typeBadge}>{INSTALLMENT_UI.BADGE}</Text>
          ) : null}
        </View>
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
          unitPriceAtOrder?: number;
          loyaltyPointsPerUnitAtOrder?: number;
          loyaltyPointsReservedTotal?: number;
          deliveredAt?: string;
          confirmedAt?: string;
        };
        const itemIndex = getOrderItemIndex(source, index);
        const actionKey = `${order._id}:${itemIndex}`;
        const isActionPending = pendingActionKey === actionKey;
        const actionError = itemActionErrors[actionKey] ?? "";
        const canCancel = source.status === ORDER_STATUS_PENDING && Boolean(onCancelItem);
        const canConfirm =
          source.status === ORDER_STATUS_DELIVERED && Boolean(onConfirmDelivered);
        const canMarkShipped = source.status === ORDER_STATUS_PENDING && Boolean(onMarkShipped);
        const canMarkDelivered =
          source.status === ORDER_STATUS_SHIPPED && Boolean(onMarkDelivered);
        const key = source._id ?? `item-${index}`;
        const productName = resolveOrderLineItemName(item);
        const isProductClickable =
          Boolean(onProductClick) && isOrderLineItemProductClickable(item);
        const loyaltyPerUnit = formatLoyaltyPoints(source.loyaltyPointsPerUnitAtOrder);
        const loyaltyReservedTotal = formatLoyaltyPoints(source.loyaltyPointsReservedTotal);
        const deliveredAtText = source.deliveredAt
          ? formatIsoDateTime(source.deliveredAt)
          : "";
        const confirmedAtText = source.confirmedAt
          ? formatIsoDateTime(source.confirmedAt)
          : "";

        return (
          <View key={key} style={styles.itemBlock}>
            <View style={styles.itemTitleRow}>
              {isProductClickable ? (
                <Pressable onPress={() => onProductClick?.(item)} style={styles.itemNamePressable}>
                  <Text style={styles.itemNameLink} numberOfLines={2}>
                    {productName}
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.itemLine} numberOfLines={2}>
                  {productName}
                </Text>
              )}
              <Text style={styles.itemQuantity}>×{source.quantity ?? 1}</Text>
            </View>

            <Text style={styles.itemPrice}>{formatPriceRub(source.unitPriceAtOrder)}</Text>

            {loyaltyPerUnit > 0 ? (
              <Text style={styles.itemLoyalty}>
                {ORDER_CARD_UI.LOYALTY_POINTS_LINE(loyaltyPerUnit)}
                {(source.quantity ?? 1) > 1 ? ` · всего ${loyaltyReservedTotal}` : ""}
              </Text>
            ) : null}

            <Text style={styles.itemStatus}>
              {ORDER_CARD_UI.ITEM_STATUS_LABEL}: {formatStatus(source.status)}
            </Text>

            {deliveredAtText ? (
              <Text style={styles.itemTimestamp}>
                {ORDER_CARD_UI.ITEM_DELIVERED_AT_LABEL}: {deliveredAtText}
              </Text>
            ) : null}

            {confirmedAtText ? (
              <Text style={styles.itemTimestamp}>
                {ORDER_CARD_UI.ITEM_CONFIRMED_AT_LABEL}: {confirmedAtText}
              </Text>
            ) : null}

            {canMarkShipped && (onMarkShipped || onCancelItem) ? (
              <View style={styles.itemActions}>
                {onMarkShipped ? (
                  <Pressable
                    style={[styles.actionButton, isActionPending && styles.actionDisabled]}
                    onPress={() => onMarkShipped({ orderId: order._id, itemIndex })}
                    disabled={isActionPending}
                  >
                    <Text style={styles.actionButtonText}>
                      {isActionPending
                        ? ORDER_CARD_UI.ACTION_PENDING
                        : ORDER_CARD_UI.ACTION_SHIPPED}
                    </Text>
                  </Pressable>
                ) : null}
                {onCancelItem ? (
                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.actionButtonCancel,
                      isActionPending && styles.actionDisabled,
                    ]}
                    onPress={() => onCancelItem({ orderId: order._id, itemIndex })}
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
            {canMarkDelivered && onMarkDelivered ? (
              <View style={styles.itemActions}>
                <Pressable
                  style={[styles.actionButton, isActionPending && styles.actionDisabled]}
                  onPress={() => onMarkDelivered({ orderId: order._id, itemIndex })}
                  disabled={isActionPending}
                >
                  <Text style={styles.actionButtonText}>
                    {isActionPending
                      ? ORDER_CARD_UI.ACTION_PENDING
                      : ORDER_CARD_UI.ACTION_DELIVERED}
                  </Text>
                </Pressable>
              </View>
            ) : null}
            {canConfirm || (canCancel && !onMarkShipped) ? (
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
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  headerBadges: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#555",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
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
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  itemNamePressable: {
    flex: 1,
  },
  itemLine: {
    flex: 1,
    fontSize: 14,
    color: "#222",
  },
  itemNameLink: {
    fontSize: 14,
    color: "#1565c0",
    fontWeight: "600",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    marginTop: 4,
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },
  itemLoyalty: {
    marginTop: 4,
    fontSize: 12,
    color: "#2e7d32",
  },
  itemStatus: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },
  itemTimestamp: {
    marginTop: 2,
    fontSize: 12,
    color: "#888",
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
