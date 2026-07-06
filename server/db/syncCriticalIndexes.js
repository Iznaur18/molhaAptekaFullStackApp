import ProductCategoryDisplayModel from "../models/ProductCategoryDisplayModel.js";

/**
 * Пересоздаёт индексы моделей, у которых в схеме менялись ОПЦИИ индексов.
 * Mongoose создаёт недостающие индексы, но НЕ меняет опции уже существующих
 * (например, переход sparse → partialFilterExpression). `syncIndexes()` дропает
 * несовпадающие индексы в БД и создаёт их заново по текущей схеме.
 *
 * Пока синхронизируем только ProductCategoryDisplay: старый уникальный индекс
 * { categorySlug, sparse } конфликтовал на categorySlug: null у нескольких
 * категорий (E11000 «Переопределение отображения уже существует»). Новый индекс
 * использует partialFilterExpression и не индексирует null.
 *
 * Коллекция небольшая, поэтому синхронизация на старте безопасна и дёшева.
 */
export async function syncCriticalIndexes() {
  try {
    await ProductCategoryDisplayModel.syncIndexes();
    console.log("[indexes] ProductCategoryDisplay: индексы синхронизированы");
  } catch (err) {
    console.error(
      "[indexes] Не удалось синхронизировать индексы ProductCategoryDisplay:",
      err?.message ?? err,
    );
  }
}
