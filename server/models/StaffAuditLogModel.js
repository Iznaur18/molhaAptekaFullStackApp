import mongoose from "mongoose";

import { STAFF_AUDIT_PATH_MAX_CHARS } from "../constants/staffAuditConstants.js";

/**
 * Журнал аудита действий сотрудников (модератор/админ).
 * Append-only: записи не редактируются (нет `updatedAt`), только добавляются.
 * Пишется автоматически из `auditStaffActionMW` для каждой staff-мутации.
 */
const StaffAuditLogSchema = new mongoose.Schema(
  {
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      required: true,
    },
    /** Шаблон маршрута — «PATCH /product/:productId/moderation/approve». */
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    /** Фактический URL с реальными id. */
    path: {
      type: String,
      required: true,
      trim: true,
      maxlength: STAFF_AUDIT_PATH_MAX_CHARS,
    },
    /** Параметры маршрута (id-шники), с маскированием чувствительных ключей. */
    params: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    /** Снапшот тела запроса (замаскирован и ограничен по размеру) либо null. */
    requestBody: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    requestId: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

StaffAuditLogSchema.index({ createdAt: -1 });
StaffAuditLogSchema.index({ actorUserId: 1, createdAt: -1 });
StaffAuditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("StaffAuditLog", StaffAuditLogSchema);
