import { ORDER_CARD_UI } from "@/shared/config";

export const resolveOrderLineItemName = (item: unknown): string => {
  if (!item || typeof item !== "object") {
    return ORDER_CARD_UI.DELETED_PRODUCT_NAME;
  }

  const source = item as {
    productNameAtOrder?: string;
    productId?: { productName?: string } | string;
  };

  const populated = source.productId;
  if (populated != null && typeof populated === "object") {
    const name = populated.productName?.trim();
    if (name) {
      return name;
    }
  }

  const atOrder = source.productNameAtOrder?.trim();
  if (atOrder) {
    return atOrder;
  }

  return ORDER_CARD_UI.DELETED_PRODUCT_NAME;
};
