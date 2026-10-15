import { useState, type ReactNode } from "react";
import {
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  SHIPPING_PROVIDER_CDEK,
  formatCdekKeepFreeUntil,
  formatCdekStageLabel,
  isCdekAwaitingPickup,
  resolveOrderShippingTrackingUrl,
} from "@molha/api-contract";
import {
  canCancelOrderItem,
  canMarkOrderItemReturned,
  resolveOrderLineAffiliateSellerLine,
  summarizeOrderItems,
} from "@izibuy/shared-lib";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
import { resolveOrderShipmentActions } from "@/entities/order/lib/resolveOrderShipmentActions";
import { resolveOrderStatusBadgeStyle } from "@/entities/order/lib/resolveOrderStatusBadgeStyle";
import { resolveOrderStatusLabelRu } from "@/entities/order/lib/resolveOrderStatusLabelRu";
import {
  resolveOrderSellers,
  type OrderLineLike,
} from "@/entities/order/lib/resolveOrderSellers";
import { OrderCardLineItemThumb } from "@/entities/order/ui/OrderCardLineItemThumb";
import { BuyerPassportSharePanel } from "@/entities/installment/ui/BuyerPassportSharePanel";
import {
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_RETURNED,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import {
  INSTALLMENT_UI,
  MY_ORDERS_PAGE_UI,
  ORDER_CARD_UI,
  PRODUCT_CARD_UI,
} from "@/shared/config";
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

type OrderBuyer =
  | { _id?: string; userName?: string; email?: string; userPhoneNumber?: string }
  | string
  | null
  | undefined;

type OrderCardOrder = {
  _id: string;
  status?: string;
  totalAmount?: number;
  deliveryAddress?: string;
  paymentMethod?: string;
  /** Когда прошла предоплата по СБП; пусто — заказ ещё ждёт денег. */
  prepaidPaidAt?: unknown;
  /** Срок оплаты: ставит сервер, когда продавец подтвердил заказ. */
  prepaymentDueAt?: unknown;
  fulfillmentMethod?: string;
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
  items?: OrderLineLike[];
  // Отправления приходят из API как есть (passthrough) — поля читаем бережно.
  shipments?: Array<Record<string, unknown>>;
};

type CdekWaybillLike = {
  uuid?: unknown;
  status?: unknown;
  statusCode?: unknown;
  keepFreeUntil?: unknown;
  cancelledAt?: unknown;
};

/**
 * Посылка СДЭК: этап так, как его пишет сам СДЭК («Готов к выдаче»), и —
 * пока она в пункте — до какого дня её забрать.
 */
const resolveCdekSummary = (order: OrderCardOrder) => {
  const shipment = (order.shipments ?? []).find(
    (row) =>
      row?.deliveryCarrier === SHIPPING_PROVIDER_CDEK &&
      Boolean((row.cdekWaybill as CdekWaybillLike | null | undefined)?.uuid),
  );
  const waybill = shipment?.cdekWaybill as CdekWaybillLike | undefined;
  if (!waybill || waybill.cancelledAt) return null;
  const statusCode = typeof waybill.statusCode === "string" ? waybill.statusCode : "";
  const rawStatus = typeof waybill.status === "string" ? waybill.status : "";
  const stage = formatCdekStageLabel(statusCode, rawStatus);
  if (!stage) return null;
  const keepFreeUntil =
    isCdekAwaitingPickup(statusCode) && typeof waybill.keepFreeUntil === "string"
      ? formatCdekKeepFreeUntil(waybill.keepFreeUntil)
      : "";
  return { stage, keepFreeUntil };
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
  /** «Отказаться» (покупатель) / «Вернулся» (продавец) после отгрузки. */
  onMarkReturned?: (ctx: OrderItemActionContext) => void | Promise<void>;
  /** «Отменить заказ» — заказ продавца целиком, пока весь он у продавца. */
  onCancelOrder?: (ctx: { orderId: string; sellerId: string }) => void | Promise<void>;
  onMarkShipped?: (ctx: OrderItemActionContext) => void | Promise<void>;
  onMarkDelivered?: (ctx: OrderItemActionContext) => void | Promise<void>;
  /** Продавец двигает отправление на следующую ступень сборки. */
  onAdvanceShipment?: (ctx: {
    orderId: string;
    nextStatus: string;
  }) => void | Promise<void>;
  /** Покупатель оплачивает заказ с предоплатой по СБП. */
  onPayOrder?: (ctx: { orderId: string }) => void | Promise<void>;
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

/** «4 октября, 15:30» — срок оплаты по СБП во времени устройства покупателя. */
const formatPrepaymentDue = (value: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(date)
    .replace(" в ", ", ");
};

/** Ключ действия над отправлением целиком — рядом с ключами позиций. */
export const orderShipmentActionKey = (
  orderId: string,
  action: "advance" | "pay" | "cancel",
) => `${orderId}:${action}`;

const formatLoyaltyPoints = (value: unknown) => Math.floor(Number(value) || 0);

/**
 * «покупатель отказался» / «оформил продавец» у возвращённой позиции: для
 * продавца это разные ситуации — в первом случае товар ещё едет обратно.
 */
const resolveReturnedByLabel = (
  item: { status?: string; returnedBy?: unknown },
  buyerId: string,
): string => {
  if (item.status !== ORDER_STATUS_RETURNED || item.returnedBy == null) return "";
  const returnedBy =
    typeof item.returnedBy === "object"
      ? String((item.returnedBy as { _id?: unknown })._id ?? "")
      : String(item.returnedBy);
  if (!returnedBy) return "";
  return returnedBy === buyerId
    ? ORDER_CARD_UI.ITEM_RETURNED_BY_BUYER
    : ORDER_CARD_UI.ITEM_RETURNED_BY_SELLER;
};

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
  const trackingUrl = trackingNumber ? resolveOrderShippingTrackingUrl(order) : null;
  const cdek = resolveCdekSummary(order);

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
      {cdek ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{ORDER_CARD_UI.CDEK_STATUS_LABEL}:</Text>
          <Text style={styles.metaValue}>{cdek.stage}</Text>
        </View>
      ) : null}
      {cdek?.keepFreeUntil ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{ORDER_CARD_UI.CDEK_PICK_UP_BY_LABEL}:</Text>
          <Text style={styles.metaValue}>{cdek.keepFreeUntil}</Text>
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
            {order.installmentContract.planTitle} ·{" "}
            {order.installmentContract.monthsCount} мес ×{" "}
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
  onMarkReturned,
  onCancelOrder,
  onMarkShipped,
  onMarkDelivered,
  onAdvanceShipment,
  onPayOrder,
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

  // Кнопки отправления целиком — не у каждой позиции: продавец собирает
  // свой кусок заказа, а не строку за строкой.
  const shipment = resolveOrderShipmentActions(order, attentionRole);
  const advanceKey = orderShipmentActionKey(order._id, "advance");
  const payKey = orderShipmentActionKey(order._id, "pay");
  const cancelOrderKey = orderShipmentActionKey(order._id, "cancel");
  const buyerId = resolveBuyerId(order.userBuyerId) ?? "";
  // Одна кнопка на весь заказ продавца — как на сайте, не построчно.
  const canCancelOrder = Boolean(onCancelOrder) && shipment.canCancelOrder;
  const isCancelOrderPending = pendingActionKey === cancelOrderKey;
  const cancelOrderError = itemActionErrors[cancelOrderKey] ?? "";
  const isItemPending = (itemIndex: number) =>
    pendingActionKey === `${order._id}:${itemIndex}`;
  const shipmentAdvance = onAdvanceShipment ? shipment.advance : null;
  const shipItemIndexes = onMarkShipped ? shipment.shipItemIndexes : [];
  const deliverItemIndexes = onMarkDelivered ? shipment.deliverItemIndexes : [];
  const handOverItemIndexes = onMarkDelivered ? shipment.handOverItemIndexes : [];
  const isAdvancePending = pendingActionKey === advanceKey;
  const isShipPending = shipItemIndexes.some(isItemPending);
  const isDeliverPending = deliverItemIndexes.some(isItemPending);
  const isHandOverPending = handOverItemIndexes.some(isItemPending);
  const isShipmentBusy =
    isAdvancePending ||
    isShipPending ||
    isDeliverPending ||
    isHandOverPending ||
    isCancelOrderPending;
  // Ошибка отгрузки или выдачи привязана к позиции и показывается у неё.
  const shipmentActionError = itemActionErrors[advanceKey] ?? "";
  const hasShipmentActions =
    canCancelOrder ||
    Boolean(shipmentAdvance) ||
    shipItemIndexes.length > 0 ||
    deliverItemIndexes.length > 0 ||
    handOverItemIndexes.length > 0;
  const runForItems = async (
    itemIndexes: number[],
    action?: (ctx: OrderItemActionContext) => void | Promise<void>,
  ) => {
    for (const itemIndex of itemIndexes) {
      await action?.({ orderId: order._id, itemIndex });
    }
  };

  const isPayPending = pendingActionKey === payKey;
  const payError = itemActionErrors[payKey] ?? "";
  const prepaymentDueText = formatPrepaymentDue(shipment.prepaymentDueAt);
  const canPayNow =
    shipment.awaitingPaymentAfterAccept &&
    attentionRole === "buyer" &&
    Boolean(onPayOrder);

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
      returnedBy?: unknown;
    };
    const productName = resolveOrderLineItemName(item);
    const returnedByLabel = resolveReturnedByLabel(source, buyerId);
    const loyaltyPerUnit = formatLoyaltyPoints(source.loyaltyPointsPerUnitAtOrder);
    const loyaltyReservedTotal = formatLoyaltyPoints(source.loyaltyPointsReservedTotal);
    const deliveredAtText = source.deliveredAt
      ? formatIsoDateTime(source.deliveredAt)
      : "";
    const confirmedAtText = source.confirmedAt
      ? formatIsoDateTime(source.confirmedAt)
      : "";
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
          {ORDER_CARD_UI.ITEM_STATUS_LABEL}:{" "}
          {resolveOrderStatusLabelRu(source.status, attentionRole)}
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
        {returnedByLabel ? (
          <Text style={styles.itemTimestamp}>
            {ORDER_CARD_UI.ITEM_RETURNED_AT_LABEL}: {returnedByLabel}
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
      returnedBy?: unknown;
    };
    const itemIndex = getOrderItemIndex(source, index);
    const actionKey = `${order._id}:${itemIndex}`;
    const isActionPending = pendingActionKey === actionKey;
    const actionError = itemActionErrors[actionKey] ?? "";
    // Отменить можно, пока товар у продавца (все ступени до отгрузки), — как
    // на сервере и сайте; раньше кнопка была только у «В обработке».
    const canCancel = canCancelOrderItem(source.status) && Boolean(onCancelItem);
    const canReturn =
      canMarkOrderItemReturned({
        status: source.status,
        carrierTracksShipment: shipment.carrierTracksShipment,
      }) && Boolean(onMarkReturned);
    const returnedByLabel = resolveReturnedByLabel(source, buyerId);
    const canConfirm =
      source.status === ORDER_STATUS_DELIVERED && Boolean(onConfirmDelivered);
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
    const affiliateSellerLine = resolveOrderLineAffiliateSellerLine({
      item: source,
      attentionRole,
    });
    const showSecondaryInline = !compact;
    // В компактной карточке статус строки не печатается, поэтому отменённую
    // позицию видно только по метке.
    const isCancelled = source.status === ORDER_STATUS_CANCELLED;
    // «Отгрузить», «Доставлен» и ступени сборки — в строке отправления ниже:
    // у позиции остаются только отмена и подтверждение получения.
    const hasItemActions = canConfirm || canCancel || canReturn;

    return (
      <View
        key={key}
        style={[
          styles.itemBlock,
          compact ? styles.itemBlockCompact : undefined,
          isCancelled ? styles.itemBlockCancelled : undefined,
        ]}
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
                <Pressable
                  onPress={() => onProductClick?.(item)}
                  style={styles.itemNamePressable}
                >
                  <Text
                    style={[
                      styles.itemNameLink,
                      isCancelled ? styles.itemTextCancelled : undefined,
                    ]}
                    numberOfLines={2}
                  >
                    {productName}
                  </Text>
                </Pressable>
              ) : (
                <Text
                  style={[
                    styles.itemLine,
                    isCancelled ? styles.itemTextCancelled : undefined,
                  ]}
                  numberOfLines={2}
                >
                  {productName}
                </Text>
              )}
              {isCancelled ? (
                <Text style={styles.itemCancelledBadge}>
                  {ORDER_CARD_UI.ITEM_CANCELLED_BADGE}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.itemQuantity,
                  isCancelled ? styles.itemTextCancelled : undefined,
                ]}
              >
                ×{source.quantity ?? 1}
              </Text>
              <Text
                style={[
                  styles.itemPrice,
                  isCancelled ? styles.itemTextCancelled : undefined,
                ]}
              >
                {formatPriceRub(source.unitPriceAtOrder)}
              </Text>
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
                {ORDER_CARD_UI.ITEM_STATUS_LABEL}:{" "}
                {resolveOrderStatusLabelRu(source.status, attentionRole)}
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

            {showSecondaryInline && returnedByLabel ? (
              <Text style={styles.itemTimestamp}>
                {ORDER_CARD_UI.ITEM_RETURNED_AT_LABEL}: {returnedByLabel}
              </Text>
            ) : null}
          </View>
        </View>

        {hasItemActions || actionError ? (
          <View style={styles.itemActionsRow}>
            {canConfirm || canCancel || canReturn ? (
              <>
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
                    <Text
                      style={[styles.actionButtonText, styles.actionButtonTextCancel]}
                    >
                      {isActionPending
                        ? ORDER_CARD_UI.ACTION_PENDING
                        : ORDER_CARD_UI.ACTION_CANCEL}
                    </Text>
                  </Pressable>
                ) : null}
                {canReturn ? (
                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.actionButtonCancel,
                      isActionPending && styles.actionDisabled,
                    ]}
                    onPress={() => onMarkReturned?.({ orderId: order._id, itemIndex })}
                    disabled={isActionPending}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[styles.actionButtonText, styles.actionButtonTextCancel]}
                    >
                      {isActionPending
                        ? ORDER_CARD_UI.ACTION_PENDING
                        : attentionRole === "seller"
                          ? ORDER_CARD_UI.ACTION_RETURN
                          : ORDER_CARD_UI.ACTION_REFUSE}
                    </Text>
                  </Pressable>
                ) : null}
                {canConfirm ? (
                  <Pressable
                    style={[
                      styles.actionButton,
                      isActionPending && styles.actionDisabled,
                    ]}
                    onPress={() =>
                      onConfirmDelivered?.({ orderId: order._id, itemIndex })
                    }
                    disabled={isActionPending}
                  >
                    <Text style={styles.actionButtonText}>
                      {isActionPending
                        ? ORDER_CARD_UI.ACTION_PENDING
                        : ORDER_CARD_UI.ACTION_CONFIRM}
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
        <Text style={styles.total}>
          {formatPriceRub(summarizeOrderItems(order.items).totalAmount)}
        </Text>
      </View>

      {collapsedPreview ? (
        <Text style={styles.collapsedPreview}>{collapsedPreview}</Text>
      ) : null}

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

          {hasShipmentActions || shipmentActionError || cancelOrderError ? (
            <View style={styles.itemActionsRow}>
              {canCancelOrder ? (
                <Pressable
                  style={[
                    styles.actionButton,
                    styles.actionButtonCancel,
                    isShipmentBusy && styles.actionDisabled,
                  ]}
                  onPress={() =>
                    onCancelOrder?.({ orderId: order._id, sellerId: shipment.sellerId })
                  }
                  disabled={isShipmentBusy}
                  accessibilityRole="button"
                >
                  <Text
                    style={[styles.actionButtonText, styles.actionButtonTextCancel]}
                  >
                    {isCancelOrderPending
                      ? ORDER_CARD_UI.ACTION_PENDING
                      : ORDER_CARD_UI.ACTION_CANCEL_ORDER}
                  </Text>
                </Pressable>
              ) : null}
              {shipmentAdvance ? (
                <Pressable
                  style={[styles.actionButton, isShipmentBusy && styles.actionDisabled]}
                  onPress={() =>
                    onAdvanceShipment?.({
                      orderId: order._id,
                      nextStatus: shipmentAdvance.nextStatus,
                    })
                  }
                  disabled={isShipmentBusy}
                >
                  <Text style={styles.actionButtonText}>
                    {isAdvancePending
                      ? ORDER_CARD_UI.ACTION_PENDING
                      : shipmentAdvance.label}
                  </Text>
                </Pressable>
              ) : null}
              {shipItemIndexes.length > 0 ? (
                <Pressable
                  style={[styles.actionButton, isShipmentBusy && styles.actionDisabled]}
                  onPress={() => void runForItems(shipItemIndexes, onMarkShipped)}
                  disabled={isShipmentBusy}
                >
                  <Text style={styles.actionButtonText}>
                    {isShipPending
                      ? ORDER_CARD_UI.ACTION_PENDING
                      : ORDER_CARD_UI.ACTION_SHIPPED}
                  </Text>
                </Pressable>
              ) : null}
              {deliverItemIndexes.length > 0 ? (
                <Pressable
                  style={[styles.actionButton, isShipmentBusy && styles.actionDisabled]}
                  onPress={() => void runForItems(deliverItemIndexes, onMarkDelivered)}
                  disabled={isShipmentBusy}
                >
                  <Text style={styles.actionButtonText}>
                    {isDeliverPending
                      ? ORDER_CARD_UI.ACTION_PENDING
                      : ORDER_CARD_UI.ACTION_DELIVERED}
                  </Text>
                </Pressable>
              ) : null}
              {handOverItemIndexes.length > 0 ? (
                <Pressable
                  style={[styles.actionButton, isShipmentBusy && styles.actionDisabled]}
                  onPress={() => void runForItems(handOverItemIndexes, onMarkDelivered)}
                  disabled={isShipmentBusy}
                >
                  <Text style={styles.actionButtonText}>
                    {isHandOverPending
                      ? ORDER_CARD_UI.ACTION_PENDING
                      : ORDER_CARD_UI.ACTION_HANDED_TO_BUYER}
                  </Text>
                </Pressable>
              ) : null}
              {shipmentActionError ? (
                <Text style={styles.itemError}>{shipmentActionError}</Text>
              ) : null}
              {cancelOrderError ? (
                <Text style={styles.itemError}>{cancelOrderError}</Text>
              ) : null}
            </View>
          ) : null}

          {shipment.awaitingPrepayment ? (
            <View style={styles.awaitingPrepayment}>
              <Text style={styles.awaitingPrepaymentTitle}>
                {shipment.awaitingSellerAccept
                  ? ORDER_CARD_UI.AWAITING_ACCEPT
                  : ORDER_CARD_UI.AWAITING_PREPAYMENT}
              </Text>
              <Text style={styles.awaitingPrepaymentHint}>
                {shipment.awaitingSellerAccept
                  ? attentionRole === "seller"
                    ? ORDER_CARD_UI.AWAITING_ACCEPT_SELLER_HINT
                    : ORDER_CARD_UI.AWAITING_ACCEPT_BUYER_HINT
                  : attentionRole === "seller"
                    ? ORDER_CARD_UI.AWAITING_PREPAYMENT_SELLER_HINT
                    : ORDER_CARD_UI.AWAITING_PREPAYMENT_BUYER_HINT}
              </Text>
              {shipment.awaitingPaymentAfterAccept &&
              attentionRole === "buyer" &&
              prepaymentDueText ? (
                <Text style={styles.prepaymentDue}>
                  {ORDER_CARD_UI.PREPAYMENT_DUE(prepaymentDueText)}
                </Text>
              ) : null}
              {canPayNow ? (
                <Pressable
                  style={[styles.payNowButton, isPayPending && styles.actionDisabled]}
                  onPress={() => onPayOrder?.({ orderId: order._id })}
                  disabled={isPayPending}
                  accessibilityRole="button"
                >
                  <Text style={styles.payNowButtonText}>
                    {isPayPending
                      ? ORDER_CARD_UI.PAY_NOW_PENDING
                      : shipment.prepaymentAmountRub > 0
                        ? ORDER_CARD_UI.PAY_NOW_AMOUNT(
                            formatPriceRub(shipment.prepaymentAmountRub),
                          )
                        : ORDER_CARD_UI.PAY_NOW}
                  </Text>
                </Pressable>
              ) : null}
              {payError ? <Text style={styles.itemError}>{payError}</Text> : null}
            </View>
          ) : null}

          {compact ? (
            <View style={styles.detailsFold}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: detailsExpanded }}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setDetailsExpanded((value) => !value);
                }}
              >
                <Text style={styles.detailsFoldSummary}>
                  {detailsExpanded ? "▾ " : "▸ "}
                  {ORDER_CARD_UI.DETAILS_FOLD_SUMMARY}
                </Text>
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
