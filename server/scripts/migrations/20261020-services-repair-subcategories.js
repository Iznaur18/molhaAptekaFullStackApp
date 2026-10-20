import { PRODUCT_CATEGORY_CATALOG_SEED } from "../../constants/productCategoryCatalogSeed.js";
import { applyProductCategoryDefaultCharacteristics } from "../../services/product/applyProductCategoryDefaultCharacteristics.js";
import { addMissingProductCategorySeedNodes } from "../../services/product/applyProductCategoryCatalogSeed.js";

/**
 * Добавляет в «Услуги → Ремонт и помощь по дому → Ремонт и строительство»
 * восемь подкатегорий из сида (отделка, окна и потолки, отопление, дома и
 * бани, участок, мебель, демонтаж, дизайн) и заполняет им характеристики
 * по умолчанию.
 *
 * Полный `20261006-catalog-category-tree` не перезапускается: он удалил бы
 * узлы, заведённые в админке после 06.10. Здесь только вставка недостающих
 * слагов корня «uslugi»; существующие категории и товары не трогаются.
 *
 * Без `--apply` только считает, что будет сделано.
 */
export const up = async ({ isApply } = {}) => {
  const dryRun = isApply !== true;
  const categories = await addMissingProductCategorySeedNodes({
    seed: PRODUCT_CATEGORY_CATALOG_SEED.filter(({ rootSlug }) => rootSlug === "uslugi"),
    dryRun,
  });
  const characteristics = await applyProductCategoryDefaultCharacteristics({ dryRun });
  return { categories, characteristics };
};
