declare module "@molha/api-contract" {
  export const SHIPPING_PROVIDER_CDEK: string;
  export const SHIPPING_PROVIDER_YANDEX_DELIVERY: string;
  export const SHIPPING_PROVIDER_YANDEX_EXPRESS: string;

  export const PRODUCT_CATALOG_DELIVERY_FILTER_VALUES: readonly string[];
  export const PRODUCT_CATALOG_RATING_MIN_VALUES: readonly number[];
  export const PRODUCT_PRICE_RUB_MAX: number;

  export const PRODUCT_BADGE_EXPLAIN_KEY_VALUES: readonly string[];
  export const PRODUCT_BADGE_EXPLAIN_DESCRIPTION_MAX_LENGTH: number;
  export const PRODUCT_WHOLESALE_MIN_QTY_MIN: number;
  export const PRODUCT_BUY_N_FREE_THRESHOLD_MIN: number;
  export const PRODUCT_BUY_N_FREE_THRESHOLD_MAX: number;

  export const ORDER_FULFILLMENT_DELIVERY: string;
  export const PRODUCT_DELIVERY_CARRIER_SELLER: string;

  export const ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY: string;
  export const ORDER_PAYMENT_METHOD_CARD_PREPAID: string;
  export const ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY: string;
  export const ORDER_PAYMENT_METHODS: readonly string[];

  export const ORDER_STATUS_PENDING: string;
  export const ORDER_STATUS_ACCEPTED: string;
  export const ORDER_STATUS_ASSEMBLING: string;
  export const ORDER_STATUS_READY_FOR_PICKUP: string;
  export const ORDER_STATUS_READY_TO_SHIP: string;
  export const ORDER_STATUS_COURIER_ASSIGNED: string;
  export const ORDER_STATUS_COURIER_HOLDING: string;
  export const ORDER_STATUS_IN_DELIVERY: string;
  export const ORDER_STATUS_CONFIRMED: string;
  export const ORDER_STATUS_SHIPPED: string;
  export const ORDER_STATUS_DELIVERED: string;
  export const ORDER_STATUS_RETURNED: string;
  export const ORDER_STATUS_CANCELLED: string;
  export const ORDER_STATUS_DISPUTED: string;
  export const ORDER_STATUSES: readonly string[];

  type ProductDeliveryCarrierSource =
    | {
        productDeliveryCarrier?: string | null;
        productDeliveryEnabled?: boolean | null;
        productCourierDeliveryEnabled?: boolean | null;
      }
    | null
    | undefined;

  /** Кто везёт товар: поле товара, а у старых товаров — по флагам. */
  export function resolveProductDeliveryCarrier(
    product: ProductDeliveryCarrierSource,
  ): string | null;
  /** Едет ли товар до покупателя вообще — любым перевозчиком. */
  export function productShipsToBuyer(product: ProductDeliveryCarrierSource): boolean;

  /** Продаётся ли товар сейчас за баллы (флаг и цена в баллах). */
  export function isProductPointsSaleActive(
    product: Record<string, any> | null | undefined,
  ): boolean;

  export type SellerDeliveryTariff = {
    paid: boolean;
    baseFeeRub: number;
    perKmRub: number;
    freeFromRub: number;
  };

  export function normalizeSellerDeliveryTariff(raw: unknown): SellerDeliveryTariff;
  export function calculateSellerDeliveryFee(input: {
    tariff: unknown;
    goodsTotalRub?: number;
    distanceKm?: number | null;
  }): {
    feeRub: number;
    isFree: boolean;
    isEstimate: boolean;
    distanceKm: number | null;
  };
}
