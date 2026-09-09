import { cleanupOneCProductsWithoutImagesAndStock } from "../../services/onec/cleanupOneCProductsWithoutImagesAndStock.js";

/**
 * Правило приёмки 1С «нет картинок И нет остатка» задним числом (все продавцы).
 *
 * @param {{ isApply?: boolean }} [context]
 */
export const up = async ({ isApply = false } = {}) =>
  cleanupOneCProductsWithoutImagesAndStock({ isApply, sellerId: null });
