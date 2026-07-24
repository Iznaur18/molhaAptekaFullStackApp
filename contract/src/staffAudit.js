import { z } from "zod";

import { optionalPageQuery, optionalTrimmedString } from "./queryHelpers.js";

/** Синхрон с UI журнала аудита staff-действий. */
export const STAFF_AUDIT_LIST_LIMIT_DEFAULT = 20;
export const STAFF_AUDIT_LIST_LIMIT_MAX = 100;

/** Query GET /audit/staff-log (admin): пагинация + фильтры. */
export const staffAuditListQuerySchema = z.object({
  page: optionalPageQuery,
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(STAFF_AUDIT_LIST_LIMIT_MAX, `limit от 1 до ${STAFF_AUDIT_LIST_LIMIT_MAX}`)
    .optional()
    .default(STAFF_AUDIT_LIST_LIMIT_DEFAULT),
  /** Фильтр по сотруднику (ObjectId). */
  actorUserId: optionalTrimmedString,
  /** Фильтр по действию (подстрока шаблона маршрута, регистронезависимо). */
  action: optionalTrimmedString,
  /** Диапазон дат по createdAt. */
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
