import {
  PRODUCT_LISTING_ORIGIN_MANUFACTURER,
  PRODUCT_LISTING_ORIGIN_OWN,
  PRODUCT_LISTING_ORIGIN_RESALE,
  PRODUCT_LISTING_ORIGIN_VALUES,
} from "@molha/api-contract";
import { Factory, HelpCircle, Store, User } from "lucide-react";

import { CREATE_PRODUCT_MODAL_UI, PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";

/** @typedef {'own' | 'resale' | 'manufacturer'} ProductListingOrigin */

export const PRODUCT_LISTING_ORIGIN_OPTIONS = [
  {
    value: PRODUCT_LISTING_ORIGIN_OWN,
    label: CREATE_PRODUCT_MODAL_UI.LISTING_ORIGIN_OWN,
    Icon: User,
  },
  {
    value: PRODUCT_LISTING_ORIGIN_RESALE,
    label: CREATE_PRODUCT_MODAL_UI.LISTING_ORIGIN_RESALE,
    Icon: Store,
  },
  {
    value: PRODUCT_LISTING_ORIGIN_MANUFACTURER,
    label: CREATE_PRODUCT_MODAL_UI.LISTING_ORIGIN_MANUFACTURER,
    Icon: Factory,
  },
];

/**
 * @param {unknown} value
 * @returns {value is ProductListingOrigin}
 */
export function isProductListingOrigin(value) {
  return (
    typeof value === "string" && PRODUCT_LISTING_ORIGIN_VALUES.includes(value)
  );
}

/**
 * @param {unknown} value
 */
export function resolveProductListingOriginLabel(value) {
  if (!isProductListingOrigin(value)) {
    return PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_UNSPECIFIED;
  }
  const option = PRODUCT_LISTING_ORIGIN_OPTIONS.find((row) => row.value === value);
  return option?.label ?? PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_UNSPECIFIED;
}

/**
 * @param {unknown} value
 */
export function resolveProductListingOriginPresentation(value) {
  if (!isProductListingOrigin(value)) {
    return {
      label: PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_UNSPECIFIED,
      Icon: HelpCircle,
    };
  }

  const option = PRODUCT_LISTING_ORIGIN_OPTIONS.find((row) => row.value === value);
  return {
    label: option?.label ?? PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_UNSPECIFIED,
    Icon: option?.Icon ?? HelpCircle,
  };
}
