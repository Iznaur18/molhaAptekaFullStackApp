import { Pressable, Text, View } from "react-native";

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
import { useOrderCardStyles } from "@/shared/theme/commerceScreenStyles";

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
  const styles = useOrderCardStyles();
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
