import { hasProductDescriptionContent } from "@izibuy/shared-lib";

const DETAILS_HIDE_WHEN_EMPTY_KEYS = new Set(["productDescription"]);

export const isProductDetailsFieldVisible = (
  key: string,
  product: Record<string, unknown>,
): boolean => {
  if (!DETAILS_HIDE_WHEN_EMPTY_KEYS.has(key)) {
    return true;
  }

  if (key === "productDescription") {
    return hasProductDescriptionContent({
      productDescription:
        typeof product.productDescription === "string" ? product.productDescription : "",
    });
  }

  return true;
};

export const filterProductDetailsVisibleFieldKeys = (
  keys: readonly string[],
  product: Record<string, unknown>,
): string[] => keys.filter((key) => isProductDetailsFieldVisible(key, product));
