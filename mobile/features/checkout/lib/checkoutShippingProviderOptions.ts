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

/** Seller + only live carriers. Locked «скоро» stubs are not shown. */
export function listCheckoutShippingProviderOptions(): CheckoutShippingProviderOption[] {
  return [
    { id: CHECKOUT_SHIPPING_PROVIDER_SELLER, live: true },
    ...SHIPPING_PROVIDERS.filter((id) => isShippingProviderLive(id)).map((id) => ({
      id,
      live: true,
    })),
  ];
}

/** Courier / pickup-point types only when a live carrier exists. */
export function hasCheckoutLiveCarrierProviders(): boolean {
  return listCheckoutShippingProviderOptions().some(
    (option) => option.id !== CHECKOUT_SHIPPING_PROVIDER_SELLER && option.live,
  );
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

export function listCheckoutShippingServiceOptions() {
  return CHECKOUT_SHIPPING_SERVICE_OPTIONS.filter((option) => option.live);
}

export { SHIPPING_SERVICE_COURIER, SHIPPING_SERVICE_PICKUP_POINT };
