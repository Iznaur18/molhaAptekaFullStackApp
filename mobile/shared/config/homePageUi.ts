/** Главная / каталог — зеркало client HOME_PAGE_UI. */
export const HOME_PAGE_UI = {
  LOGO_ALT: "iziBuy",
  NAV_TO_HOME: "Главная",
  BREADCRUMB_HOME: "Главная",
  BREADCRUMB_CATALOG: "Каталог",
  CATALOG_CITY_FILTER_BANNER: (city: string) => `Показаны товары для ${city}`,
  CATALOG_CITY_FILTER_SHOW_ALL: "Все города",
} as const;
