import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

import {
  areCatalogSearchParamsEqual,
  buildCatalogBrowserSearchParams,
  buildCatalogSearchParams,
  parseCatalogQueryFromSearchParams,
} from "../../../entities/product/lib/catalogCatalogQuery.js";
import { useCatalogProductFacetsQuery } from "../../../entities/product/model/useCatalogProductFacetsQuery.js";
import { IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED } from "../../../entities/product-category-tree/lib/isCatalogBrowserSubcategoryFilterEnabled.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  catalogMainViewToPathname,
  pathnameToCatalogMainView,
} from "../../../shared/lib/catalogMainViewPaths.js";
import {
  formatIntegerGroupRu,
  formatRubPriceInput,
  INTEGER_INPUT_FIELD_PROPS,
  parseRubPriceInput,
} from "../../../shared/lib/numericInput.js";
import { pluralizeRu } from "../../../shared/lib/pluralizeRu.js";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue.js";
import { useEnterExitMountAnimation } from "../../../shared/lib/useEnterExitMountAnimation.js";
import { useRegisterBlockingOverlay } from "../../../shared/lib/useBlockingOverlayOccupancy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import {
  applyCatalogFiltersDraft,
  buildCatalogFiltersFacetsParams,
  buildCatalogPricePresets,
  CATALOG_FILTERS_RATING_MIN,
  CATALOG_FILTERS_SHEET_SORTS,
  createCatalogFiltersDraft,
  createEmptyCatalogFiltersDraft,
  isCatalogFiltersDraftEmpty,
  toggleCatalogFiltersDelivery,
} from "../lib/catalogFiltersDraft.js";

import "./CatalogFiltersSheet.css";

const CATALOG_FILTERS_SHEET_EXIT_MS = 260;
/** Пауза после последнего нажатия, прежде чем пересчитать товары. */
const CATALOG_FILTERS_COUNT_DEBOUNCE_MS = 300;

const OPTION_UI = HOME_PAGE_UI.CATALOG_FILTERS_SHEET_OPTION;

const DELIVERY_OPTIONS = [
  { value: "seller", label: OPTION_UI.deliverySeller },
  { value: "courier", label: OPTION_UI.deliveryCourier },
  { value: "carrier", label: OPTION_UI.deliveryCarrier },
];
const BENEFIT_FLAGS = [
  "saleOnly",
  "flashSaleOnly",
  "installmentOnly",
  "wholesaleOnly",
  "buyNFreeOnly",
];
const SELLER_FLAGS = ["sellerConfirmed", "sellerPremium"];
const MORE_FLAGS = [
  "originalOnly",
  "returnOnly",
  "auctionOnly",
  "rentalOnly",
  "affiliateOnly",
];

/**
 * Окно фильтров каталога: черновик внутри окна, применённые фильтры — в адресе.
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   id?: string;
 *   searchTerm?: string;
 *   viewerRegionCode?: string;
 * }} props
 */
export function CatalogFiltersSheet({
  isOpen,
  onClose,
  id,
  searchTerm = "",
  viewerRegionCode = "",
}) {
  const generatedId = useId();
  const sheetId = id || generatedId;
  const { mounted, isVisible: visible } = useEnterExitMountAnimation(isOpen, {
    exitMs: CATALOG_FILTERS_SHEET_EXIT_MS,
  });

  // Поля цены открывают клавиатуру — без position: fixed на body.
  useScrollLock(mounted, { strategy: "overflow" });
  useRegisterBlockingOverlay(mounted);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, onClose]);

  if (!mounted) {
    return null;
  }

  const backdropClass = [
    "catalog-filters-sheet__backdrop",
    visible ? "catalog-filters-sheet__backdrop--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div className={backdropClass} role="presentation">
      <div className="catalog-filters-sheet__scrim" aria-hidden="true" />
      <button
        type="button"
        className="catalog-filters-sheet__dismiss"
        aria-label={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_CLOSE}
        onClick={onClose}
      />
      <div
        id={sheetId}
        className="catalog-filters-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${sheetId}-title`}
      >
        {/* Черновик живёт, пока окно смонтировано: закрыли без «Показать» — пропал. */}
        <CatalogFiltersSheetContent
          sheetId={sheetId}
          searchTerm={searchTerm}
          viewerRegionCode={viewerRegionCode}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body,
  );
}

/**
 * @param {{
 *   sheetId: string;
 *   searchTerm: string;
 *   viewerRegionCode: string;
 *   onClose: () => void;
 * }} props
 */
