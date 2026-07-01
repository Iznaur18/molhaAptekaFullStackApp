const INTEGER_GROUP_FORMAT = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});

export const RUB_PRICE_INPUT_MAX_DIGITS = 9;

export const keepDigitsOnly = (raw: unknown): string => String(raw ?? "").replace(/\D/g, "");

export const formatIntegerGroupRu = (raw: unknown): string => {
  const digits = keepDigitsOnly(raw);
  if (!digits) {
    return "";
  }
  const value = Number(digits);
  if (!Number.isFinite(value)) {
    return "";
  }
  return INTEGER_GROUP_FORMAT.format(value);
};

export const formatRubPriceInput = (
  raw: unknown,
  maxDigits = RUB_PRICE_INPUT_MAX_DIGITS,
): string => {
  let digits = keepDigitsOnly(raw);
  if (maxDigits > 0 && digits.length > maxDigits) {
    digits = digits.slice(0, maxDigits);
  }
  return formatIntegerGroupRu(digits);
};

export const parseRubPriceInput = (raw: unknown): number | null => {
  const digits = keepDigitsOnly(raw);
  if (!digits) {
    return null;
  }
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
};
