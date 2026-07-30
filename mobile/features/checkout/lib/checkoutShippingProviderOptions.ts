import {
  SHIPPING_PROVIDER_LABEL_RU,
  SHIPPING_PROVIDERS,
  SHIPPING_SERVICE_COURIER,
  SHIPPING_SERVICE_PICKUP_POINT,
  isShippingProviderLive,
} from "@molha/api-contract";

export const CHECKOUT_SHIPPING_PROVIDER_SELLER = "seller";

export type CheckoutShippingProviderOption = {
  id: string;
  live: boolean;
};

export function listCheckoutShippingProviderOptions(): CheckoutShippingProviderOption[] {
  return [
    { id: CHECKOUT_SHIPPING_PROVIDER_SELLER, live: true },
    ...SHIPPING_PROVIDERS.map((id) => ({
      id,
      live: isShippingProviderLive(id),
    })),
  ];
}

export function resolveCheckoutShippingProviderLabel(
  providerId: string,
  labels: { sellerLabel: string },
): string {
  if (providerId === CHECKOUT_SHIPPING_PROVIDER_SELLER) {
    return labels.sellerLabel;
  }
  return SHIPPING_PROVIDER_LABEL_RU[
    providerId as keyof typeof SHIPPING_PROVIDER_LABEL_RU
  ] ?? providerId;
}

export const CHECKOUT_SHIPPING_SERVICE_OPTIONS = [
  { id: SHIPPING_SERVICE_COURIER, live: false },
  { id: SHIPPING_SERVICE_PICKUP_POINT, live: false },
] as const;

export { SHIPPING_SERVICE_COURIER, SHIPPING_SERVICE_PICKUP_POINT };