function CatalogFiltersSheetContent({
  sheetId,
  searchTerm,
  viewerRegionCode,
  onClose,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const catalogMainView = pathnameToCatalogMainView(location.pathname) ?? "catalog";
  const appliedQuery = useMemo(
    () => parseCatalogQueryFromSearchParams(new URLSearchParams(location.search)),
    [location.search],
  );
  const [draft, setDraft] = useState(() => createCatalogFiltersDraft(appliedQuery));
  const countedDraft = useDebouncedValue(draft, CATALOG_FILTERS_COUNT_DEBOUNCE_MS);

  const facetsParams = useMemo(
    () =>
      buildCatalogFiltersFacetsParams({
        query: appliedQuery,
        draft: countedDraft,
        searchTerm,
        viewerRegionCode,
        isCatalogBrowserMainViewActive: catalogMainView === "catalog-browser",
        isSubcategoryFilterEnabled: IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED,
      }),
    [appliedQuery, catalogMainView, countedDraft, searchTerm, viewerRegionCode],
  );
  const facetsQuery = useCatalogProductFacetsQuery({
    params: facetsParams,
    enabled: true,
  });
  const facets = facetsQuery.data ?? null;
  const options = facets?.options ?? null;
  const isCounting = draft !== countedDraft || facetsQuery.isFetching;
  const pricePresets = useMemo(
    () => buildCatalogPricePresets(facets?.price ?? null),
    [facets?.price],
  );

  const toggleFlag = useCallback((key) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSortSelect = (sort) => {
    setDraft((prev) => (prev.sort === sort ? prev : { ...prev, sort }));
  };

  const handlePriceChange = (key, raw) => {
    setDraft((prev) => ({
      ...prev,
      [key]: parseRubPriceInput(formatRubPriceInput(raw)),
    }));
  };

  const handlePricePresetToggle = (value) => {
    setDraft((prev) =>
      prev.priceMin == null && prev.priceMax === value
        ? { ...prev, priceMax: null }
        : { ...prev, priceMin: null, priceMax: value },
    );
  };

  const handleDeliveryToggle = (value) => {
    setDraft((prev) => ({
      ...prev,
      delivery: toggleCatalogFiltersDelivery(prev.delivery, value),
    }));
  };

  const handleRatingToggle = () => {
    setDraft((prev) => ({
      ...prev,
      ratingMin: prev.ratingMin == null ? CATALOG_FILTERS_RATING_MIN : null,
    }));
  };

  const handleReset = () => {
    setDraft(createEmptyCatalogFiltersDraft());
  };

  const handleApply = () => {
    const nextQuery = applyCatalogFiltersDraft(appliedQuery, draft);
    const nextParams =
      catalogMainView === "catalog-browser"
        ? buildCatalogBrowserSearchParams(nextQuery)
        : buildCatalogSearchParams(nextQuery);
    if (
      !areCatalogSearchParamsEqual(nextParams, new URLSearchParams(location.search))
    ) {
      const search = nextParams.toString();
      navigate(
        {
          pathname: catalogMainViewToPathname(catalogMainView),
          search: search ? `?${search}` : "",
        },
        { replace: true },
      );
      // Новая выдача начинается сверху — иначе покупатель остаётся посреди скелетонов.
      window.scrollTo(0, 0);
    }
    onClose();
  };

  /**
   * @param {string} key
   */
  const renderFlag = (key) => (
    <CatalogFilterChip
      key={key}
      label={OPTION_UI[key]}
      count={options?.[key]}
      selected={draft[key] === true}
      onClick={() => toggleFlag(key)}
    />
  );

  const total = facets?.total ?? null;
  const isNothingFound = total === 0 && !isCounting;
  const applyLabel =
    total == null
      ? HOME_PAGE_UI.CATALOG_FILTERS_SHEET_SHOW_PENDING
      : isNothingFound
        ? HOME_PAGE_UI.CATALOG_FILTERS_SHEET_NOTHING_FOUND
        : `${HOME_PAGE_UI.CATALOG_FILTERS_SHEET_SHOW} ${formatIntegerGroupRu(total)} ${pluralizeRu(
            total,
            HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRODUCT_FORMS,
          )}`;
  const applyClassName = [
    "app-btn app-btn--primary catalog-filters-sheet__apply",
    isCounting && total != null ? "catalog-filters-sheet__apply--counting" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className="catalog-filters-sheet__header">
        <h2 id={`${sheetId}-title`} className="catalog-filters-sheet__title">
          {HOME_PAGE_UI.CATALOG_FILTERS_SECTION_LABEL}
        </h2>
        <div className="catalog-filters-sheet__header-actions">
          {isCatalogFiltersDraftEmpty(draft) ? null : (
            <button
              type="button"
              className="catalog-filters-sheet__reset"
              onClick={handleReset}
            >
              {HOME_PAGE_UI.CATALOG_FILTERS_SHEET_RESET}
            </button>
          )}
          <button
            type="button"
            className="catalog-filters-sheet__close"
            onClick={onClose}
          >
            {HOME_PAGE_UI.CATALOG_FILTERS_SHEET_CLOSE}
          </button>
        </div>
      </header>
      <div className="catalog-filters-sheet__body">
        <CatalogFiltersSection title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_SORT}>
          {CATALOG_FILTERS_SHEET_SORTS.map((sort) => (
            <CatalogFilterChip
              key={sort}
              label={OPTION_UI[sort]}
              selected={draft.sort === sort}
              onClick={() => handleSortSelect(sort)}
            />
          ))}
        </CatalogFiltersSection>

        <CatalogFiltersSection
          title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRICE}
          before={
            <div className="catalog-filters-sheet__price-row">
              <label className="catalog-filters-sheet__price-field">
                <span className="catalog-filters-sheet__price-prefix">
                  {HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRICE_FROM}
                </span>
                <input
                  {...INTEGER_INPUT_FIELD_PROPS}
                  id={`${sheetId}-price-min`}
                  className="catalog-filters-sheet__price-input"
                  aria-label={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRICE_FROM_ARIA}
                  placeholder={
                    facets?.price
                      ? formatIntegerGroupRu(Math.floor(facets.price.min))
                      : ""
                  }
                  value={
                    draft.priceMin == null ? "" : formatIntegerGroupRu(draft.priceMin)
                  }
                  onChange={(event) =>
                    handlePriceChange("priceMin", event.target.value)
                  }
                />
              </label>
              <label className="catalog-filters-sheet__price-field">
                <span className="catalog-filters-sheet__price-prefix">
                  {HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRICE_TO}
                </span>
                <input
                  {...INTEGER_INPUT_FIELD_PROPS}
                  id={`${sheetId}-price-max`}
                  className="catalog-filters-sheet__price-input"
                  aria-label={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRICE_TO_ARIA}
                  placeholder={
                    facets?.price
                      ? formatIntegerGroupRu(Math.ceil(facets.price.max))
                      : ""
                  }
                  value={
                    draft.priceMax == null ? "" : formatIntegerGroupRu(draft.priceMax)
                  }
                  onChange={(event) =>
                    handlePriceChange("priceMax", event.target.value)
                  }
                />
              </label>
            </div>
          }
        >
          {pricePresets.map((value) => (
            <CatalogFilterChip
              key={value}
              label={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRICE_UP_TO(
                formatIntegerGroupRu(value),
              )}
              selected={draft.priceMin == null && draft.priceMax === value}
              onClick={() => handlePricePresetToggle(value)}
            />
          ))}
        </CatalogFiltersSection>

        <CatalogFiltersSection title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_DELIVERY}>
          {DELIVERY_OPTIONS.map(({ value, label }) => (
            <CatalogFilterChip
              key={value}
              label={label}
              count={options?.delivery[value]}
              selected={draft.delivery.includes(value)}
              onClick={() => handleDeliveryToggle(value)}
            />
          ))}
          {renderFlag("pickupOnly")}
          {/* null в фасетах — гость или нет адреса: «Рядом» недоступно. */}
          {options?.near != null || draft.near ? renderFlag("near") : null}
        </CatalogFiltersSection>

        <CatalogFiltersSection title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_RATING}>
          <CatalogFilterChip
            label={OPTION_UI.ratingMin4}
            count={options?.ratingMin4}
            selected={draft.ratingMin != null}
            onClick={handleRatingToggle}
          />
          {renderFlag("withReviews")}
        </CatalogFiltersSection>

        <CatalogFiltersSection title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_BENEFIT}>
          {BENEFIT_FLAGS.map(renderFlag)}
        </CatalogFiltersSection>

        <CatalogFiltersSection title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_SELLER}>
          {SELLER_FLAGS.map(renderFlag)}
          {options?.followingOnly != null || draft.followingOnly
            ? renderFlag("followingOnly")
            : null}
        </CatalogFiltersSection>

        <CatalogFiltersSection title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_MORE}>
          {MORE_FLAGS.map(renderFlag)}
        </CatalogFiltersSection>
      </div>
      <footer className="catalog-filters-sheet__footer">
        <button
          type="button"
          className={applyClassName}
          disabled={isNothingFound}
          aria-busy={isCounting}
          onClick={handleApply}
        >
          {applyLabel}
        </button>
      </footer>
    </>
  );
}

