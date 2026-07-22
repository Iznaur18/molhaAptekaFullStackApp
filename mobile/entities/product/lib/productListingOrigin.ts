import {
  PRODUCT_LISTING_ORIGIN_MANUFACTURER,
  PRODUCT_LISTING_ORIGIN_OWN,
  PRODUCT_LISTING_ORIGIN_RESALE,
  PRODUCT_LISTING_ORIGIN_VALUES,
} from "@molha/api-contract";

import { CREATE_PRODUCT_UI, PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";

export type ProductListingOrigin =
  (typeof PRODUCT_LISTING_ORIGIN_VALUES)[number];

/** MaterialIcons name for listing-origin chip. */
export type ProductListingOriginIconName =
  | "person"
  | "storefront"
  | "precision-manufacturing"
  | "help-outline";

export const PRODUCT_LISTING_ORIGIN_OPTIONS: ReadonlyArray<{
  value: ProductListingOrigin;
  label: string;
  iconName: ProductListingOriginIconName;
}> = [
  {
    value: PRODUCT_LISTING_ORIGIN_OWN,
    label: CREATE_PRODUCT_UI.LISTING_ORIGIN_OWN,
    iconName: "person",
  },
  {
    value: PRODUCT_LISTING_ORIGIN_RESALE,
    label: CREATE_PRODUCT_UI.LISTING_ORIGIN_RESALE,
    iconName: "storefront",
  },
  {
    value: PRODUCT_LISTING_ORIGIN_MANUFACTURER,
    label: CREATE_PRODUCT_UI.LISTING_ORIGIN_MANUFACTURER,
    iconName: "precision-manufacturing",
  },
];

export const isProductListingOrigin = (
  value: unknown,
): value is ProductListingOrigin =>
  typeof value === "string" &&
  (PRODUCT_LISTING_ORIGIN_VALUES as readonly string[]).includes(value);

export const resolveProductListingOriginLabel = (value: unknown): string => {
  if (!isProductListingOrigin(value)) {
    return PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_UNSPECIFIED;
  }

  const option = PRODUCT_LISTING_ORIGIN_OPTIONS.find((row) => row.value === value);
  return option?.label ?? PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_UNSPECIFIED;
};

export const resolveProductListingOriginPresentation = (value: unknown) => {
  if (!isProductListingOrigin(value)) {
    return {
      label: PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_UNSPECIFIED,
      iconName: "help-outline" as const,
    };
  }

  const option = PRODUCT_LISTING_ORIGIN_OPTIONS.find((row) => row.value === value);
  return {
    label: option?.label ?? PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_UNSPECIFIED,
    iconName: option?.iconName ?? ("help-outline" as const),
  };
};
