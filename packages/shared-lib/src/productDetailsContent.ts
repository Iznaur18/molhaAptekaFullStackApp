export type ProductCharacteristicLike = {
  key?: string | null;
  name?: string | null;
  value?: string | null;
};

export type ProductDetailsContentLike = {
  productDescription?: string | null;
  productCharacteristics?: ProductCharacteristicLike[] | null;
};

export function getProductNonEmptyCharacteristics(
  items: ProductCharacteristicLike[] | null | undefined,
): Array<{ key: string; value: string }> {
  if (!Array.isArray(items)) {
    return [];
  }

  const rows: Array<{ key: string; value: string }> = [];

  for (const item of items) {
    const key = (item.key ?? item.name ?? "").trim();
    const value = (item.value ?? "").trim();
    if (key && value) {
      rows.push({ key, value });
    }
  }

  return rows;
}

export function hasProductDescriptionContent(
  product: ProductDetailsContentLike | null | undefined,
): boolean {
  const text = product?.productDescription;
  return typeof text === "string" && text.trim().length > 0;
}

export function hasProductCharacteristicsContent(
  product: ProductDetailsContentLike | null | undefined,
): boolean {
  return getProductNonEmptyCharacteristics(product?.productCharacteristics).length > 0;
}
