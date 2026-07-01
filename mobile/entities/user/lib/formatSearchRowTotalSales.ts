import { formatPriceRub } from "@/shared/lib";

const COMPACT_AMOUNT_THRESHOLD = 10_000;
const COMPACT_THOUSAND_DIVISOR = 1_000;
const COMPACT_MILLION_DIVISOR = 1_000_000;

const normalizeTotalSalesAmount = (totalSalesAmount: unknown): number => {
  const value = Number(totalSalesAmount);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
};

const formatCompactAmountPart = (amount: number, divisor: number, suffix: string): string => {
  const scaled = amount / divisor;
  const rounded = Math.round(scaled * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(/\.0$/, "");
  return `${text}${suffix}`;
};

const formatCompactSearchRowAmount = (amount: number): string => {
  if (amount >= COMPACT_MILLION_DIVISOR) {
    return formatCompactAmountPart(amount, COMPACT_MILLION_DIVISOR, "М");
  }
  return formatCompactAmountPart(amount, COMPACT_THOUSAND_DIVISOR, "К");
};

export const formatSearchRowTotalSales = (totalSalesAmount: unknown): string => {
  const amount = normalizeTotalSalesAmount(totalSalesAmount);
  if (amount < COMPACT_AMOUNT_THRESHOLD) {
    return formatPriceRub(amount);
  }
  return formatCompactSearchRowAmount(amount);
};

export const normalizeTotalSalesCount = (totalSalesCount: unknown): number => {
  const value = Number(totalSalesCount);
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
};

export const formatSearchRowTotalSalesCount = (totalSalesCount: unknown): string => {
  return String(normalizeTotalSalesCount(totalSalesCount));
};
