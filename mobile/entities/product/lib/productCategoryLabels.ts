export const PRODUCT_CATEGORY_GROCERY = "grocery";
export const PRODUCT_CATEGORY_ELECTRONICS = "electronics";
export const PRODUCT_CATEGORY_CLOTHING = "clothing";
export const PRODUCT_CATEGORY_FOOTWEAR = "footwear";
export const PRODUCT_CATEGORY_HOME_GARDEN = "home_garden";
export const PRODUCT_CATEGORY_KIDS = "kids";
export const PRODUCT_CATEGORY_BEAUTY_HEALTH = "beauty_health";
export const PRODUCT_CATEGORY_APPLIANCES = "appliances";
export const PRODUCT_CATEGORY_SPORT_LEISURE = "sport_leisure";
export const PRODUCT_CATEGORY_CONSTRUCTION = "construction";
export const PRODUCT_CATEGORY_PHARMACY = "pharmacy";
export const PRODUCT_CATEGORY_PETS = "pets";
export const PRODUCT_CATEGORY_BOOKS = "books";
export const PRODUCT_CATEGORY_TOURISM_OUTDOORS = "tourism_outdoors";
export const PRODUCT_CATEGORY_AUTO_PARTS = "auto_parts";
export const PRODUCT_CATEGORY_HOBBY_CRAFTS = "hobby_crafts";
export const PRODUCT_CATEGORY_ACCESSORIES = "accessories";
export const PRODUCT_CATEGORY_JEWELRY = "jewelry";
export const PRODUCT_CATEGORY_MUSIC_VIDEO = "music_video";
export const PRODUCT_CATEGORY_STATIONERY = "stationery";
export const PRODUCT_CATEGORY_ANTIQUES = "antiques";
export const PRODUCT_CATEGORY_DIGITAL = "digital";
export const PRODUCT_CATEGORY_HOUSEHOLD_CARE = "household_care";
export const PRODUCT_CATEGORY_GAMES = "games";
export const PRODUCT_CATEGORY_AUTOMOBILES = "automobiles";
export const PRODUCT_CATEGORY_TRAVEL_SERVICES = "travel_services";
export const PRODUCT_CATEGORY_FOOD = "food";

/** Порядок — для сетки `/catalog` (синхрон с web `PRODUCT_CATEGORIES`). */
export const PRODUCT_CATEGORIES = [
  PRODUCT_CATEGORY_GROCERY,
  PRODUCT_CATEGORY_ELECTRONICS,
  PRODUCT_CATEGORY_CLOTHING,
  PRODUCT_CATEGORY_FOOTWEAR,
  PRODUCT_CATEGORY_HOME_GARDEN,
  PRODUCT_CATEGORY_KIDS,
  PRODUCT_CATEGORY_BEAUTY_HEALTH,
  PRODUCT_CATEGORY_APPLIANCES,
  PRODUCT_CATEGORY_SPORT_LEISURE,
  PRODUCT_CATEGORY_CONSTRUCTION,
  PRODUCT_CATEGORY_PHARMACY,
  PRODUCT_CATEGORY_PETS,
  PRODUCT_CATEGORY_BOOKS,
  PRODUCT_CATEGORY_TOURISM_OUTDOORS,
  PRODUCT_CATEGORY_AUTO_PARTS,
  PRODUCT_CATEGORY_HOBBY_CRAFTS,
  PRODUCT_CATEGORY_ACCESSORIES,
  PRODUCT_CATEGORY_JEWELRY,
  PRODUCT_CATEGORY_MUSIC_VIDEO,
  PRODUCT_CATEGORY_STATIONERY,
  PRODUCT_CATEGORY_ANTIQUES,
  PRODUCT_CATEGORY_DIGITAL,
  PRODUCT_CATEGORY_HOUSEHOLD_CARE,
  PRODUCT_CATEGORY_GAMES,
  PRODUCT_CATEGORY_AUTOMOBILES,
  PRODUCT_CATEGORY_TRAVEL_SERVICES,
  PRODUCT_CATEGORY_FOOD,
] as const;

export const PRODUCT_CATEGORY_LABEL_RU: Record<string, string> = {
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
};
