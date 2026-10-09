import { PRODUCT_CATEGORY_ADMIN_ROOTS_DEFAULT_CHARACTERISTICS_SEED } from "../../constants/productCategoryAdminRootsDefaultCharacteristicsSeed.js";
import { applyProductCategoryDefaultCharacteristics } from "../../services/product/applyProductCategoryDefaultCharacteristics.js";

/**
 * Заполняет «Характеристики по умолчанию» у конечных подкатегорий корней вне
 * зашитого дерева: «Электроника», «Продукты питания», «Кафе и рестораны»,
 * «Игровые валюты» — их не покрыла `20261009-category-default-characteristics`.
 *
 * Подкатегории, где список уже есть (введён в админке или разложен прошлой
 * миграцией), не трогаются.
 *
 * Без `--apply` только считает, что будет сделано.
 */
export const up = async ({ isApply } = {}) =>
  applyProductCategoryDefaultCharacteristics({
    seed: PRODUCT_CATEGORY_ADMIN_ROOTS_DEFAULT_CHARACTERISTICS_SEED,
    dryRun: isApply !== true,
  });
