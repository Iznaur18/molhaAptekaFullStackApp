import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { useEnterExitMountAnimation } from "../../../shared/lib/useEnterExitMountAnimation.js";
import { useRegisterBlockingOverlay } from "../../../shared/lib/useBlockingOverlayOccupancy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";

import "./CatalogFiltersSheet.css";

const CATALOG_FILTERS_SHEET_EXIT_MS = 260;

/**
 * Пустой bottom sheet фильтров (stub) — анимация/радиус/отступы как у региона.
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   id?: string;
 * }} props
 */
export function CatalogFiltersSheet({ isOpen, onClose, id }) {
  const generatedId = useId();
  const sheetId = id || generatedId;
  const titleId = `${sheetId}-title`;
  const { mounted, isVisible: visible } = useEnterExitMountAnimation(isOpen, {
    exitMs: CATALOG_FILTERS_SHEET_EXIT_MS,
  });

  useScrollLock(mounted);
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
        aria-labelledby={titleId}
      >
        <header className="catalog-filters-sheet__header">
          <h2 id={titleId} className="catalog-filters-sheet__title">
            {HOME_PAGE_UI.CATALOG_FILTERS_SECTION_LABEL}
          </h2>
          <button
            type="button"
            className="catalog-filters-sheet__close"
            onClick={onClose}
          >
            {HOME_PAGE_UI.CATALOG_FILTERS_SHEET_CLOSE}
          </button>
        </header>
        <div className="catalog-filters-sheet__body" />
        <footer className="catalog-filters-sheet__footer">
          <button
            type="button"
            className="app-btn app-btn--primary catalog-filters-sheet__apply"
            onClick={onClose}
          >
            {HOME_PAGE_UI.CATALOG_FILTERS_SHEET_APPLY}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
