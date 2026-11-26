import { type ReactNode } from "react";
import {
  Linking,
  Pressable,
  Text,
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

import { formatOrderNumber } from "@/entities/order/lib/formatOrderNumber";
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
import { OrderCardDetailsFold } from "@/entities/order/ui/OrderCardDetailsFold";
import { OrderCardLineItemThumb } from "@/entities/order/ui/OrderCardLineItemThumb";
import { BuyerPassportSharePanel } from "@/entities/installment/ui/BuyerPassportSharePanel";
import { ConfirmButton } from "@/shared/ui/ConfirmButton";
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
import { formatLoyaltyPointsAmount } from "@molha/api-contract";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useOrderCardStyles } from "@/shared/theme/commerceScreenStyles";
import { CommerceCardExpandToggle } from "@/shared/ui/CommerceCardExpandToggle";
import { Store, Truck } from "@/shared/ui/productDetailsLucideIcons";
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
  /** Товар оплачен баллами; рублями — только доставка. */
  paidWithLoyaltyPoints?: boolean;
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
  /** Tap по шапке карточки → экран деталей заказа. */
  onOpenOrder?: (orderId: string) => void;
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
  stacked = false,
}: {
  user: OrderBuyer;
  onNameClick?: (userId: string) => void;
  stacked?: boolean;
}) => {
  const styles = useOrderCardStyles();
  const valueStyle = stacked
    ? [styles.metaValue, styles.metaValueFold]
    : styles.metaValue;
  const linkStyle = stacked
    ? [styles.buyerLink, styles.buyerLinkFold]
    : styles.buyerLink;
  if (user == null || typeof user === "string") {
    return <Text style={valueStyle}>—</Text>;
  }
  const label = formatBuyerLabel(user);
  const userId = resolveBuyerId(user);
  const canLink = Boolean(onNameClick) && userId != null;
  const phoneDisplay = formatRuPhoneDisplayOrEmpty(user.userPhoneNumber);
  const phoneHref = toRuPhoneTelHref(user.userPhoneNumber);

  return (
    <View
      style={[styles.counterpartyValue, stacked ? styles.counterpartyValueFold : null]}
    >
      {canLink ? (
        <Pressable onPress={() => onNameClick?.(userId!)}>
          <Text style={linkStyle}>{label}</Text>
        </Pressable>
      ) : (
        <Text style={valueStyle}>{label}</Text>
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
  /** web details-fold: label сверху, value снизу, без «:». */
  stacked?: boolean;
};

const OrderCardMeta = ({
  order,
  showBuyer,
  showSeller,
  onBuyerNameClick,
  onSellerNameClick,
  isInstallmentOrder,
  stacked = false,
}: OrderCardMetaProps) => {
  const styles = useOrderCardStyles();
  const sellers = showSeller ? resolveOrderSellers(order) : [];
  const trackingNumber = String(order.shippingTrackingNumber ?? "").trim();
  const trackingUrl = trackingNumber ? resolveOrderShippingTrackingUrl(order) : null;
  const cdek = resolveCdekSummary(order);
  const orderNumber = formatOrderNumber(order._id);
  const isPickupShipment = order.fulfillmentMethod !== "delivery";
  const labelSuffix = stacked ? "" : ":";
  const rowStyle = stacked ? [styles.metaRow, styles.metaRowFold] : styles.metaRow;
  const valueStyle = stacked
    ? [styles.metaValue, styles.metaValueFold]
    : styles.metaValue;
  const linkStyle = stacked
    ? [styles.buyerLink, styles.buyerLinkFold]
    : styles.buyerLink;
  const addressLabel = isPickupShipment
    ? ORDER_CARD_UI.PICKUP_ADDRESS_LABEL
    : ORDER_CARD_UI.ADDRESS_LABEL;

  return (
    <View style={stacked ? styles.metaFold : undefined}>
      {showBuyer ? (
        <View style={rowStyle}>
          <Text style={styles.metaLabel}>
            {ORDER_CARD_UI.BUYER_LABEL}
            {labelSuffix}
          </Text>
          <CounterpartyValue
            user={order.userBuyerId}
            onNameClick={onBuyerNameClick}
            stacked={stacked}
          />
        </View>
      ) : null}
      {showSeller ? (
        <View style={rowStyle}>
          <Text style={styles.metaLabel}>
            {ORDER_CARD_UI.SELLER_LABEL}
            {labelSuffix}
          </Text>
          {sellers.length === 0 ? (
            <Text style={valueStyle}>—</Text>
          ) : (
            <View style={styles.counterpartyList}>
              {sellers.map((seller, index) => (
                <View key={seller._id} style={styles.counterpartyListItem}>
                  {index > 0 && !stacked ? <Text style={valueStyle}>, </Text> : null}
                  <CounterpartyValue
                    user={seller}
                    onNameClick={onSellerNameClick}
                    stacked={stacked}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}
      {orderNumber ? (
        <View style={rowStyle}>
          <Text style={styles.metaLabel}>
            {ORDER_CARD_UI.ORDER_NUMBER_LABEL}
            {labelSuffix}
          </Text>
          <Text style={valueStyle}>{ORDER_CARD_UI.ORDER_NUMBER(orderNumber)}</Text>
        </View>
      ) : null}
      <View style={rowStyle}>
        <Text style={styles.metaLabel}>
          {ORDER_CARD_UI.CREATED_LABEL}
          {labelSuffix}
        </Text>
        <Text style={valueStyle}>{formatIsoDateTime(order.createdAt)}</Text>
      </View>
      <View style={rowStyle}>
        <Text style={styles.metaLabel}>
          {addressLabel}
          {labelSuffix}
        </Text>
        <Text style={valueStyle}>{order.deliveryAddress || "—"}</Text>
      </View>
      {trackingNumber ? (
        <View style={rowStyle}>
          <Text style={styles.metaLabel}>
            {ORDER_CARD_UI.TRACKING_LABEL}
            {labelSuffix}
          </Text>
          {trackingUrl ? (
            <Pressable onPress={() => void Linking.openURL(trackingUrl)}>
              <Text style={linkStyle}>{trackingNumber}</Text>
            </Pressable>
          ) : (
            <Text style={valueStyle}>{trackingNumber}</Text>
          )}
        </View>
      ) : null}
      {cdek ? (
        <View style={rowStyle}>
          <Text style={styles.metaLabel}>
            {ORDER_CARD_UI.CDEK_STATUS_LABEL}
            {labelSuffix}
          </Text>
          <Text style={valueStyle}>{cdek.stage}</Text>
        </View>
      ) : null}
      {cdek?.keepFreeUntil ? (
        <View style={rowStyle}>
          <Text style={styles.metaLabel}>
            {ORDER_CARD_UI.CDEK_PICK_UP_BY_LABEL}
            {labelSuffix}
          </Text>
          <Text style={valueStyle}>{cdek.keepFreeUntil}</Text>
        </View>
      ) : null}
      <View style={rowStyle}>
        <Text style={styles.metaLabel}>
          {ORDER_CARD_UI.PAYMENT_LABEL}
          {labelSuffix}
        </Text>
        <Text style={valueStyle}>
          {order.paidWithLoyaltyPoints === true
            ? order.fulfillmentMethod === "delivery"
              ? ORDER_CARD_UI.PAYMENT_POINTS_WITH_DELIVERY(
                  formatPayment(order.paymentMethod),
                )
              : ORDER_CARD_UI.PAYMENT_POINTS
            : formatPayment(order.paymentMethod)}
        </Text>
      </View>
      {isInstallmentOrder && order.installmentContract ? (
        <View style={rowStyle}>
          <Text style={styles.metaLabel}>
            {INSTALLMENT_UI.CONTRACT_PLAN}
            {labelSuffix}
          </Text>
          <Text style={valueStyle}>
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
  onOpenOrder,
  pendingActionKey = null,
  itemActionErrors = {},
  collapsible = false,
  expanded = true,
  onExpandedChange,
  attentionRole = "buyer",
  style,
}: OrderCardProps) => {
  const styles = useOrderCardStyles();
  const theme = useAppTheme();
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsSummary = summarizeOrderItems(items);
  const orderNumber = formatOrderNumber(order._id);
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
  const shipmentOwn =
    (Array.isArray(order.shipments) ? order.shipments : []).find(
      (row) => row?.sellerId != null && String(row.sellerId) === shipment.sellerId,
    ) ?? null;
  const shipmentFulfillment =
    (shipmentOwn?.fulfillmentMethod as string | undefined) ?? order.fulfillmentMethod;
  const isDeliveryShipment = shipmentFulfillment === "delivery";
  const orderTotalText =
    itemsSummary.pointsTotal > 0
      ? formatLoyaltyPointsAmount(itemsSummary.pointsTotal)
      : formatPriceRub(itemsSummary.totalAmount);
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
  // Покупатель подтверждает получение — справа в shipment-row (как web).
  // Курьер Gitorg: закрытие только кодом, кнопка здесь обходила бы оплату.
  const confirmItemIndexes =
    attentionRole === "buyer" &&
    Boolean(onConfirmDelivered) &&
    shipmentOwn?.courierDelivery !== true
      ? items
          .map((item, index) => {
            const row = item as { itemIndex?: number; status?: string };
            return {
              itemIndex: typeof row.itemIndex === "number" ? row.itemIndex : index,
              status: row.status,
            };
          })
          .filter((row) => row.status === ORDER_STATUS_DELIVERED)
          .map((row) => row.itemIndex)
      : [];
  const canConfirmShipment = confirmItemIndexes.length > 0;
  const isAdvancePending = pendingActionKey === advanceKey;
  const isShipPending = shipItemIndexes.some(isItemPending);
  const isDeliverPending = deliverItemIndexes.some(isItemPending);
  const isHandOverPending = handOverItemIndexes.some(isItemPending);
  const isConfirmPending = confirmItemIndexes.some(isItemPending);
  const isShipmentBusy =
    isAdvancePending ||
    isShipPending ||
    isDeliverPending ||
    isHandOverPending ||
    isConfirmPending ||
    isCancelOrderPending;
  // Ошибка отгрузки или выдачи привязана к позиции и показывается у неё.
  const shipmentActionError = itemActionErrors[advanceKey] ?? "";
  const hasShipmentActions =
    canCancelOrder ||
    canConfirmShipment ||
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
      pointsPriceAtOrder?: number;
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
    // «Подтвердить» — в shipment-row, не у позиции (паритет web).
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
    // «Отгрузить» / «Доставлен» / «Подтвердить» — в shipment-row;
    // у позиции остаются отмена и возврат/отказ.
    const hasItemActions = canCancel || canReturn;
    const quantity = Math.max(0, Math.floor(Number(source.quantity) || 0));
    const unitPriceRub = Number(source.unitPriceAtOrder) || 0;
    const pointsUnit = Math.max(0, Math.floor(Number(source.pointsPriceAtOrder) || 0));
    const isPointsLine = pointsUnit > 0;
    const unitPriceText = isPointsLine
      ? formatLoyaltyPointsAmount(pointsUnit)
      : formatPriceRub(unitPriceRub);
    const lineTotalText = isPointsLine
      ? formatLoyaltyPointsAmount(pointsUnit * quantity)
      : formatPriceRub(unitPriceRub * quantity);

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
              <View style={styles.itemTitleRow}>
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
                {!compact ? (
                  <Text
                    style={[
                      styles.itemQuantity,
                      isCancelled ? styles.itemTextCancelled : undefined,
                    ]}
                  >
                    ×{quantity || 1}
                  </Text>
                ) : null}
              </View>
              {compact ? (
                <View style={styles.itemPriceBlock}>
                  <Text
                    style={[
                      styles.itemPrice,
                      styles.itemPriceCompact,
                      isCancelled ? styles.itemTextCancelled : undefined,
                    ]}
                  >
                    {lineTotalText}
                  </Text>
                  {quantity > 1 ? (
                    <Text
                      style={[
                        styles.itemPriceUnit,
                        isCancelled ? styles.itemTextCancelled : undefined,
                      ]}
                    >
                      {quantity} × {unitPriceText}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text
                  style={[
                    styles.itemPrice,
                    isCancelled ? styles.itemTextCancelled : undefined,
                  ]}
                >
                  {unitPriceText}
                </Text>
              )}
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
            {canCancel || canReturn ? (
              <>
                {canCancel ? (
                  <ConfirmButton
                    variant="popover"
                    label={ORDER_CARD_UI.ACTION_CANCEL}
                    pendingLabel={ORDER_CARD_UI.ACTION_PENDING}
                    isPending={isActionPending}
                    question={ORDER_CARD_UI.ITEM_CANCEL_CONFIRM}
                    onConfirm={() => onCancelItem?.({ orderId: order._id, itemIndex })}
                    disabled={isActionPending}
                    triggerStyle={[
                      styles.actionButton,
                      styles.actionButtonCancel,
                      compact ? styles.actionButtonCompact : null,
                      isActionPending && styles.actionDisabled,
                    ]}
                    triggerTextStyle={[
                      styles.actionButtonText,
                      styles.actionButtonTextCancel,
                    ]}
                  />
                ) : null}
                {canReturn ? (
                  <ConfirmButton
                    variant="popover"
                    label={
                      attentionRole === "seller"
                        ? ORDER_CARD_UI.ACTION_RETURN
                        : ORDER_CARD_UI.ACTION_REFUSE
                    }
                    pendingLabel={ORDER_CARD_UI.ACTION_PENDING}
                    isPending={isActionPending}
                    question={
                      attentionRole === "seller"
                        ? ORDER_CARD_UI.ACTION_RETURN_CONFIRM
                        : ORDER_CARD_UI.ACTION_REFUSE_CONFIRM
                    }
                    onConfirm={() =>
                      onMarkReturned?.({ orderId: order._id, itemIndex })
                    }
                    disabled={isActionPending}
                    triggerStyle={[
                      styles.actionButton,
                      styles.actionButtonCancel,
                      compact ? styles.actionButtonCompact : null,
                      isActionPending && styles.actionDisabled,
                    ]}
                    triggerTextStyle={[
                      styles.actionButtonText,
                      styles.actionButtonTextCancel,
                    ]}
                  />
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
    <View
      style={[
        styles.card,
        compact ? styles.cardCompact : null,
        needsAttention ? styles.cardAttention : null,
        style,
      ]}
    >
      <Pressable
        style={[styles.header, compact ? styles.headerCompact : null]}
        onPress={onOpenOrder ? () => onOpenOrder(order._id) : undefined}
        disabled={!onOpenOrder}
        accessibilityRole={onOpenOrder ? "button" : undefined}
        accessibilityLabel={
          onOpenOrder ? MY_ORDERS_PAGE_UI.OPEN_ORDER_DETAIL_ARIA : undefined
        }
      >
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
            {orderNumber ? (
              <Text
                style={styles.orderNumber}
                accessibilityLabel={ORDER_CARD_UI.ORDER_NUMBER_LABEL}
              >
                {ORDER_CARD_UI.ORDER_NUMBER(orderNumber)}
              </Text>
            ) : null}
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
        <View style={styles.headerTotals}>
          {compact && itemsSummary.quantity > 0 ? (
            <Text style={styles.headerQuantity}>×{itemsSummary.quantity}</Text>
          ) : null}
          <Text style={[styles.total, compact ? styles.totalCompact : null]}>
            {orderTotalText}
          </Text>
        </View>
      </Pressable>

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

          {/* web `.order-card__shipment-row` — способ + действия над позициями. */}
          <View style={styles.shipmentRow}>
            <View style={styles.shipmentMethod}>
              <View style={styles.shipmentIcon} accessibilityElementsHidden>
                {isDeliveryShipment ? (
                  <Truck size={18} strokeWidth={2} color={theme.colors.action} />
                ) : (
                  <Store size={18} strokeWidth={2} color={theme.colors.action} />
                )}
              </View>
              <View style={styles.shipmentMethodCopy}>
                <Text style={styles.shipmentMethodCaption}>
                  {ORDER_CARD_UI.SHIPMENT_HEADING}
                </Text>
                <Text style={styles.shipmentMethodValue}>
                  {isDeliveryShipment
                    ? ORDER_CARD_UI.SHIPMENT_DELIVERY
                    : ORDER_CARD_UI.SHIPMENT_PICKUP}
                </Text>
              </View>
            </View>
            {hasShipmentActions || shipmentActionError || cancelOrderError ? (
              <View style={styles.shipmentActions}>
                {canCancelOrder ? (
                  <ConfirmButton
                    variant="popover"
                    label={ORDER_CARD_UI.ACTION_CANCEL_ORDER}
                    pendingLabel={ORDER_CARD_UI.ACTION_PENDING}
                    isPending={isCancelOrderPending}
                    question={
                      attentionRole === "buyer"
                        ? ORDER_CARD_UI.BUYER_CANCEL_CONFIRM
                        : ORDER_CARD_UI.CANCEL_CONFIRM
                    }
                    onConfirm={() =>
                      onCancelOrder?.({
                        orderId: order._id,
                        sellerId: shipment.sellerId,
                      })
                    }
                    disabled={isShipmentBusy}
                    triggerStyle={[
                      styles.actionButton,
                      styles.actionButtonCancel,
                      compact ? styles.actionButtonCompact : null,
                      isShipmentBusy && styles.actionDisabled,
                    ]}
                    triggerTextStyle={[
                      styles.actionButtonText,
                      styles.actionButtonTextCancel,
                    ]}
                  />
                ) : null}
                {shipmentAdvance ? (
                  <Pressable
                    style={[
                      styles.actionButton,
                      compact ? styles.actionButtonCompact : null,
                      isShipmentBusy && styles.actionDisabled,
                    ]}
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
                    style={[
                      styles.actionButton,
                      compact ? styles.actionButtonCompact : null,
                      isShipmentBusy && styles.actionDisabled,
                    ]}
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
                    style={[
                      styles.actionButton,
                      compact ? styles.actionButtonCompact : null,
                      isShipmentBusy && styles.actionDisabled,
                    ]}
                    onPress={() =>
                      void runForItems(deliverItemIndexes, onMarkDelivered)
                    }
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
                    style={[
                      styles.actionButton,
                      compact ? styles.actionButtonCompact : null,
                      isShipmentBusy && styles.actionDisabled,
                    ]}
                    onPress={() =>
                      void runForItems(handOverItemIndexes, onMarkDelivered)
                    }
                    disabled={isShipmentBusy}
                  >
                    <Text style={styles.actionButtonText}>
                      {isHandOverPending
                        ? ORDER_CARD_UI.ACTION_PENDING
                        : ORDER_CARD_UI.ACTION_HANDED_TO_BUYER}
                    </Text>
                  </Pressable>
                ) : null}
                {canConfirmShipment ? (
                  <Pressable
                    style={[
                      styles.actionButton,
                      compact ? styles.actionButtonCompact : null,
                      isShipmentBusy && styles.actionDisabled,
                    ]}
                    onPress={() =>
                      void runForItems(confirmItemIndexes, onConfirmDelivered)
                    }
                    disabled={isShipmentBusy}
                    accessibilityRole="button"
                  >
                    <Text style={styles.actionButtonText}>
                      {isConfirmPending
                        ? ORDER_CARD_UI.ACTION_PENDING
                        : ORDER_CARD_UI.ACTION_CONFIRM}
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
          </View>

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

          <View style={styles.itemsList}>
            {items.map((item, index) => renderLineItem(item, index))}
          </View>

          {compact ? (
            <OrderCardDetailsFold>
              <OrderCardMeta
                order={order}
                showBuyer={showBuyer}
                showSeller={showSeller}
                onBuyerNameClick={onBuyerNameClick}
                onSellerNameClick={onSellerNameClick}
                isInstallmentOrder={isInstallmentOrder}
                stacked
              />
              {showBuyer && order.buyerPassportShare ? (
                <BuyerPassportSharePanel share={order.buyerPassportShare} />
              ) : null}
              {items.map((item, index) =>
                renderLineItemSecondary(item, index, { showName: true }),
              )}
            </OrderCardDetailsFold>
          ) : null}
        </>
      ) : null}

      {statusSlot ? <View style={styles.footer}>{statusSlot}</View> : null}
    </View>
  );
};
