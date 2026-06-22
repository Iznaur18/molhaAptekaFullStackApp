import { hasProductDescriptionContent } from "@izibuy/shared-lib";

import { COMMON_UI } from "../../../shared/config/appUiCopy.js";
import { formatProductFieldForDisplay } from "./formatProductFieldForDisplay.js";
import { getProductFieldRegistryEntry } from "./productFieldRegistry.js";
import { resolveProductImageUrls } from "./resolveProductImageUrls.js";

/**
 * @param {string} key
 * @param {import("../model/types.js").ProductFromApi | null | undefined} product
 */
export function isProductDetailsFieldVisible(key, product) {
  if (!product) {
    return false;
  }

  const entry = getProductFieldRegistryEntry(key);
  if (!entry?.detailsHideWhenEmpty) {
    return true;
  }

  if (key === "productDescription") {
    return hasProductDescriptionContent(product);
  }

  if (key === "productImageUrls") {
    return resolveProductImageUrls(product).length > 0;
  }

  return formatProductFieldForDisplay(key, product) !== COMMON_UI.EM_DASH;
}

/**
 * @param {readonly string[]} keys
 * @param {import("../model/types.js").ProductFromApi | null | undefined} product
 */
export function filterProductDetailsVisibleFieldKeys(keys, product) {
  return keys.filter((key) => isProductDetailsFieldVisible(key, product));
}
