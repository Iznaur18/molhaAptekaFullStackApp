import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { REGION_UI } from "../../../shared/config/appUiCopy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { filterRuRegionsByQuery } from "../lib/filterRuRegionsByQuery.js";

import "./ViewerRegionPickerSheet.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   value: string;
 *   onClose: () => void;
 *   onSelect: (code: string) => void;
 *   id?: string;
 * }} props
 */
export function ViewerRegionPickerSheet({
  isOpen,
  value,
  onClose,
  onSelect,
  id,
}) {
  const generatedId = useId();
  const sheetId = id || generatedId;
  const titleId = `${sheetId}-title`;
  const searchRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");

  useScrollLock(mounted);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setQuery("");
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    if (!mounted) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => setMounted(false), 260);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, mounted]);

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
    const focusTimer = window.setTimeout(() => {
      searchRef.current?.focus({ preventScroll: true });
    }, 40);
    return () => {
      document.removeEventListener("keydown", handleKey);
      window.clearTimeout(focusTimer);
    };
  }, [visible, onClose]);

  const selected = String(value ?? "").trim();
  const filtered = useMemo(
    () => filterRuRegionsByQuery(query, undefined, selected),
    [query, selected],
  );

  if (!mounted) {
    return null;
  }

  const backdropClass = [
    "viewer-region-picker-sheet__backdrop",
    visible ? "viewer-region-picker-sheet__backdrop--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div className={backdropClass} role="presentation">
      <div className="viewer-region-picker-sheet__scrim" aria-hidden="true" />
      <button
        type="button"
        className="viewer-region-picker-sheet__dismiss"
        aria-label={REGION_UI.SHEET_CLOSE}
        onClick={onClose}
      />
      <div
        id={sheetId}
        className="viewer-region-picker-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="viewer-region-picker-sheet__header">
          <h2 id={titleId} className="viewer-region-picker-sheet__title">
            {REGION_UI.SHEET_TITLE}
          </h2>
          <button
            type="button"
            className="viewer-region-picker-sheet__close"
            onClick={onClose}
          >
            {REGION_UI.SHEET_CLOSE}
          </button>
        </header>
        <div className="viewer-region-picker-sheet__search">
          <input
            ref={searchRef}
            type="search"
            className="viewer-region-picker-sheet__search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={REGION_UI.SEARCH_PLACEHOLDER}
            aria-label={REGION_UI.SEARCH_PLACEHOLDER}
            autoComplete="off"
          />
        </div>
        <ul className="viewer-region-picker-sheet__list" role="listbox">
          {filtered.length === 0 ? (
            <li>
              <p className="viewer-region-picker-sheet__empty">{REGION_UI.SEARCH_EMPTY}</p>
            </li>
          ) : (
            filtered.map((region) => {
              const isSelected = region.code === selected;
              return (
                <li key={region.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={[
                      "viewer-region-picker-sheet__option",
                      isSelected
                        ? "viewer-region-picker-sheet__option--selected"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => onSelect(region.code)}
                  >
                    {region.name}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
