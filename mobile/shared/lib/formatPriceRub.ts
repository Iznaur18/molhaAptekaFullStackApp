export const formatPriceRub = (price?: number | null): string => {
  if (price == null || Number.isNaN(price)) {
    return "—";
  }
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
};
