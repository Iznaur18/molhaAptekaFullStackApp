import { useId, useRef, useState } from "react";
import { getRuRegionByCode } from "@molha/api-contract";

import { REGION_UI } from "../../../shared/config/appUiCopy.js";
import { ViewerRegionPickerSheet } from "./ViewerRegionPickerSheet.jsx";

import "./RuRegionSelect.css";

/**
 * Поле региона с bottom sheet + поиск (паритет mobile RuRegionSelect / ViewerRegionPickerSheet).
 *
 * @param {{
 *   value: string;
 *   onChange: (code: string) => void;
 *   disabled?: boolean;
 *   id?: string;
 *   className?: string;
 *   required?: boolean;
 *   name?: string;
 * }} props
 */
export function RuRegionSelect({
  value,
  onChange,
  disabled = false,
  id,
  className = "",
  required = false,
  name,
}) {
  const sheetId = useId();
  const triggerRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const [open, setOpen] = useState(false);
  const selected = String(value ?? "").trim();
  const label = getRuRegionByCode(selected)?.name;

  return (
    <div className="ru-region-select">
      <input
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        value={selected}
        required={required}
        readOnly
        className="ru-region-select__native"
        onChange={() => {}}
        onInvalid={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
          if (!disabled) {
            setOpen(true);
          }
        }}
      />
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={["ru-region-select__trigger", className].filter(Boolean).join(" ")}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? sheetId : undefined}
        aria-label={label || REGION_UI.PLACEHOLDER}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
          }
        }}
      >
        <span
          className={[
            "ru-region-select__value",
            !label ? "ru-region-select__value--placeholder" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {label || REGION_UI.PLACEHOLDER}
        </span>
        <span className="ru-region-select__chevron" aria-hidden="true">
          ›
        </span>
      </button>
      <ViewerRegionPickerSheet
        id={sheetId}
        isOpen={open}
        value={selected}
        onClose={() => setOpen(false)}
        onSelect={(code) => {
          onChange(code);
          setOpen(false);
        }}
      />
    </div>
  );
}
