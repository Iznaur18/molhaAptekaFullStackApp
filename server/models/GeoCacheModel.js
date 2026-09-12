import mongoose from "mongoose";

/**
 * Кэш геокодинга и маршрутов по дорогам.
 *
 * Нужен не только ради вежливости к открытым сервисам OSM. Покупатель видит
 * стоимость доставки в корзине, а платит по заказу, который создаётся позже:
 * если между этими моментами маршрутизатор ответит иначе (или ляжет), суммы
 * разойдутся. Общий кэш даёт обоим расчётам одно и то же число.
 */
const geoCacheSchema = new mongoose.Schema(
  {
    /** `geocode` — адрес → точка; `route` — пара точек → километры. */
    kind: {
      type: String,
      required: true,
      enum: ["geocode", "route"],
    },
    key: {
      type: String,
      required: true,
      maxlength: 600,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

geoCacheSchema.index({ kind: 1, key: 1 }, { unique: true });
// Mongo сам удаляет просроченное; чтение всё равно сверяет `expiresAt`,
// потому что фоновая чистка идёт раз в минуту.
geoCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const GeoCacheModel = mongoose.model("GeoCache", geoCacheSchema);
