import { useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { getOrderItemIndex } from "@/entities/order/lib/getOrderItemIndex";
import { isOrderLineItemProductClickable } from "@/entities/order/lib/isOrderLineItemProductClickable";
import { resolveOrderLineItemName } from "@/entities/order/lib/resolveOrderLineItemName";
import { resolveOrderStatusBadgeStyle } from "@/entities/order/lib/resolveOrderStatusBadgeStyle";
import { OrderCardLineItemThumb } from "@/entities/order/ui/OrderCardLineItemThumb";
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

type OrderBuyer = { _id?: string; userName?: string; email?: string } | string | null | undefined;

type OrderCardOrder = {
  _id: string;
  status?: string;
  totalAmount?: number;
  deliveryAddress?: string;
  paymentMethod?: string;
  createdAt?: string;
  priceOfferId?: string | null;
  installmentContractId?: string | null;
  userBuyerId?: OrderBuyer;
  installmentContract?: {
    planTitle?: string;
    monthsCount?: number;
    monthlyPaymentRub?: number;
  } | null;
  items?: unknown[];
};

type OrderCardProps = {
  order: OrderCardOrder;
  compact?: boolean;
  showBuyer?: boolean;
  statusSlot?: ReactNode;
  onBuyerNameClick?: (userId: string) => void;
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

const formatBuyerLabel = (buyer: OrderBuyer) => {
  if (buyer == null || typeof buyer === "string") {
    return "—";
  }
  return String(buyer.userName ?? "").trim() || buyer.email || "—";
};

const resolveBuyerId = (buyer: OrderBuyer): string | null => {
  if (buyer == null || typeof buyer === "string") {
    return typeof buyer === "string" && buyer.trim() ? buyer.trim() : null;
  }
  return buyer._id != null ? String(buyer._id) : null;
};

type OrderCardMetaProps = {
  order: OrderCardOrder;
  showBuyer: boolean;
  onBuyerNameClick?: (userId: string) => void;
  isInstallmentOrder: boolean;
};

const OrderCardMeta = ({
  order,
  showBuyer,
  onBuyerNameClick,
  isInstallmentOrder,
}: OrderCardMetaProps) => {
  const styles = useOrderCardStyles();
  const buyerId = resolveBuyerId(order.userBuyerId);
  const canLinkBuyer = Boolean(onBuyerNameClick) && buyerId != null;

  return (
    <View>
      {showBuyer ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{ORDER_CARD_UI.BUYER_LABEL}:</Text>
          {canLinkBuyer ? (
            <Pressable onPress={() => onBuyerNameClick?.(buyerId!)}>
              <Text style={styles.buyerLink}>{formatBuyerLabel(order.userBuyerId)}</Text>
            </Pressable>
          ) : (
            <Text style={styles.metaValue}>{formatBuyerLabel(order.userBuyerId)}</Text>
          )}
        </View>
      ) : null}
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{ORDER_CARD_UI.CREATED_LABEL}:</Text>
        <Text style={styles.metaValue}>{formatIsoDateTime(order.createdAt)}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{ORDER_CARD_UI.ADDRESS_LABEL}:</Text>
        <Text style={styles.metaValue}>{order.deliveryAddress || "—"}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{ORDER_CARD_UI.PAYMENT_LABEL}:</Text>
        <Text style={styles.metaValue}>{formatPayment(order.paymentMethod)}</Text>
      </View>
      {isInstallmentOrder && order.installmentContract ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{INSTALLMENT_UI.CONTRACT_PLAN}:</Text>
          <Text style={styles.metaValue}>
            {order.installmentContract.planTitle} · {order.installmentContract.monthsCount} мес ×{" "}
            {formatPriceRub(order.installmentContract.monthlyPaymentRub)}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export const OrderCard = ({
  order,
  compact = false,
  showBuyer = false,
  statusSlot = null,
  onBuyerNameClick,
  onProductClick,
  onConfirmDelivered,
  onCancelItem,
  onMarkShipped,
  onMarkDelivered,
  pendingActionKey = null,
  itemActionErrors = {},
}: OrderCardProps) => {
  const styles = useOrderCardStyles();
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const items = Array.isArray(order.items) ? order.items : [];
  const isAuctionOrder = Boolean(order.priceOfferId);
  const isInstallmentOrder = Boolean(order.installmentContractId);
  const statusBadgeColors = resolveOrderStatusBadgeStyle(order.status);

  const renderLineItemSecondary = (
    item: unknown,
    index: number,
    options: { showName?: boolean } = {},
  ) => {
    const source = item as {
      quantity?: number;
      status?: string;
      loyaltyPointsPerUnitAtOrder?: number;
      loyaltyPointsReservedTotal?: number;
      deliveredAt?: string;
      confirmedAt?: string;
    };
    const productName = resolveOrderLineItemName(item);
    const loyaltyPerUnit = formatLoyaltyPoints(source.loyaltyPointsPerUnitAtOrder);
    const loyaltyReservedTotal = formatLoyaltyPoints(source.loyaltyPointsReservedTotal);
    const deliveredAtText = source.deliveredAt ? formatIsoDateTime(source.deliveredAt) : "";
    const confirmedAtText = source.confirmedAt ? formatIsoDateTime(source.confirmedAt) : "";

    return (
      <View key={`extras-${index}`} style={styles.itemExtras}>
        {options.showName && items.length > 1 ? (
          <Text style={styles.itemExtrasName}>{productName}</Text>
        ) : null}
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
      </View>
    );
  };

  const renderLineItem = (item: unknown, index: number) => {
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
    const canConfirm = source.status === ORDER_STATUS_DELIVERED && Boolean(onConfirmDelivered);
    const canMarkShipped = source.status === ORDER_STATUS_PENDING && Boolean(onMarkShipped);
    const canMarkDelivered = source.status === ORDER_STATUS_SHIPPED && Boolean(onMarkDelivered);
    const key = source._id ?? `item-${index}`;
    const productName = resolveOrderLineItemName(item);
    const isProductClickable = Boolean(onProductClick) && isOrderLineItemProductClickable(item);
    const loyaltyPerUnit = formatLoyaltyPoints(source.loyaltyPointsPerUnitAtOrder);
    const loyaltyReservedTotal = formatLoyaltyPoints(source.loyaltyPointsReservedTotal);
    const deliveredAtText = source.deliveredAt ? formatIsoDateTime(source.deliveredAt) : "";
    const confirmedAtText = source.confirmedAt ? formatIsoDateTime(source.confirmedAt) : "";
    const showSecondaryInline = !compact;
    const hasItemActions =
      (canMarkShipped && (onMarkShipped || onCancelItem)) ||
      (canMarkDelivered && onMarkDelivered) ||
      (canConfirm || (canCancel && !onMarkShipped));

    return (
      <View
        key={key}
        style={[styles.itemBlock, compact ? styles.itemBlockCompact : undefined]}
      >
        <View style={styles.itemRow}>
          <OrderCardLineItemThumb
            item={item}
            productName={productName}
            onProductClick={onProductClick}
          />
          <View style={styles.itemBody}>
            <View style={styles.itemMain}>
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
              <Text style={styles.itemPrice}>{formatPriceRub(source.unitPriceAtOrder)}</Text>
            </View>

            {showSecondaryInline && loyaltyPerUnit > 0 ? (
              <Text style={styles.itemLoyalty}>
                {ORDER_CARD_UI.LOYALTY_POINTS_LINE(loyaltyPerUnit)}
                {(source.quantity ?? 1) > 1 ? ` · всего ${loyaltyReservedTotal}` : ""}
              </Text>
            ) : null}

            {showSecondaryInline ? (
              <Text style={styles.itemStatus}>
                {ORDER_CARD_UI.ITEM_STATUS_LABEL}: {formatStatus(source.status)}
              </Text>
            ) : null}

            {showSecondaryInline && deliveredAtText ? (
              <Text style={styles.itemTimestamp}>
                {ORDER_CARD_UI.ITEM_DELIVERED_AT_LABEL}: {deliveredAtText}
              </Text>
            ) : null}

            {showSecondaryInline && confirmedAtText ? (
              <Text style={styles.itemTimestamp}>
                {ORDER_CARD_UI.ITEM_CONFIRMED_AT_LABEL}: {confirmedAtText}
              </Text>
            ) : null}
          </View>
        </View>

        {hasItemActions || actionError ? (
          <View style={styles.itemActionsRow}>
            {canMarkShipped && (onMarkShipped || onCancelItem) ? (
              <>
                {onMarkShipped ? (
                  <Pressable
                    style={[styles.actionButton, isActionPending && styles.actionDisabled]}
                    onPress={() => onMarkShipped({ orderId: order._id, itemIndex })}
                    disabled={isActionPending}
                  >
                    <Text style={styles.actionButtonText}>
                      {isActionPending ? ORDER_CARD_UI.ACTION_PENDING : ORDER_CARD_UI.ACTION_SHIPPED}
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
                      {isActionPending ? ORDER_CARD_UI.ACTION_PENDING : ORDER_CARD_UI.ACTION_CANCEL}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
            {canMarkDelivered && onMarkDelivered ? (
              <Pressable
                style={[styles.actionButton, isActionPending && styles.actionDisabled]}
                onPress={() => onMarkDelivered({ orderId: order._id, itemIndex })}
                disabled={isActionPending}
              >
                <Text style={styles.actionButtonText}>
                  {isActionPending ? ORDER_CARD_UI.ACTION_PENDING : ORDER_CARD_UI.ACTION_DELIVERED}
                </Text>
              </Pressable>
            ) : null}
            {canConfirm || (canCancel && !onMarkShipped) ? (
              <>
                {canConfirm ? (
                  <Pressable
                    style={[styles.actionButton, isActionPending && styles.actionDisabled]}
                    onPress={() => onConfirmDelivered?.({ orderId: order._id, itemIndex })}
                    disabled={isActionPending}
                  >
                    <Text style={styles.actionButtonText}>
                      {isActionPending ? ORDER_CARD_UI.ACTION_PENDING : ORDER_CARD_UI.ACTION_CONFIRM}
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
                      {isActionPending ? ORDER_CARD_UI.ACTION_PENDING : ORDER_CARD_UI.ACTION_CANCEL}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
            {actionError ? <Text style={styles.itemError}>{actionError}</Text> : null}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerBadges}>
          <Text
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusBadgeColors.backgroundColor,
                color: statusBadgeColors.color,
              },
            ]}
          >
            {formatStatus(order.status)}
          </Text>
          {isAuctionOrder ? (
            <Text style={styles.auctionBadge}>{PRODUCT_CARD_UI.AUCTION_BADGE}</Text>
          ) : null}
          {isInstallmentOrder ? (
            <Text style={styles.installmentBadge}>{INSTALLMENT_UI.BADGE}</Text>
          ) : null}
        </View>
        <Text style={styles.total}>{formatPriceRub(order.totalAmount)}</Text>
      </View>

      {!compact ? (
        <OrderCardMeta
          order={order}
          showBuyer={showBuyer}
          onBuyerNameClick={onBuyerNameClick}
          isInstallmentOrder={isInstallmentOrder}
        />
      ) : null}

      <View style={styles.itemsList}>
        {items.map((item, index) => renderLineItem(item, index))}
      </View>

      {compact ? (
        <View style={styles.detailsFold}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setDetailsExpanded((value) => !value)}
          >
            <Text style={styles.detailsFoldSummary}>{ORDER_CARD_UI.DETAILS_FOLD_SUMMARY}</Text>
          </Pressable>
          {detailsExpanded ? (
            <View style={styles.detailsFoldBody}>
              <OrderCardMeta
                order={order}
                showBuyer={showBuyer}
                onBuyerNameClick={onBuyerNameClick}
                isInstallmentOrder={isInstallmentOrder}
              />
              {items.map((item, index) =>
                renderLineItemSecondary(item, index, { showName: true }),
              )}
            </View>
          ) : null}
        </View>
      ) : null}

      {statusSlot ? <View style={styles.footer}>{statusSlot}</View> : null}
    </View>
  );
};
