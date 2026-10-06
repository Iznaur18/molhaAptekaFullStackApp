import { CATEGORY_TILE_IMAGES_ENABLED_DEFAULT } from "@molha/api-contract";

import ProductCategoryDisplaySettingsModel, {
  PRODUCT_CATEGORY_DISPLAY_SETTINGS_KEY,
} from "../../models/ProductCategoryDisplaySettingsModel.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/**
 * Значение переключателя из записи настроек; записи нет — дефолт.
 *
 * @param {{ tileImagesEnabled?: unknown } | null | undefined} row
 * @returns {boolean}
 */
export function resolveTileImagesEnabled(row) {
  return typeof row?.tileImagesEnabled === "boolean"
    ? row.tileImagesEnabled
    : CATEGORY_TILE_IMAGES_ENABLED_DEFAULT;
}

/** Показывать ли картинки на плитках категорий. */
export async function getCategoryTileImagesEnabled() {
  const row = await ProductCategoryDisplaySettingsModel.findOne({
    key: PRODUCT_CATEGORY_DISPLAY_SETTINGS_KEY,
  })
    .select("tileImagesEnabled")
    .lean();
  return resolveTileImagesEnabled(row);
}

/**
 * Включить или выключить картинки на всех плитках категорий.
 *
 * @param {{ tileImagesEnabled: boolean; adminId: string }} input
 * @returns {Promise<boolean>} сохранённое значение
 */
export async function setCategoryTileImagesEnabled({ tileImagesEnabled, adminId }) {
  const enabled = tileImagesEnabled === true;
  await ProductCategoryDisplaySettingsModel.updateOne(
    { key: PRODUCT_CATEGORY_DISPLAY_SETTINGS_KEY },
    { $set: { tileImagesEnabled: enabled, updatedBy: adminId } },
    { upsert: true },
  );

  logServerEvent("info", {
    event: "category_tile_images_toggled",
    tileImagesEnabled: enabled,
    adminId: String(adminId),
  });

  return enabled;
}
