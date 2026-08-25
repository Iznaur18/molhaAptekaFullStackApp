import { z } from "zod";

/** Синхрон с docs/analytics/metrics.md и server/constants/analyticsConstants.js */
export const ADMIN_ANALYTICS_DEFINITIONS_VERSION = "1.0";

export const ADMIN_ANALYTICS_PERIOD_TODAY = "today";
export const ADMIN_ANALYTICS_PERIOD_7D = "7d";
export const ADMIN_ANALYTICS_PERIOD_30D = "30d";
export const ADMIN_ANALYTICS_PERIOD_ALL = "all";

export const ADMIN_ANALYTICS_PERIODS = [
  ADMIN_ANALYTICS_PERIOD_TODAY,
  ADMIN_ANALYTICS_PERIOD_7D,
  ADMIN_ANALYTICS_PERIOD_30D,
  ADMIN_ANALYTICS_PERIOD_ALL,
];

export const adminAnalyticsPeriodQuerySchema = z.object({
  period: z.enum(ADMIN_ANALYTICS_PERIODS).optional().default(ADMIN_ANALYTICS_PERIOD_7D),
});
