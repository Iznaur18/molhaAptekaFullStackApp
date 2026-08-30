import mongoose from "mongoose";

import {
  ONEC_IMPORT_KIND_CATALOG,
  ONEC_IMPORT_KIND_OFFERS,
  ONEC_IMPORT_KIND_UNKNOWN,
  ONEC_IMPORT_STATUS_PENDING,
  ONEC_IMPORT_STATUSES,
} from "../constants/onecExchangeConstants.js";
import { ONEC_LOG_ERROR_MAX_LENGTH } from "../constants/onecConstants.js";

/**
 * Один `mode=import` от 1С — разбор одного присланного файла (или архива).
 * Ставится в BullMQ, чтобы HTTP-ответ 1С уходил мгновенно: парсинг каталога
 * на десятки тысяч позиций занимает минуты, а 1С ждёт `success` сразу.
 */
const OneCImportJobSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    /** Имя файла, как его назвала 1С (`import.xml`, `offers.xml`, `import0_1.xml`…). */
    filename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400,
    },
    /** Абсолютный путь к склеенному файлу во временной папке сессии. */
    filePath: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    kind: {
      type: String,
      enum: [
        ONEC_IMPORT_KIND_CATALOG,
        ONEC_IMPORT_KIND_OFFERS,
        ONEC_IMPORT_KIND_UNKNOWN,
      ],
      default: ONEC_IMPORT_KIND_UNKNOWN,
    },
    status: {
      type: String,
      enum: ONEC_IMPORT_STATUSES,
      default: ONEC_IMPORT_STATUS_PENDING,
      index: true,
    },
    stats: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    /** Построчные проблемы импорта — их видит продавец в кабинете. */
    issues: {
      type: [
        {
          _id: false,
          externalId: { type: String, default: "", maxlength: 200 },
          name: { type: String, default: "", maxlength: 300 },
          message: { type: String, default: "", maxlength: 500 },
        },
      ],
      default: [],
    },
    errorMessage: {
      type: String,
      default: "",
      maxlength: ONEC_LOG_ERROR_MAX_LENGTH,
    },
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

OneCImportJobSchema.index(
  { sellerId: 1, createdAt: -1 },
  { name: "onec_import_job_seller_created" },
);

export default mongoose.model("OneCImportJob", OneCImportJobSchema);
