import mongoose from "mongoose";

/** Ключ единственной записи настроек. */
export const PRODUCT_CATEGORY_DISPLAY_SETTINGS_KEY = "default";

/**
 * Общие настройки плиток категорий (одна запись на весь сайт).
 *
 * Пока записи нет, действует дефолт из контракта — картинки показываются.
 */
const ProductCategoryDisplaySettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: PRODUCT_CATEGORY_DISPLAY_SETTINGS_KEY,
    },
    /** Показывать картинки на плитках категорий; сами картинки не удаляются. */
    tileImagesEnabled: {
      type: Boolean,
      required: true,
    },
    /** Кто последним переключал — чтобы было с кого спросить. */
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model(
  "ProductCategoryDisplaySettings",
  ProductCategoryDisplaySettingsSchema,
);
