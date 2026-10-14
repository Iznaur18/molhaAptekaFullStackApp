declare module "@molha/api-contract" {
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
