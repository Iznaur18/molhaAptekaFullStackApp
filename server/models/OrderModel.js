import mongoose from "mongoose";
import {
  SHIPPING_CARRIER_STATUS_MAX_LENGTH,
  SHIPPING_EXTERNAL_ID_MAX_LENGTH,
  SHIPPING_PROVIDERS,
  SHIPPING_SERVICE_TYPES,
  SHIPPING_TRACKING_NUMBER_MAX_LENGTH,
  SHIPPING_TRACKING_URL_MAX_LENGTH,
} from "@molha/api-contract";

import { ADDRESS_LINE_MAX_LENGTH } from "../constants/dadataConstants.js";

import {
  ORDER_LINE_ITEM_QUANTITY_MIN,
  ORDER_PAYMENT_METHODS,
  ORDER_SCHEMA_VERSION,
  ORDER_STATUSES,
  ORDER_STATUS_PENDING,
} from "../constants/orderConstants.js";

const BuyerPassportShareSchema = new mongoose.Schema(
  {
    /** Plain snapshot или AES-GCM vault blob (`__vault: 1`). */
    passport: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    passportSelfiePhotoUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false },
);

const OrderLineItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: ORDER_LINE_ITEM_QUANTITY_MIN,
    },
    unitPriceAtOrder: {
      type: Number,
      required: true,
      min: 0,
    },
    promoCodeAtOrder: {
      type: String,
      default: null,
      trim: true,
      maxlength: 32,
    },
    promoDiscountPercentAtOrder: {
      type: Number,
      default: null,
      min: 1,
      max: 99,
    },
    productNameAtOrder: {
      type: String,
      required: true,
      trim: true,
    },
    /**
     * Продавец позиции на момент заказа.
     *
     * Раньше продавец каждый раз выяснялся через `populate` товара, и связь
     * рвалась вместе с удалением товара. Отправление (заказ + продавец) без
     * этого поля не собрать: группировать не по чему.
     */
    sellerIdAtOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ORDER_STATUSES,
      default: ORDER_STATUS_PENDING,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    /** Когда позиция вернулась продавцу: отказ у двери, неудачное вручение. */
    returnedAt: {
      type: Date,
      default: null,
    },
    /** Кто оформил возврат — покупатель отказался или продавец принял назад. */
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deliveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    loyaltyPointsAwarded: {
      type: Boolean,
      default: false,
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyPointsPerUnitAtOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyPointsReservedTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyPointsReserveReleased: {
      type: Boolean,
      default: false,
    },
    pickupLocationIdAtOrder: {
      type: String,
      default: null,
      trim: true,
      maxlength: 64,
    },
    pickupAddressAtOrder: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },
    pickupLatAtOrder: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
    },
    pickupLonAtOrder: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
    },
    /** Кто привёл покупателя по партнёрской ссылке объявления. */
    affiliateReferrerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    affiliateStatus: {
      type: String,
      enum: ["none", "pending", "paid", "skipped_no_program", "skipped_antifraud"],
      default: "none",
    },
    affiliateAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    affiliatePercentUsed: {
      type: Number,
      default: null,
      min: 0,
    },
    affiliatePaidAt: {
      type: Date,
      default: null,
    },
    /** Бесплатные шт. по акции «Бесплатно от N» (0|1). */
    buyNFreeUnitsAtOrder: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    buyNFreeProgressApplied: {
      type: Boolean,
      default: false,
    },
    buyNFreeProgressAction: {
      type: String,
      enum: ["increment", "reset"],
      default: null,
    },
    buyNFreeProgressCountBefore: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true },
);

/**
 * Отправление — заказ плюс один продавец.
 *
 * Хранится только способ получения: он выбирается покупателем и из позиций не
 * выводится. Состав и статус отправления считаются из `items` по
 * `sellerIdAtOrder` — дублировать их здесь нельзя, разъедутся при первой же
 * смене статуса позиции.
 */
const OrderShipmentSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fulfillmentMethod: {
      type: String,
      required: true,
      enum: ["pickup", "delivery"],
      default: "pickup",
    },
    /**
     * Кто везёт: свободный курьер Gitorg или сам продавец.
     *
     * Без этого «Обзор» предлагал бы курьерам заказы продавцов, которые
     * возят сами, — они на такое не подписывались.
     */
    courierDelivery: { type: Boolean, default: false },
    /**
     * Сколько покупатель предлагает курьеру. У самовывоза всегда 0.
     * Платформа деньги не проводит — это заявленная сумма, но хранить её
     * надо: иначе спор разбирать не по чему.
     */
    deliveryFeeRub: { type: Number, default: 0, min: 0 },
    /** Курьер, принявший отправление в «Обзоре». */
    courierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    courierAssignedAt: { type: Date, default: null },
    /**
     * Коды передачи. Продавец показывает свой курьеру, покупатель — свой при
     * вручении: последовательных кнопок мало, продавец мог бы объявить
     * передачу, пока курьер ещё едет.
     *
     * Храним как есть, а не хешем: код надо показать тому, кто его называет,
     * и он живёт минуты. Защита — счётчик попыток, а не необратимость.
     */
    handoverCode: { type: String, default: "" },
    handoverCodeIssuedAt: { type: Date, default: null },
    handoverAttempts: { type: Number, default: 0, min: 0 },
    /** Код вручения покупателю: генерируется при `delivered`. */
    deliveryCode: { type: String, default: "" },
    deliveryCodeIssuedAt: { type: Date, default: null },
    deliveryAttempts: { type: Number, default: 0, min: 0 },
    /** Курьеры, которым отказали по этому отправлению: назад их не пускаем. */
    declinedCourierIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    userBuyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [OrderLineItemSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Заказ должен содержать хотя бы одну позицию",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: ADDRESS_LINE_MAX_LENGTH,
    },
    deliveryAddressFlat: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    deliveryAddressFiasId: {
      type: String,
      trim: true,
      default: "",
    },
    /**
     * Способ получения на весь заказ.
     *
     * Остаётся для совместимости и как фолбэк для заказов до отправлений;
     * актуальный способ у каждого отправления свой — см. `shipments`.
     */
    fulfillmentMethod: {
      type: String,
      required: true,
      enum: ["pickup", "delivery"],
      default: "pickup",
    },
    shipments: {
      type: [OrderShipmentSchema],
      default: [],
    },
    /** Каркас под СДЭК / Яндекс / Почту; заполняется вручную / API позже. */
    shippingProvider: {
      type: String,
      default: null,
      validate: {
        validator: (value) => value == null || SHIPPING_PROVIDERS.includes(value),
        message: "Неизвестный провайдер доставки",
      },
    },
    shippingServiceType: {
      type: String,
      default: null,
      validate: {
        validator: (value) => value == null || SHIPPING_SERVICE_TYPES.includes(value),
        message: "Неизвестный тип доставки",
      },
    },
    shippingTrackingNumber: {
      type: String,
      trim: true,
      maxlength: SHIPPING_TRACKING_NUMBER_MAX_LENGTH,
      default: null,
    },
    shippingTrackingUrl: {
      type: String,
      trim: true,
      maxlength: SHIPPING_TRACKING_URL_MAX_LENGTH,
      default: null,
    },
    shippingExternalId: {
      type: String,
      trim: true,
      maxlength: SHIPPING_EXTERNAL_ID_MAX_LENGTH,
      default: null,
    },
    shippingCarrierStatus: {
      type: String,
      trim: true,
      maxlength: SHIPPING_CARRIER_STATUS_MAX_LENGTH,
      default: null,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ORDER_PAYMENT_METHODS,
    },
    status: {
      type: String,
      required: true,
      enum: ORDER_STATUSES,
      default: ORDER_STATUS_PENDING,
    },
    schemaVersion: {
      type: Number,
      required: true,
      default: ORDER_SCHEMA_VERSION,
    },
    priceOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductPriceOffer",
      default: null,
    },
    installmentContractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstallmentContract",
      default: null,
    },
    /** Audit: buyer consented to share passport with seller (no PII values). */
    passportShareConsentAt: {
      type: Date,
      default: null,
    },
    /** Snapshot at installment checkout; cleared on cancel. */
    buyerPassportShare: {
      type: BuyerPassportShareSchema,
      default: null,
    },
  },
  { timestamps: true },
);

OrderSchema.index({ userBuyerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

/** GET /order/sales, open-sales lookup, soldQuantity $lookup по productId. */
OrderSchema.index(
  { "items.productId": 1, createdAt: -1 },
  { name: "items_productId_created" },
);

export default mongoose.model("Order", OrderSchema);
