import { PRODUCT_CATEGORY_VALUES } from "./productConstants.js";
import { normalizeProductSearchText } from "../utils/normalizeProductSearchText.js";

/** RU-подписи категорий (для поиска и productSearchBlob). Совпадает с клиентом. */
export const PRODUCT_CATEGORY_LABEL_RU = {
  grocery: "Продукты питания",
  electronics: "Электроника",
  clothing: "Одежда",
  footwear: "Обувь",
  home_garden: "Дом и сад",
  kids: "Детские товары",
  beauty_health: "Красота и здоровье",
  appliances: "Бытовая техника",
  sport_leisure: "Спорт и отдых",
  construction: "Строительство и ремонт",
  pharmacy: "Аптека",
  pets: "Товары для животных",
  books: "Книги",
  tourism_outdoors: "Туризм, рыбалка, охота",
  auto_parts: "Автотовары",
  furniture: "Мебель",
  hobby_crafts: "Хобби и творчество",
  accessories: "Аксессуары",
  jewelry: "Ювелирные украшения",
  music_video: "Музыка и видео",
  stationery: "Канцелярские товары",
  antiques: "Антиквариат и коллекционирование",
  digital: "Цифровые товары",
  household_care: "Бытовая химия и гигиена",
  games: "Игры и консоли",
  automobiles: "Автомобили",
  travel_services: "Билеты, отели, туры",
  food: "Продукты",
  figures: "Фигурки",
};

/** Нормализованный label/slug → slug категории. */
export const buildProductCategoryLabelLookup = () => {
  const lookup = new Map();
  for (const slug of PRODUCT_CATEGORY_VALUES) {
    lookup.set(normalizeProductSearchText(slug), slug);
    const label = PRODUCT_CATEGORY_LABEL_RU[slug];
    if (typeof label === "string" && label.trim() !== "") {
      lookup.set(normalizeProductSearchText(label), slug);
    }
  }
  return lookup;
};

export const PRODUCT_CATEGORY_LABEL_LOOKUP = buildProductCategoryLabelLookup();
