import {
  hasProductCharacteristicsContent,
  hasProductDescriptionContent,
} from "@izibuy/shared-lib";

import { PRODUCT_DETAILS_CONTENT_PANEL } from "./productDetailsContentPanelConstants.js";

/**
 * @param {import("../model/types.js").ProductFromApi | null | undefined} product
 * @param {readonly string[]} bottomBlockFieldKeys
 */
export function resolveProductDetailsContentPanels(product, bottomBlockFieldKeys) {
  const hasDescription =
    bottomBlockFieldKeys.includes("productDescription") &&
    hasProductDescriptionContent(product);
  const hasCharacteristics = hasProductCharacteristicsContent(product);
  const otherBlockFieldKeys = bottomBlockFieldKeys.filter(
    (key) => key !== "productDescription",
  );
  const showSwitcher = hasDescription || hasCharacteristics;
  const defaultPanel = hasDescription
    ? PRODUCT_DETAILS_CONTENT_PANEL.DESCRIPTION
    : hasCharacteristics
      ? PRODUCT_DETAILS_CONTENT_PANEL.CHARACTERISTICS
      : null;

  return {
    hasDescription,
    hasCharacteristics,
    otherBlockFieldKeys,
    showSwitcher,
    defaultPanel,
    hasContentPanels: hasDescription || hasCharacteristics,
  };
}
