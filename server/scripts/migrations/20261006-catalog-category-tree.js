import { applyProductCategoryCatalogSeed } from "../../services/product/applyProductCategoryCatalogSeed.js";

/**
 * Заменяет подкатегории 19 корней каталога деревом из
 * `constants/productCategoryCatalogSeed.js`.
 *
 * «Электроника», «Продукты питания», «Кафе и рестораны» и «Игровые валюты»
 * в сид не входят и остаются как есть. Товары удаляемых подкатегорий
 * (на 06.10.2026 — 16 в «Автотовары») остаются в своём корне без подкатегории.
 *
 * Без `--apply` только считает, что будет сделано.
 */
export const up = async ({ isApply } = {}) =>
  applyProductCategoryCatalogSeed({ dryRun: isApply !== true });
