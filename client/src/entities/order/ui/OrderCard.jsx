import { resolveOrderShippingTrackingUrl } from "@molha/api-contract";
import { useState } from "react";

import {
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
  ORDER_PAYMENT_METHOD_LABEL_RU,
} from "../model/constants.js";
import {
  orderNeedsBuyerAttention,
  resolveOrderCollapsedPreview,
} from "../lib/orderNeedsBuyerAttention.js";
import {
  orderNeedsSellerAttention,
  resolveSellerOrderCollapsedPreview,
} from "../lib/orderNeedsSellerAttention.js";
import { buildOrderStatusFromItems } from "@izibuy/shared-lib";

import {
  ORDER_PRE_SHIPMENT_STATUSES,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_STATUS_RETURNED,
} from "../model/constants.js";
import { resolveShipmentAdvanceAction } from "../lib/resolveNextShipmentStatus.js";

const PRE_SHIPMENT_STATUSES = new Set(ORDER_PRE_SHIPMENT_STATUSES);
import { resolveOrderStatusLabelRu } from "../lib/resolveOrderStatusLabelRu.js";
import { resolveOrderSellers } from "../lib/resolveOrderSellers.js";
import {
  COMMON_UI,
  INSTALLMENT_UI,
  MY_ORDERS_PAGE_UI,
  ORDER_CARD_UI,
  PRODUCT_CARD_UI,
  SHIPMENT_DISPUTE_UI,
} from "../../../shared/config/appUiCopy.js";
import { resolveOrderLineSellerId } from "@izibuy/shared-lib";
import {
  PRODUCT_DELIVERY_CARRIER_SELLER,
  resolveProductDeliveryCarrier,
} from "@molha/api-contract";
import { ConfirmButton } from "../../../shared/ui/ConfirmButton/ConfirmButton.jsx";
import {
  isOrderLineItemProductClickable,
  resolveOrderLineItemProductName,
} from "../lib/resolveOrderLineItemProductName.js";
import { OrderCardLineItemThumb } from "./OrderCardLineItemThumb.jsx";
import { resolveOrderLineAffiliateSellerLine } from "../lib/resolveOrderLineAffiliateSellerLine.js";
import { BuyerPassportSharePanel } from "../../installment/ui/BuyerPassportSharePanel.jsx";
import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import {
  formatRuPhoneDisplayOrEmpty,
  toRuPhoneTelHref,
} from "../../user/lib/ruPhone.js";

import "./OrderCard.css";

const formatPaymentMethod = (method) =>
  ORDER_PAYMENT_METHOD_LABEL_RU[method] ?? method ?? COMMON_UI.EM_DASH;

const formatCounterparty = (user) => {
  if (user == null || typeof user === "string") return COMMON_UI.EM_DASH;
  return user.userName?.trim() || user.email || COMMON_UI.EM_DASH;
};

/**
 * @param {{
 *   user: { _id?: string; userName?: string; email?: string; userPhoneNumber?: string } | string | null | undefined;
 *   onNameClick?: (userId: string) => void;
 * }} props
 */
function renderCounterpartyValue(user, onNameClick) {
  if (user == null || typeof user === "string") {
    return COMMON_UI.EM_DASH;
  }
  const label = formatCounterparty(user);
  const canLink = typeof onNameClick === "function" && user._id != null;
  const phoneDisplay = formatRuPhoneDisplayOrEmpty(user.userPhoneNumber);
  const phoneHref = toRuPhoneTelHref(user.userPhoneNumber);

  return (
    <span className="order-card__counterparty">
      {canLink ? (
        <button
          type="button"
          className="order-card__buyer-link"
          onClick={() => onNameClick(String(user._id))}
        >
          {label}
        </button>
      ) : (
        <span className="order-card__counterparty-name">{label}</span>
      )}
      {phoneHref ? (
        <a className="order-card__counterparty-phone" href={phoneHref}>
          {phoneDisplay}
        </a>
      ) : phoneDisplay ? (
        <span className="order-card__counterparty-phone-text">{phoneDisplay}</span>
      ) : null}
    </span>
  );
}

/**
 * @param {{
 *   order: import("../model/types.js").Order;
 *   showBuyer?: boolean;
 *   showSeller?: boolean;
 *   onBuyerNameClick?: (userId: string) => void;
 *   onSellerNameClick?: (userId: string) => void;
 *   isInstallmentOrder: boolean;
 * }} props
 */
