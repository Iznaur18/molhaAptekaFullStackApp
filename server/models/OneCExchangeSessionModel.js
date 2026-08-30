import mongoose from "mongoose";

import {
  ONEC_EXCHANGE_LOGIN_MAX_LENGTH,
  ONEC_EXCHANGE_SESSION_TTL_SECONDS,
  ONEC_EXCHANGE_TYPES,
} from "../constants/onecExchangeConstants.js";

/**
 * Сессия CommerceML-обмена: живёт между `mode=checkauth` и последним `mode=import`.
 *
 * В Mongo, а не в Redis: `REDIS_URL` опционален (локальная разработка и часть
 * окружений работают без него), а обмен обязан работать всегда. TTL-индекс
 * подчищает брошенные сессии вместе с их временными файлами (см. cron-задачу).
 */
const OneCExchangeSessionSchema = new mongoose.Schema(
  {
    /** Значение cookie, которое 1С возвращает во всех последующих запросах. */
    sessionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 128,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    /** Логин, под которым 1С авторизовалась — для журнала. */
    login: {
      type: String,
      default: "",
      trim: true,
      maxlength: ONEC_EXCHANGE_LOGIN_MAX_LENGTH,
    },
    type: {
      type: String,
      required: true,
      enum: ONEC_EXCHANGE_TYPES,
    },
    /** Абсолютный путь временной папки сессии. */
    uploadDir: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    /** Принятые файлы: относительное имя из CommerceML → сколько байт склеено. */
    files: {
      type: [
        {
          _id: false,
          filename: { type: String, required: true, maxlength: 400 },
          bytes: { type: Number, default: 0, min: 0 },
          imported: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    totalBytes: {
      type: Number,
      default: 0,
      min: 0,
    },
    /**
     * Очереди выгрузки заказов, отданные в последнем `mode=query`.
     * Помечаются как переданные только после `mode=success` — оборванный обмен
     * не должен «терять» заказ.
     */
    queriedPushIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    remoteIp: {
      type: String,
      default: "",
      maxlength: 64,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

OneCExchangeSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "onec_exchange_session_ttl" },
);

export const buildOneCExchangeSessionExpiry = () =>
  new Date(Date.now() + ONEC_EXCHANGE_SESSION_TTL_SECONDS * 1000);

export default mongoose.model(
  "OneCExchangeSession",
  OneCExchangeSessionSchema,
);
