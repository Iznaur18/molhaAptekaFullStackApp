import { applyProductCategoryDefaultCharacteristics } from "../../services/product/applyProductCategoryDefaultCharacteristics.js";

/**
 * Заполняет «Характеристики по умолчанию» у конечных подкатегорий списками из
 * `constants/productCategoryDefaultCharacteristicsSeed.js`.
 *
 * Подкатегории, где список уже введён в админке (например «Смартфоны и
 * телефоны»), не трогаются. Корни вне зашитого дерева («Электроника»,
 * «Продукты питания» и др.) в сид не входят и остаются как есть.
 *
 * Без `--apply` только считает, что будет сделано.
 */
export const up = async ({ isApply } = {}) =>
  applyProductCategoryDefaultCharacteristics({ dryRun: isApply !== true });