function OrderCardMeta({
  order,
  showBuyer = false,
  showSeller = false,
  onBuyerNameClick,
  onSellerNameClick,
  isInstallmentOrder,
}) {
  const trackingUrl = order.shippingTrackingNumber
    ? resolveOrderShippingTrackingUrl(order)
    : null;
  const sellers = showSeller ? resolveOrderSellers(order) : [];

  // Блок покупателя — это отправление одного продавца, и способ у него свой.
  const isPickupShipment = order.fulfillmentMethod !== "delivery";
  const pickupAddresses = isPickupShipment
    ? [
        ...new Set(
          (order.items ?? [])
            .map((item) => String(item?.pickupAddressAtOrder ?? "").trim())
            .filter(Boolean),
        ),
      ]
    : [];
  const shipmentAddress = isPickupShipment
    ? pickupAddresses.join("; ") || order.deliveryAddress
    : order.deliveryAddress;

  return (
    <dl className="order-card__meta">
      {showBuyer ? (
        <div className="order-card__meta-row">
          <dt>{ORDER_CARD_UI.BUYER_LABEL}</dt>
          <dd>{renderCounterpartyValue(order.userBuyerId, onBuyerNameClick)}</dd>
        </div>
      ) : null}
      {showSeller ? (
        <div className="order-card__meta-row">
          <dt>{ORDER_CARD_UI.SELLER_LABEL}</dt>
          <dd>
            {sellers.length === 0
              ? COMMON_UI.EM_DASH
              : sellers.map((seller, index) => (
                  <span key={seller._id}>
                    {index > 0 ? ", " : null}
                    {renderCounterpartyValue(seller, onSellerNameClick)}
                  </span>
                ))}
          </dd>
        </div>
      ) : null}
      <div className="order-card__meta-row">
        <dt>{ORDER_CARD_UI.CREATED_LABEL}</dt>
        <dd>{formatIsoDateTime(order.createdAt)}</dd>
      </div>
      {/* У самовывозного отправления адрес свой — точка выдачи. Показывать
          там адрес покупателя было бы враньём: он туда ничего не везёт. */}
      <div className="order-card__meta-row">
        <dt>
          {isPickupShipment
            ? ORDER_CARD_UI.PICKUP_ADDRESS_LABEL
            : ORDER_CARD_UI.ADDRESS_LABEL}
        </dt>
        <dd>{shipmentAddress || COMMON_UI.EM_DASH}</dd>
      </div>
      {order.shippingTrackingNumber ? (
        <div className="order-card__meta-row">
          <dt>{ORDER_CARD_UI.TRACKING_LABEL}</dt>
          <dd>
            {trackingUrl ? (
              <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                {order.shippingTrackingNumber}
              </a>
            ) : (
              order.shippingTrackingNumber
            )}
          </dd>
        </div>
      ) : null}
      <div className="order-card__meta-row">
        <dt>{ORDER_CARD_UI.PAYMENT_LABEL}</dt>
        <dd>{formatPaymentMethod(order.paymentMethod)}</dd>
      </div>
      {isInstallmentOrder && order.installmentContract ? (
        <div className="order-card__meta-row">
          <dt>{INSTALLMENT_UI.CONTRACT_PLAN}</dt>
          <dd>
            {order.installmentContract.planTitle} ·{" "}
            {order.installmentContract.monthsCount} мес ×{" "}
            {formatPriceRub(order.installmentContract.monthlyPaymentRub)}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

/**
 * @param {{
 *   orderId: string;
 *   item: import("../model/types.js").OrderLineItem;
 *   index: number;
 *   compact?: boolean;
 *   showSecondaryOnly?: boolean;
 *   onProductClick?: (item: import("../model/types.js").OrderLineItem) => void;
 *   onMarkShipped?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onMarkReturned?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onMarkDelivered?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onCancelItem?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onConfirmDelivered?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   pendingActionKey?: string | null;
 *   itemActionErrors?: Record<string, string>;
 *   itemsCount?: number;
 * }} props
 */
function OrderCardLineItem({
  orderId,
  item,
  index,
  compact = false,
  showSecondaryOnly = false,
  itemsCount = 1,
  isPickupShipmentItem = false,
  onProductClick,
  onMarkShipped,
  onMarkReturned,
  buyerUserId,
  onMarkDelivered,
  onCancelItem,
  onConfirmDelivered,
  pendingActionKey = null,
  itemActionErrors = {},
  attentionRole = "buyer",
}) {
  const itemIndex = typeof item.itemIndex === "number" ? item.itemIndex : index;
  const actionKey = `${orderId}:${itemIndex}`;
  const isActionPending = pendingActionKey === actionKey;
  const actionError = itemActionErrors[actionKey] ?? "";
  // Отгрузка — последняя ступень, а не ярлык в обход остальных: иначе рядом
  // с «На сборку» висело второе действие «вперёд», и было непонятно, какое
  // из них правильное. Отменить по-прежнему можно на любой ступени.
  const canMarkShipped = item.status === ORDER_STATUS_READY_TO_SHIP;
  // Отменить можно на любой ступени, пока товар не уехал: это отдельное право,
  // и с отгрузкой его связывать нельзя — иначе кнопка отмены пропадала вместе
  // с ярлыком отгрузки.
  const canCancelItem = PRE_SHIPMENT_STATUSES.has(item.status);
  // На самовывозе продавец не отгружает, а выдаёт товар в руки: кнопка
  // появляется на «Готов к выдаче» и сразу закрывает доставку.
  const canMarkDelivered =
    item.status === ORDER_STATUS_SHIPPED ||
    (isPickupShipmentItem && item.status === "ready_for_pickup");
  const canConfirmDelivered = item.status === ORDER_STATUS_DELIVERED;
  // Возврат оформляется, пока покупатель не подтвердил получение: товар уже
  // уехал, но сделка не состоялась — отказ у двери, неудачное вручение.
  const canMarkReturned =
    item.status === ORDER_STATUS_SHIPPED || item.status === ORDER_STATUS_DELIVERED;
  // Для продавца «клиент отказался» и «я принял назад» — разные ситуации:
  // в первом случае товар ещё едет обратно.
  const returnedByLabel =
    item.status === ORDER_STATUS_RETURNED && item.returnedBy
      ? String(item.returnedBy) === String(buyerUserId)
        ? ORDER_CARD_UI.ITEM_RETURNED_BY_BUYER
        : ORDER_CARD_UI.ITEM_RETURNED_BY_SELLER
      : "";
  const deliveredAtText = item.deliveredAt ? formatIsoDateTime(item.deliveredAt) : "";
  const confirmedAtText = item.confirmedAt ? formatIsoDateTime(item.confirmedAt) : "";
  const loyaltyPoints = Math.floor(Number(item.loyaltyPointsPerUnitAtOrder));
  const productName = resolveOrderLineItemProductName(item);
  const affiliateSellerLine = resolveOrderLineAffiliateSellerLine({
    item,
    attentionRole,
  });
  const showPrimary = !showSecondaryOnly;
  const showSecondary = !compact || showSecondaryOnly;

  if (showSecondaryOnly) {
    const hasSecondary =
      itemsCount > 1 ||
      loyaltyPoints > 0 ||
      deliveredAtText ||
      confirmedAtText ||
      Boolean(affiliateSellerLine);

    if (!hasSecondary) {
      return null;
    }

    return (
      <div className="order-card__item-extras">
        {itemsCount > 1 ? (
          <span className="order-card__item-extras-name">{productName}</span>
        ) : null}
        {loyaltyPoints > 0 ? (
          <span className="order-card__item-loyalty">
            {ORDER_CARD_UI.LOYALTY_POINTS_LINE(loyaltyPoints)}
            {item.quantity > 1
              ? ` · всего ${Math.floor(Number(item.loyaltyPointsReservedTotal) || 0)}`
              : ""}
          </span>
        ) : null}
        {affiliateSellerLine ? (
          <span
            className="order-card__item-affiliate"
            aria-label={ORDER_CARD_UI.AFFILIATE_LINE_ARIA}
          >
            {affiliateSellerLine}
          </span>
        ) : null}
        {deliveredAtText ? (
          <span className="order-card__item-timestamp">
            {ORDER_CARD_UI.ITEM_DELIVERED_AT_LABEL}: {deliveredAtText}
          </span>
        ) : null}
        {confirmedAtText ? (
          <span className="order-card__item-timestamp">
            {ORDER_CARD_UI.ITEM_CONFIRMED_AT_LABEL}: {confirmedAtText}
          </span>
        ) : null}
        {returnedByLabel ? (
          <span className="order-card__item-timestamp">
            {ORDER_CARD_UI.ITEM_RETURNED_AT_LABEL}: {returnedByLabel}
          </span>
        ) : null}
      </div>
    );
  }

  const hasItemActions =
    (canCancelItem && onCancelItem) ||
    (canMarkShipped && onMarkShipped) ||
    (canMarkDelivered && onMarkDelivered) ||
    (canConfirmDelivered && onConfirmDelivered) ||
    (canMarkReturned && onMarkReturned);

  return (
    <li className="order-card__item" role="listitem">
      <OrderCardLineItemThumb
        item={item}
        productName={productName}
        onProductClick={onProductClick}
      />
      <div className="order-card__item-body">
        {showPrimary ? (
          <div className="order-card__item-main">
            {isOrderLineItemProductClickable(item) ? (
              <button
                type="button"
                className="order-card__item-name-button"
                onClick={() => onProductClick?.(item)}
              >
                {productName}
              </button>
            ) : (
              <span className="order-card__item-name">{productName}</span>
            )}
            {compact ? null : (
              <>
                <span className="order-card__item-quantity">×{item.quantity}</span>
                <span className="order-card__item-price">
                  {formatPriceRub(item.unitPriceAtOrder)}
                </span>
              </>
            )}
          </div>
        ) : null}
        {showSecondary && !compact ? (
          <>
            {loyaltyPoints > 0 ? (
              <span className="order-card__item-loyalty">
                {ORDER_CARD_UI.LOYALTY_POINTS_LINE(loyaltyPoints)}
                {item.quantity > 1
                  ? ` · всего ${Math.floor(Number(item.loyaltyPointsReservedTotal) || 0)}`
                  : ""}
              </span>
            ) : null}
            {affiliateSellerLine ? (
              <span
                className="order-card__item-affiliate"
                aria-label={ORDER_CARD_UI.AFFILIATE_LINE_ARIA}
              >
                {affiliateSellerLine}
              </span>
            ) : null}
            <span className="order-card__item-status">
              {ORDER_CARD_UI.ITEM_STATUS_LABEL}:{" "}
              {resolveOrderStatusLabelRu(item.status, attentionRole)}
            </span>
            {deliveredAtText ? (
              <span className="order-card__item-timestamp">
                {ORDER_CARD_UI.ITEM_DELIVERED_AT_LABEL}: {deliveredAtText}
              </span>
            ) : null}
            {confirmedAtText ? (
              <span className="order-card__item-timestamp">
                {ORDER_CARD_UI.ITEM_CONFIRMED_AT_LABEL}: {confirmedAtText}
              </span>
            ) : null}
          </>
        ) : null}
        {compact && affiliateSellerLine ? (
          <span
            className="order-card__item-affiliate"
            aria-label={ORDER_CARD_UI.AFFILIATE_LINE_ARIA}
          >
            {affiliateSellerLine}
          </span>
        ) : null}
      </div>
      {hasItemActions || actionError ? (
        <div className="order-card__item-actions-row">
          {canCancelItem && onCancelItem ? (
            <ConfirmButton
              className="order-card__item-action-button order-card__item-action-button_cancel"
              label={ORDER_CARD_UI.ACTION_CANCEL}
              pendingLabel={ORDER_CARD_UI.ACTION_PENDING}
              isPending={isActionPending}
              question={
                attentionRole === "buyer"
                  ? ORDER_CARD_UI.BUYER_CANCEL_CONFIRM
                  : ORDER_CARD_UI.CANCEL_CONFIRM
              }
              onConfirm={() => onCancelItem({ orderId, itemIndex })}
              disabled={isActionPending}
            />
          ) : null}
          {canMarkShipped && onMarkShipped ? (
            <button
              type="button"
              className="order-card__item-action-button"
              onClick={() => onMarkShipped({ orderId, itemIndex })}
              disabled={isActionPending}
            >
              {isActionPending ? ORDER_CARD_UI.ACTION_PENDING : ORDER_CARD_UI.ACTION_SHIPPED}
            </button>
          ) : null}
          {canMarkDelivered && onMarkDelivered ? (
            <button
              type="button"
              className="order-card__item-action-button"
              onClick={() => onMarkDelivered({ orderId, itemIndex })}
              disabled={isActionPending}
            >
              {isActionPending
                ? ORDER_CARD_UI.ACTION_PENDING
                : isPickupShipmentItem
                  ? ORDER_CARD_UI.ACTION_HANDED_TO_BUYER
                  : ORDER_CARD_UI.ACTION_DELIVERED}
            </button>
          ) : null}
          {canMarkReturned && onMarkReturned ? (
            <ConfirmButton
              className="order-card__item-action-button order-card__item-action-button_cancel"
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
              onConfirm={() => onMarkReturned({ orderId, itemIndex })}
              disabled={isActionPending}
            />
          ) : null}
          {canConfirmDelivered && onConfirmDelivered ? (
            <button
              type="button"
              className="order-card__item-action-button"
              onClick={() => onConfirmDelivered({ orderId, itemIndex })}
              disabled={isActionPending}
            >
              {isActionPending ? ORDER_CARD_UI.ACTION_PENDING : ORDER_CARD_UI.ACTION_CONFIRM}
            </button>
          ) : null}
          {actionError ? (
            <span className="order-card__item-action-error" role="alert">
              {actionError}
            </span>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

/**
 * @param {{
 *   order: import('../model/types.js').Order;
 *   showBuyer?: boolean;
 *   showSeller?: boolean;
 *   statusSlot?: import('react').ReactNode;
 *   onProductClick?: (item: import('../model/types.js').OrderLineItem) => void;
 *   onMarkShipped?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onMarkDelivered?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onMarkReturned?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onCancelItem?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onConfirmDelivered?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   pendingActionKey?: string | null;
 *   itemActionErrors?: Record<string, string>;
 *   onBuyerNameClick?: (userId: string) => void;
 *   onSellerNameClick?: (userId: string) => void;
 *   compact?: boolean;
 *   collapsible?: boolean;
 *   expanded?: boolean;
 *   onExpandedChange?: (expanded: boolean) => void;
 *   attentionRole?: "buyer" | "seller";
 * }} props
 */
export function OrderCard({
  order,
  showBuyer = false,
  showSeller = false,
  compact = false,
  statusSlot = null,
  onProductClick,
  onMarkShipped,
  onMarkDelivered,
  onMarkReturned,
  onCancelItem,
  onConfirmDelivered,
  onAdvanceShipment,
  onIssueHandoverCode,
  onReplaceCourier,
  onConfirmPayment,
  onOpenDispute,
  onCourierNameClick,
  onRaiseDeliveryFee,
  onPayOrder,
  isPayOrderPending = false,
  issuedHandoverCode = "",
  pendingActionKey = null,
  itemActionErrors = {},
  onBuyerNameClick,
  onSellerNameClick,
  collapsible = false,
  expanded = true,
  onExpandedChange,
  attentionRole = "buyer",
}) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const isInstallmentOrder = Boolean(order.installmentContractId);
  const isAuctionOrder = Boolean(order.priceOfferId);
  const isExpanded = !collapsible || expanded;
  const needsAttention =
    attentionRole === "seller"
      ? orderNeedsSellerAttention(order)
      : orderNeedsBuyerAttention(order);
  const collapsedPreview =
    attentionRole === "seller"
      ? resolveSellerOrderCollapsedPreview(order)
      : resolveOrderCollapsedPreview(order);

  const toggleExpanded = () => {
    onExpandedChange?.(!expanded);
  };

  // Отправление ищем по продавцу позиций, а не по «единственному в массиве»:
  // в смешанном заказе блок покупателя несёт все отправления сразу, и
  // shipments[0] мог оказаться чужим — тогда покупатель не видел ни своего
  // кода вручения, ни реквизитов для перевода.
  const cardSellerId = order.items?.length
    ? resolveOrderLineSellerId(order.items[0])
    : "";
  const shipmentOwn =
    (order.shipments ?? []).find(
      (row) => row?.sellerId != null && String(row.sellerId) === cardSellerId,
    ) ?? null;

  // Везёт ли этот товар сам продавец. Способ берём с отправления, а на
  // заказах до отправлений — с общего поля заказа.
  const shipmentMethod =
    shipmentOwn?.fulfillmentMethod ?? order.fulfillmentMethod;
  const shipmentCarrier = resolveProductDeliveryCarrier({
    productDeliveryCarrier: shipmentOwn?.deliveryCarrier,
    productCourierDeliveryEnabled: shipmentOwn?.courierDelivery === true,
    productDeliveryEnabled: shipmentMethod === "delivery",
  });
  const sellerDeliversThisShipment =
    shipmentMethod === "delivery" &&
    shipmentCarrier === PRODUCT_DELIVERY_CARRIER_SELLER;

  const shipmentStatusNow = buildOrderStatusFromItems(order.items);
  // Заказ оформлен с предоплатой, а деньги не пришли: продавцу не показываем
  // кнопки сборки, покупателю — кнопку оплаты, но только после подтверждения.
  const awaitingPrepayment =
    order.paymentMethod === "cardPrepaid" && !order.prepaidPaidAt;
  // Оплата открывается после подтверждения продавцом: сначала он проверяет,
  // что товар есть, и только потом покупатель платит.
  const acceptedBySeller = shipmentStatusNow !== "pending";
  const awaitingSellerAccept = awaitingPrepayment && !acceptedBySeller;
  const awaitingPaymentAfterAccept = awaitingPrepayment && acceptedBySeller;

  const lineItemProps = {
    orderId: order._id,
    compact,
    itemsCount: order.items.length,
    onProductClick,
    // «Отгрузить» — про то, что продавец сам повёз товар. При самовывозе
    // везти некуда: покупатель придёт на точку. На курьерском отправлении
    // отгружает курьер, а кнопка увела бы заказ из «Свободных», оставив
    // товар на руках.
    onMarkShipped:
      sellerDeliversThisShipment && !awaitingPrepayment ? onMarkShipped : undefined,
    isPickupShipmentItem: shipmentMethod !== "delivery",
    onMarkDelivered: awaitingPrepayment ? undefined : onMarkDelivered,
    onMarkReturned,
    onCancelItem,
    onConfirmDelivered,
    buyerUserId: order.userBuyerId?._id ?? order.userBuyerId,
    pendingActionKey,
    itemActionErrors,
    attentionRole,
  };

  const totalQuantity = order.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );

  // Продавцу в «Мои продажи» приходят только его позиции, поэтому их свод и
  // есть статус его отправления. Способ получения берём с самого отправления,
  // а на заказах до отправлений — с общего поля.
  const shipmentFulfillment =
    shipmentOwn?.fulfillmentMethod ?? order.fulfillmentMethod;
  const shipmentAdvanceCandidate =
    attentionRole === "seller" && onAdvanceShipment
      ? resolveShipmentAdvanceAction(shipmentStatusNow, shipmentFulfillment)
      : null;
  // Подтвердить заказ продавец может и до оплаты — это его «товар есть».
  // Всё, что дальше по лестнице, сервер всё равно отклонит, поэтому и кнопку
  // не показываем: мёртвая кнопка хуже, чем её отсутствие.
  const shipmentAdvance =
    shipmentAdvanceCandidate &&
    awaitingPrepayment &&
    shipmentAdvanceCandidate.nextStatus !== "accepted"
      ? null
      : shipmentAdvanceCandidate;
  // Продавец выдаёт код, когда курьер уже приехал за заказом. Покупателю его
  // код сервер отдаёт только на «Доставлен» — раньше он не нужен, а лишний
  // повод показать код это лишний повод его слить.
  const canIssueCode =
    attentionRole === "seller" &&
    Boolean(onIssueHandoverCode) &&
    buildOrderStatusFromItems(order.items) === "courier_assigned";
  const buyerDeliveryCode =
    attentionRole === "buyer" ? (shipmentOwn?.deliveryCode ?? "") : "";
  // Сменить курьера можно только до передачи товара: дальше он уже в машине,
  // и это возврат, а не смена.
  // Продавец подтверждает перевод, когда курьер уже привёз заказ.
  const canConfirmPayment =
    attentionRole === "seller" &&
    Boolean(onConfirmPayment) &&
    order.paymentMethod === "cardOnDelivery" &&
    !shipmentOwn?.paymentConfirmedAt &&
    (shipmentStatusNow === "in_delivery" || shipmentStatusNow === "delivered");
  const paymentConfirmed = Boolean(shipmentOwn?.paymentConfirmedAt);
  const payToRequisites =
    attentionRole === "buyer" ? (shipmentOwn?.sellerPayoutRequisites ?? "") : "";
  const canReplaceCourier =
    Boolean(onReplaceCourier) &&
    buildOrderStatusFromItems(order.items) === "courier_assigned";
  // Товар уже уехал, а курьер молчит. До передачи спора нет: там курьера
  // просто меняют кнопкой выше.
  const canOpenDispute =
    Boolean(onOpenDispute) &&
    (shipmentStatusNow === "courier_holding" ||
      shipmentStatusNow === "in_delivery");
  // Закрытый спор больше не спор: иначе строка про модератора висела бы на
  // заказе вечно.
  // Сумму поднимает покупатель — он за неё и платит, — и только пока никто
  // не взялся везти: после назначения курьера уговор уже состоялся.
  const deliveryFeeRub = Number(shipmentOwn?.deliveryFeeRub) || 0;
  const canRaiseFee =
    attentionRole === "buyer" &&
    Boolean(onRaiseDeliveryFee) &&
    shipmentOwn?.courierDelivery === true &&
    !shipmentOwn?.courierId &&
    // Ступени, на которых заказ ещё ищет курьера.
    (shipmentStatusNow === "pending" ||
      shipmentStatusNow === "accepted" ||
      shipmentStatusNow === "assembling" ||
      shipmentStatusNow === "ready_to_ship");
  const disputeOpened =
    Boolean(shipmentOwn?.disputeOpenedAt) && !shipmentOwn?.disputeResolvedAt;
  const shipmentActionKey = `${order._id}:shipment`;
  const isShipmentActionPending = pendingActionKey === shipmentActionKey;

  const expandedBody = (
    <>
      {compact ? null : (
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
      )}

      {/* Способ показываем всегда: в смешанном заказе покупателю надо видеть,
          какую часть он забирает сам, а какую ему везут. Кнопка — только
          продавцу, и только пока есть куда двигать. */}
      <div className="order-card__shipment-row">
          <span className="order-card__shipment-label">
            {ORDER_CARD_UI.SHIPMENT_HEADING}:{" "}
            {shipmentFulfillment === "delivery"
              ? ORDER_CARD_UI.SHIPMENT_DELIVERY
              : ORDER_CARD_UI.SHIPMENT_PICKUP}
          </span>
          {canConfirmPayment ? (
            <button
              type="button"
              className="order-card__item-action-button"
              onClick={() => onConfirmPayment({ orderId: order._id })}
              disabled={isShipmentActionPending}
            >
              {isShipmentActionPending
                ? ORDER_CARD_UI.ACTION_PENDING
                : ORDER_CARD_UI.SHIPMENT_PAYMENT_CONFIRM}
            </button>
          ) : paymentConfirmed ? (
            <span className="order-card__shipment-label">
              {ORDER_CARD_UI.SHIPMENT_PAYMENT_CONFIRMED}
            </span>
          ) : null}
          {canReplaceCourier ? (
            <ConfirmButton
              className="order-card__item-action-button order-card__item-action-button_cancel"
              label={ORDER_CARD_UI.SHIPMENT_REPLACE_COURIER}
              pendingLabel={ORDER_CARD_UI.ACTION_PENDING}
              isPending={isShipmentActionPending}
              question={ORDER_CARD_UI.SHIPMENT_REPLACE_CONFIRM}
              onConfirm={() => onReplaceCourier({ orderId: order._id })}
              disabled={isShipmentActionPending}
            />
          ) : null}
          {canIssueCode ? (
            issuedHandoverCode ? (
              <span className="order-card__handover-code">
                {ORDER_CARD_UI.SHIPMENT_CODE_SHOWN(issuedHandoverCode)}
              </span>
            ) : (
              <button
                type="button"
                className="order-card__item-action-button"
                onClick={() => onIssueHandoverCode({ orderId: order._id })}
                disabled={isShipmentActionPending}
              >
                {isShipmentActionPending
                  ? ORDER_CARD_UI.ACTION_PENDING
                  : ORDER_CARD_UI.SHIPMENT_ISSUE_CODE}
              </button>
            )
          ) : null}
          {disputeOpened ? (
            <span className="order-card__shipment-label">
              {SHIPMENT_DISPUTE_UI.OPENED}
            </span>
          ) : canOpenDispute ? (
            <ConfirmButton
              className="order-card__item-action-button order-card__item-action-button_cancel"
              label={SHIPMENT_DISPUTE_UI.OPEN}
              pendingLabel={ORDER_CARD_UI.ACTION_PENDING}
              isPending={isShipmentActionPending}
              question={SHIPMENT_DISPUTE_UI.OPEN_CONFIRM}
              onConfirm={() => onOpenDispute({ orderId: order._id })}
              disabled={isShipmentActionPending}
            />
          ) : null}
          {shipmentAdvance ? (
          <button
            type="button"
            className="order-card__item-action-button"
            onClick={() =>
              onAdvanceShipment({
                orderId: order._id,
                nextStatus: shipmentAdvance.nextStatus,
              })
            }
            disabled={isShipmentActionPending}
          >
            {isShipmentActionPending
              ? ORDER_CARD_UI.ACTION_PENDING
              : shipmentAdvance.label}
          </button>
        ) : null}
      </div>

      {/* Кто приедет: имя, рейтинг и авто. Паспорта курьера тут нет и быть
          не должно — сторонам сделки хватает того, что видно у машины. */}
      {shipmentOwn?.courier ? (
        <p className="order-card__courier">
          <span className="order-card__courier-label">
            {ORDER_CARD_UI.SHIPMENT_COURIER}:
          </span>{" "}
          {onCourierNameClick && shipmentOwn.courierId ? (
            <button
              type="button"
              className="order-card__courier-link"
              onClick={() => onCourierNameClick(String(shipmentOwn.courierId))}
            >
              {shipmentOwn.courier.userName}
            </button>
          ) : (
            <strong>{shipmentOwn.courier.userName}</strong>
          )}
          {shipmentOwn.courier.rating != null ? (
            <span className="order-card__courier-rating">
              {" "}
              {ORDER_CARD_UI.SHIPMENT_COURIER_RATING(shipmentOwn.courier.rating)}
            </span>
          ) : null}
          {ORDER_CARD_UI.SHIPMENT_COURIER_CAR(
            shipmentOwn.courier.vehicleMake,
            shipmentOwn.courier.vehicleColor,
            shipmentOwn.courier.vehiclePlate,
          ) ? (
            <span className="order-card__courier-car">
              {" · "}
              {ORDER_CARD_UI.SHIPMENT_COURIER_CAR(
                shipmentOwn.courier.vehicleMake,
                shipmentOwn.courier.vehicleColor,
                shipmentOwn.courier.vehiclePlate,
              )}
            </span>
          ) : null}
        </p>
      ) : null}

      {canRaiseFee ? (
        <div className="order-card__fee">
          <span>{ORDER_CARD_UI.SHIPMENT_FEE(formatPriceRub(deliveryFeeRub))}</span>
          <button
            type="button"
            className="order-card__item-action-button"
            onClick={() =>
              onRaiseDeliveryFee({
                orderId: order._id,
                deliveryFeeRub: Math.max(100, deliveryFeeRub) + 25,
              })
            }
            disabled={isShipmentActionPending}
          >
            {isShipmentActionPending
              ? ORDER_CARD_UI.ACTION_PENDING
              : ORDER_CARD_UI.SHIPMENT_FEE_RAISE}
          </button>
          <span className="order-card__fee-hint">{ORDER_CARD_UI.SHIPMENT_FEE_HINT}</span>
        </div>
      ) : null}

      {awaitingPrepayment ? (
        <div className="order-card__awaiting-prepayment">
          <strong>
            {awaitingSellerAccept
              ? ORDER_CARD_UI.AWAITING_ACCEPT
              : ORDER_CARD_UI.AWAITING_PREPAYMENT}
          </strong>
          <span>
            {awaitingSellerAccept
              ? attentionRole === "seller"
                ? ORDER_CARD_UI.AWAITING_ACCEPT_SELLER_HINT
                : ORDER_CARD_UI.AWAITING_ACCEPT_BUYER_HINT
              : attentionRole === "seller"
                ? ORDER_CARD_UI.AWAITING_PREPAYMENT_SELLER_HINT
                : ORDER_CARD_UI.AWAITING_PREPAYMENT_BUYER_HINT}
          </span>
          {awaitingPaymentAfterAccept && attentionRole === "buyer" && onPayOrder ? (
            <button
              type="button"
              className="order-card__item-action-button"
              onClick={() => onPayOrder({ orderId: order._id })}
              disabled={isPayOrderPending}
            >
              {isPayOrderPending
                ? ORDER_CARD_UI.PAY_NOW_PENDING
                : ORDER_CARD_UI.PAY_NOW}
            </button>
          ) : null}
        </div>
      ) : null}

      {attentionRole === "buyer" && paymentConfirmed ? (
        <div className="order-card__payment-done">
          <strong>{ORDER_CARD_UI.SHIPMENT_PAYMENT_RECEIVED_BY_SELLER}</strong>
          <span>{ORDER_CARD_UI.SHIPMENT_PAYMENT_RECEIVED_HINT}</span>
        </div>
      ) : payToRequisites ? (
        <div className="order-card__buyer-code">
          <strong>{ORDER_CARD_UI.SHIPMENT_PAY_TO(payToRequisites)}</strong>
          <span>{ORDER_CARD_UI.SHIPMENT_PAY_TO_HINT}</span>
        </div>
      ) : null}

      {buyerDeliveryCode ? (
        <div className="order-card__buyer-code">
          <strong>{ORDER_CARD_UI.SHIPMENT_BUYER_CODE(buyerDeliveryCode)}</strong>
          <span>{ORDER_CARD_UI.SHIPMENT_BUYER_CODE_HINT}</span>
        </div>
      ) : null}

      <h3 className="order-card__items-heading">{ORDER_CARD_UI.ITEMS_HEADING}</h3>
      <ul className="order-card__items" role="list">
        {order.items.map((item, index) => (
          <OrderCardLineItem
            key={`${order._id}-${index}`}
            item={item}
            index={index}
            {...lineItemProps}
          />
        ))}
      </ul>

      {compact ? (
        <div
          className={[
            "order-card__details-fold",
            detailsExpanded ? "order-card__details-fold_open" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <button
            type="button"
            className="order-card__details-fold-summary"
            aria-expanded={detailsExpanded}
            onClick={() => setDetailsExpanded((value) => !value)}
          >
            {ORDER_CARD_UI.DETAILS_FOLD_SUMMARY}
          </button>
          <div
            className={[
              "order-card__details-fold-panel",
              detailsExpanded ? "order-card__details-fold-panel_open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="order-card__details-fold-panel-inner">
              <div className="order-card__details-fold-body">
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
                {order.items.map((item, index) => (
                  <OrderCardLineItem
                    key={`${order._id}-extras-${index}`}
                    item={item}
                    index={index}
                    showSecondaryOnly
                    {...lineItemProps}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <article
      className={[
        "order-card",
        compact ? "order-card--compact" : "",
        collapsible ? "order-card--collapsible" : "",
        needsAttention ? "order-card_attention" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="order-card__header">
        <div className="order-card__header-main">
          <div className="order-card__header-badges">
            <span className={`order-card__status order-card__status_${order.status}`}>
              {resolveOrderStatusLabelRu(order.status, attentionRole)}
            </span>
            {isAuctionOrder ? (
              <span className="order-card__auction-badge">{PRODUCT_CARD_UI.AUCTION_BADGE}</span>
            ) : null}
            {isInstallmentOrder ? (
              <span className="order-card__installment-badge">{INSTALLMENT_UI.BADGE}</span>
            ) : null}
          </div>
          {collapsible ? (
            <button
              type="button"
              className="order-card__chevron-button"
              aria-label={MY_ORDERS_PAGE_UI.EXPAND_TOGGLE(isExpanded)}
              aria-expanded={isExpanded}
              onClick={toggleExpanded}
            >
              <span
                className={[
                  "order-card__chevron",
                  isExpanded ? "order-card__chevron_expanded" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
              >
                ▸
              </span>
            </button>
          ) : null}
        </div>
        <div className="order-card__header-totals">
          {compact && totalQuantity > 0 ? (
            <span className="order-card__quantity">×{totalQuantity}</span>
          ) : null}
          <span className="order-card__total">{formatPriceRub(order.totalAmount)}</span>
        </div>
      </header>

      {collapsible ? (
        <div className="order-card__collapsible-region">
          {collapsedPreview ? (
            <div
              className={[
                "order-card__fold",
                !isExpanded ? "order-card__fold_open" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden={isExpanded}
              inert={isExpanded ? true : undefined}
            >
              <div className="order-card__fold-inner">
                <p className="order-card__collapsed-preview">{collapsedPreview}</p>
              </div>
            </div>
          ) : null}
          <div
            className={[
              "order-card__fold",
              isExpanded ? "order-card__fold_open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden={!isExpanded}
            inert={!isExpanded ? true : undefined}
          >
            <div className="order-card__fold-inner order-card__fold-inner_body">
              {expandedBody}
            </div>
          </div>
        </div>
      ) : (
        expandedBody
      )}

      {statusSlot ? <footer className="order-card__footer">{statusSlot}</footer> : null}
    </article>
  );
}