/**
 * @param {{
 *   title: string;
 *   before?: import('react').ReactNode;
 *   children: import('react').ReactNode;
 * }} props
 */
function CatalogFiltersSection({ title, before = null, children }) {
  const titleId = useId();
  return (
    <section className="catalog-filters-sheet__section" aria-labelledby={titleId}>
      <h3 id={titleId} className="catalog-filters-sheet__section-title">
        {title}
      </h3>
      {before}
      <div className="catalog-filters-sheet__chips">{children}</div>
    </section>
  );
}

/**
 * Вариант фильтра. Рядом — сколько товаров останется, если его включить;
 * с нулём вариант неактивен (выбранный можно снять всегда).
 *
 * @param {{
 *   label: string;
 *   count?: number | null;
 *   selected: boolean;
 *   onClick: () => void;
 * }} props
 */
function CatalogFilterChip({ label, count, selected, onClick }) {
  const hasCount = typeof count === "number";
  const className = [
    "catalog-filters-sheet__chip",
    selected ? "catalog-filters-sheet__chip--selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      aria-pressed={selected}
      disabled={hasCount && count === 0 && !selected}
      onClick={onClick}
    >
      <span>{label}</span>
      {hasCount && !selected ? (
        <span className="catalog-filters-sheet__chip-count">
          {formatIntegerGroupRu(count)}
        </span>
      ) : null}
    </button>
  );
}
