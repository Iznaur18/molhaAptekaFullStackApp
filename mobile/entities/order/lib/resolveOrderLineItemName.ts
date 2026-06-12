export const resolveOrderLineItemName = (item: unknown): string => {
  if (!item || typeof item !== "object") {
    return "Товар";
  }

  const source = item as {
    productNameAtOrder?: string;
    productId?: { productName?: string } | string;
  };

  const atOrder = source.productNameAtOrder?.trim();
  if (atOrder) {
    return atOrder;
  }

  const product = source.productId;
  if (product && typeof product === "object" && "productName" in product) {
    const name = (product as { productName?: string }).productName?.trim();
    if (name) {
      return name;
    }
  }

  return "Товар";
};
