export { PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH } from "./productSearchSynonymConstants.js";

/**
 * Статический словарь — только для миграции seed в БД.
 * @type {Record<string, { categories: string[] }>}
 */
export const PRODUCT_SEARCH_SYNONYM_TOKENS_SEED = {
  авто: { categories: ["automobiles", "auto_parts"] },
  автомобиль: { categories: ["automobiles"] },
  автомобили: { categories: ["automobiles"] },
  машина: { categories: ["automobiles"] },
  машины: { categories: ["automobiles"] },
  легковой: { categories: ["automobiles"] },
  транспорт: { categories: ["automobiles", "auto_parts", "travel_services"] },
  запчасти: { categories: ["auto_parts"] },
  автозапчасти: { categories: ["auto_parts"] },
  шины: { categories: ["auto_parts"] },
  аптека: { categories: ["pharmacy"] },
  лекарство: { categories: ["pharmacy", "beauty_health"] },
  лекарства: { categories: ["pharmacy", "beauty_health"] },
  лекарств: { categories: ["pharmacy", "beauty_health"] },
  витамин: { categories: ["pharmacy", "beauty_health"] },
  витамины: { categories: ["pharmacy", "beauty_health"] },
  таблетки: { categories: ["pharmacy"] },
  телефон: { categories: ["electronics"] },
  смартфон: { categories: ["electronics"] },
  ноутбук: { categories: ["electronics", "appliances"] },
  одежда: { categories: ["clothing"] },
  обувь: { categories: ["footwear"] },
  мебель: { categories: ["furniture"] },
  книга: { categories: ["books"] },
  книги: { categories: ["books"] },
  игрушки: { categories: ["kids", "games"] },
  детские: { categories: ["kids"] },
  животные: { categories: ["pets"] },
  корм: { categories: ["pets", "grocery"] },
  строй: { categories: ["construction"] },
  ремонт: { categories: ["construction", "home_garden"] },
};
