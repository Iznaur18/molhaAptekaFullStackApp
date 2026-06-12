export const getOrderItemIndex = (
  item: { itemIndex?: number },
  fallbackIndex: number,
): number =>
  typeof item.itemIndex === "number" ? item.itemIndex : fallbackIndex;
