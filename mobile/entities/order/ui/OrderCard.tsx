import { useState, type ReactNode } from "react";
import {
  Linking,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { resolveOrderShippingTrackingUrl } from "@molha/api-contract";
import { resolveOrderLineAffiliateSellerLine } from "@izibuy/shared-lib";

import { getOrderItemIndex } from "@/entities/order/lib/getOrderItemIndex";
import { isOrderLineItemProductClickable } from "@/entities/order/lib/isOrderLineItemProductClickable";
import {
  orderNeedsBuyerAttention,
  resolveOrderCollapsedPreview,
} from "@/entities/order/lib/orderNeedsBuyerAttention";
import {
  orderNeedsSellerAttention,
  resolveSellerOrderCollapsedPreview,
} from "@/entities/order/lib/orderNeedsSellerAttention";
import { resolveOrderLineItemName } from "@/entities/order/lib/resolveOrderLineItemName";
import { resolveOrderStatusBadgeStyle } from "@/entities/order/lib/resolveOrderStatusBadgeStyle";
import { resolveOrderStatusLabelRu } from "@/entities/order/lib/resolveOrderStatusLabelRu";
import { resolveOrderSellers } from "@/entities/order/lib/resolveOrderSellers";
import { OrderCardLineItemThumb } from "@/entities/order/ui/OrderCardLineItemThumb";
import { BuyerPassportSharePanel } from "@/entities/installment/ui/BuyerPassportSharePanel";
import {
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import { INSTALLMENT_UI, MY_ORDERS_PAGE_UI, ORDER_CARD_UI, PRODUCT_CARD_UI } from "@/shared/config";
import { formatIsoDateTime, formatPriceRub } from "@/shared/lib";
import { useOrderCardStyles } from "@/shared/theme/commerceScreenStyles";
import { CommerceCardExpandToggle } from "@/shared/ui/CommerceCardExpandToggle";
import {
  formatRuPhoneDisplayOrEmpty,
  toRuPhoneTelHref,
} from "@/entities/user/lib/ruPhone";

type OrderItemActionContext = {
  orderId: string;
  itemIndex: number;
};

type OrderBuyer = { _id?: string; userName?: string; email?: string; userPhoneNumber?: string } | string | null | undefined;

type OrderCardOrder = {
  _id: string;
  status?: string;
  totalAmount?: number;
  deliveryAddress?: string;
  paymentMethod?: string;
  createdAt?: string;
  shippingProvider?: string | null;
  shippingTrackingNumber?: string | null;
  shippingTrackingUrl?: string | null;
  priceOfferId?: string | null;
  installmentContractId?: string | null;
  userBuyerId?: OrderBuyer;
  installmentContract?: {
    planTitle?: string;
    monthsCount?: number;
    monthlyPaymentRub?: number;
  } | null;
  buyerPassportShare?: {
    passport?: Record<string, unknown>;
    passportSelfiePhotoUrl?: string;
    consentAt?: string | null;
  } | null;
  items?: Array<{
    status?: string;
    productId?:
      | string
      | {
          productSeller?:
            | string
            | {
                _id?: string;
                userName?: string;
                email?: string;
                userPhoneNumber?: string;
              }
            | null;
        }
      | null;
  }>;
};

type OrderCardProps = {
  order: OrderCardOrder;
  compact?: boolean;
  showBuyer?: boolean;
  showSeller?: boolean;
  statusSlot?: ReactNode;
  onBuyerNameClick?: (userId: string) => void;
  onSellerNameClick?: (userId: string) => void;
  onProductClick?: (item: unknown) => void;
  onConfirmDelivered?: (ctx: OrderItemActionContext) => void | Promise<void>;
  onCancelItem?: (ctx: OrderItemActionContext) => void | Promise<void>;
  onMarkShipped?: (ctx: OrderItemActionContext) => void | Promise<void>;
  onMarkDelivered?: (ctx: OrderItemActionContext) => void | Promise<void>;
  pendingActionKey?: string | null;
  itemActionErrors?: Record<string, string>;
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  attentionRole?: "buyer" | "seller";
  style?: StyleProp<ViewStyle>;
};

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

const openTelHref = (href: string) => {
  void Linking.openURL(href).catch(() => undefined);
};

const CounterpartyValue = ({
  user,
  onNameClick,
}: {
  user: OrderBuyer;
  onNameClick?: (userId: string) => void;
}) => {
  const styles = useOrderCardStyles();
  if (user == null || typeof user === "string") {
    return <Text style={styles.metaValue}>—</Text>;
  }
  const label = formatBuyerLabel(user);
  const userId = resolveBuyerId(user);
  const canLink = Boolean(onNameClick) && userId != null;
  const phoneDisplay = formatRuPhoneDisplayOrEmpty(user.userPhoneNumber);
  const phoneHref = toRuPhoneTelHref(user.userPhoneNumber);

  return (
    <View style={styles.counterpartyValue}>
      {canLink ? (
        <Pressable onPress={() => onNameClick?.(userId!)}>
          <Text style={styles.buyerLink}>{label}</Text>
        </Pressable>
      ) : (
        <Text style={styles.metaValue}>{label}</Text>
      )}
      {phoneHref ? (
        <Pressable onPress={() => openTelHref(phoneHref)}>
          <Text style={styles.counterpartyPhone}>{phoneDisplay}</Text>
        </Pressable>
      ) : phoneDisplay ? (
        <Text style={styles.counterpartyPhoneText}>{phoneDisplay}</Text>
      ) : null}
    </View>
  );
};

type OrderCardMetaProps = {
  order: OrderCardOrder;
  showBuyer: boolean;
  showSeller: boolean;
  onBuyerNameClick?: (userId: string) => void;
  onSellerNameClick?: (userId: string) => void;
  isInstallmentOrder: boolean;
};

const OrderCardMeta = ({
  order,
  showBuyer,
  showSeller,
  onBuyerNameClick,
  onSellerNameClick,
  isInstallmentOrder,
}: OrderCardMetaProps) => {
  const styles = useOrderCardStyles();
  const sellers = showSeller ? resolveOrderSellers(order) : [];
  const trackingNumber = String(order.shippingTrackingNumber ?? "").trim();
  const trackingUrl = trackingNumber
    ? resolveOrderShippingTrackingUrl(order)
    : null;

  return (
    <View>
      {showBuyer ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{ORDER_CARD_UI.BUYER_LABEL}:</Text>
          <CounterpartyValue user={order.userBuyerId} onNameClick={onBuyerNameClick} />
        </View>
      ) : null}
      {showSeller ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{ORDER_CARD_UI.SELLER_LABEL}:</Text>
          {sellers.length === 0 ? (
            <Text style={styles.metaValue}>—</Text>
          ) : (
            <View style={styles.counterpartyList}>
              {sellers.map((seller, index) => (
                <View key={seller._id} style={styles.counterpartyListItem}>
                  {index > 0 ? <Text style={styles.metaValue}>, </Text> : null}
                  <CounterpartyValue user={seller} onNameClick={onSellerNameClick} />
                </View>
              ))}
            </View>
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
      {trackingNumber ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{ORDER_CARD_UI.TRACKING_LABEL}:</Text>
          {trackingUrl ? (
            <Pressable onPress={() => void Linking.openURL(trackingUrl)}>
              <Text style={styles.buyerLink}>{trackingNumber}</Text>
            </Pressable>
          ) : (
            <Text style={styles.metaValue}>{trackingNumber}</Text>
          )}
        </View>
      ) : null}
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
  showSeller = false,
  statusSlot = null,
  onBuyerNameClick,
  onSellerNameClick,
  onProductClick,
  onConfirmDelivered,
  onCancelItem,
  onMarkShipped,
  onMarkDelivered,
  pendingActionKey = null,
  itemActionErrors = {},
  collapsible = false,
  expanded = true,
  onExpandedChange,
  attentionRole = "buyer",
  style,
}: OrderCardProps) => {
  const styles = useOrderCardStyles();
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const items = Array.isArray(order.items) ? order.items : [];
  const isAuctionOrder = Boolean(order.priceOfferId);
  const isInstallmentOrder = Boolean(order.installmentContractId);
  const statusBadgeColors = resolveOrderStatusBadgeStyle(order.status);
  const isExpanded = !collapsible || expanded;
  const needsAttention =
    attentionRole === "seller"
      ? orderNeedsSellerAttention(order)
      : orderNeedsBuyerAttention(order);
  const collapsedPreview = !isExpanded
    ? attentionRole === "seller"
      ? resolveSellerOrderCollapsedPreview(order)
      : resolveOrderCollapsedPreview(order)
    : null;

  const toggleExpanded = () => {
    onExpandedChange?.(!expanded);
  };

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
      affiliateStatus?: string;
      affiliateAmount?: number;
      affiliatePercentUsed?: number;
      affiliateReferrerUserId?: unknown;
    };
    const productName = resolveOrderLineItemName(item);
    const loyaltyPerUnit = formatLoyaltyPoints(source.loyaltyPointsPerUnitAtOrder);
    const loyaltyReservedTotal = formatLoyaltyPoints(source.loyaltyPointsReservedTotal);
    const deliveredAtText = source.deliveredAt ? formatIsoDateTime(source.deliveredAt) : "";
    const confirmedAtText = source.confirmedAt ? formatIsoDateTime(source.confirmedAt) : "";
    const affiliateSellerLine = resolveOrderLineAffiliateSellerLine({
      item: source,
      attentionRole,
    });

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
        {affiliateSellerLine ? (
          <Text
            style={styles.itemAffiliate}
            accessibilityLabel={ORDER_CARD_UI.AFFILIATE_LINE_ARIA}
          >
            {affiliateSellerLine}
          </Text>
        ) : null}
        <Text style={styles.itemStatus}>
          {ORDER_CARD_UI.ITEM_STATUS_LABEL}: {resolveOrderStatusLabelRu(source.status, attentionRole)}
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
      affiliateStatus?: string;
      affiliateAmount?: number;
      affiliatePercentUsed?: number;
      affiliateReferrerUserId?: unknown;
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
    const affiliateSellerLine = resolveOrderLineAffiliateSellerLine({
      item: source,
      attentionRole,
    });
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

            {affiliateSellerLine ? (
              <Text
                style={styles.itemAffiliate}
                accessibilityLabel={ORDER_CARD_UI.AFFILIATE_LINE_ARIA}
              >
                {affiliateSellerLine}
              </Text>
            ) : null}

            {showSecondaryInline ? (
              <Text style={styles.itemStatus}>
                {ORDER_CARD_UI.ITEM_STATUS_LABEL}: {resolveOrderStatusLabelRu(source.status, attentionRole)}
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
    <View style={[styles.card, needsAttention ? styles.cardAttention : null, style]}>
      <View style={styles.header}>
        <View style={styles.headerMain}>
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
              {resolveOrderStatusLabelRu(order.status, attentionRole)}
            </Text>
            {isAuctionOrder ? (
              <Text style={styles.auctionBadge}>{PRODUCT_CARD_UI.AUCTION_BADGE}</Text>
            ) : null}
            {isInstallmentOrder ? (
              <Text style={styles.installmentBadge}>{INSTALLMENT_UI.BADGE}</Text>
            ) : null}
          </View>
          {collapsible ? (
            <CommerceCardExpandToggle
              expanded={isExpanded}
              accessibilityLabel={MY_ORDERS_PAGE_UI.EXPAND_TOGGLE(isExpanded)}
              onPress={toggleExpanded}
            />
          ) : null}
        </View>
        <Text style={styles.total}>{formatPriceRub(order.totalAmount)}</Text>
      </View>

      {collapsedPreview ? <Text style={styles.collapsedPreview}>{collapsedPreview}</Text> : null}

      {isExpanded ? (
        <>
          {!compact ? (
            <>
              <OrderCardMeta
                order={order}
                showBuyer={showBuyer}
                showSeller={showSeller}
                onBuyerNameClick={onBuyerNameClick}
                onSellerNameClick={onSellerNameClick}
                isInstallmentOrder={isInstallmentOrder}
              />
              {showBuyer && order.buyerPassportShare ? (
                <BuyerPassportSharePanel share={order.buyerPassportShare} />
              ) : null}
            </>
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
                    showSeller={showSeller}
                    onBuyerNameClick={onBuyerNameClick}
                    onSellerNameClick={onSellerNameClick}
                    isInstallmentOrder={isInstallmentOrder}
                  />
                  {showBuyer && order.buyerPassportShare ? (
                    <BuyerPassportSharePanel share={order.buyerPassportShare} />
                  ) : null}
                  {items.map((item, index) =>
                    renderLineItemSecondary(item, index, { showName: true }),
                  )}
                </View>
              ) : null}
            </View>
          ) : null}
        </>
      ) : null}

      {statusSlot ? <View style={styles.footer}>{statusSlot}</View> : null}
    </View>
  );
};
