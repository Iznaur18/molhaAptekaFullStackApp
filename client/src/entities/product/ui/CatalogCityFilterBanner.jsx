import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./CatalogCityFilterBanner.css";

/**
 * @param {{
 *   cityLabel: string;
 *   onShowAllCities: () => void;
 * }} props
 */
export function CatalogCityFilterBanner({ cityLabel, onShowAllCities }) {
  return (
    <div className="catalog-city-filter-banner" role="status">
      <p className="catalog-city-filter-banner__text">
        {HOME_PAGE_UI.CATALOG_CITY_FILTER_BANNER(cityLabel)}
      </p>
      <button
        type="button"
        className="catalog-city-filter-banner__action"
        onClick={onShowAllCities}
      >
        {HOME_PAGE_UI.CATALOG_CITY_FILTER_SHOW_ALL}
      </button>
    </div>
  );
}
