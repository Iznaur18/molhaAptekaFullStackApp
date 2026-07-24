import mongoose from "mongoose";

import { StaffAuditLogModel, UserModel } from "../../models/index.js";
import {
  STAFF_AUDIT_LIST_LIMIT_DEFAULT,
  STAFF_AUDIT_LIST_LIMIT_MAX,
} from "@molha/api-contract";

/** Экранирует спецсимволы regex, чтобы фильтр по действию был безопасен. */
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const clampLimit = (limit) => {
  const value = Number(limit);
  if (!Number.isInteger(value) || value < 1) {
    return STAFF_AUDIT_LIST_LIMIT_DEFAULT;
  }
  return Math.min(value, STAFF_AUDIT_LIST_LIMIT_MAX);
};

const buildFilter = ({ actorUserId, action, from, to }) => {
  const filter = {};
  if (actorUserId && mongoose.isValidObjectId(actorUserId)) {
    filter.actorUserId = actorUserId;
  }
  if (action) {
    filter.action = { $regex: escapeRegExp(action), $options: "i" };
  }
  if (from instanceof Date || to instanceof Date) {
    filter.createdAt = {};
    if (from instanceof Date) {
      filter.createdAt.$gte = from;
    }
    if (to instanceof Date) {
      filter.createdAt.$lte = to;
    }
  }
  return filter;
};

/** Краткая карточка сотрудника (ник + email) для отображения в журнале. */
const buildActorMap = async (actorIds) => {
  const uniqueIds = [...new Set(actorIds.map(String))];
  if (uniqueIds.length === 0) {
    return new Map();
  }
  const users = await UserModel.find({ _id: { $in: uniqueIds } })
    .select("userName email")
    .lean();
  return new Map(
    users.map((user) => [
      String(user._id),
      { userName: user.userName ?? "", email: user.email ?? "" },
    ]),
  );
};

const toEntryPayload = (row, actorMap) => ({
  _id: String(row._id),
  actorUserId: String(row.actorUserId),
  actor: actorMap.get(String(row.actorUserId)) ?? null,
  actorRole: row.actorRole ?? "",
  method: row.method,
  action: row.action,
  path: row.path,
  params: row.params ?? {},
  requestBody: row.requestBody ?? null,
  statusCode: row.statusCode,
  requestId: row.requestId ?? null,
  createdAt: row.createdAt ?? null,
});

/**
 * Список записей аудита staff-действий (новые сверху) с фильтрами и пагинацией.
 *
 * @param {{
 *   page?: number;
 *   limit?: number;
 *   actorUserId?: string;
 *   action?: string;
 *   from?: Date;
 *   to?: Date;
 * }} query
 * @returns {Promise<{ items: object[]; page: number; limit: number; total: number }>}
 */
export async function listStaffAuditEntries(query = {}) {
  const page = Number.isInteger(query.page) && query.page > 0 ? query.page : 1;
  const limit = clampLimit(query.limit);
  const filter = buildFilter(query);

  const [total, rows] = await Promise.all([
    StaffAuditLogModel.countDocuments(filter),
    StaffAuditLogModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  const actorMap = await buildActorMap(rows.map((row) => row.actorUserId));

  return {
    items: rows.map((row) => toEntryPayload(row, actorMap)),
    page,
    limit,
    total,
  };
}
