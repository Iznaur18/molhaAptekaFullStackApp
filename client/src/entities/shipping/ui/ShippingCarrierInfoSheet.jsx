import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { Clock, Globe, Info, MapPin, Phone } from "lucide-react";
import { buildShippingCarrierInfoTelHref } from "@molha/api-contract";

import { SHIPPING_CARRIER_INFO_UI } from "../../../shared/config/appUiCopy.js";
import { useEnterExitMountAnimation } from "../../../shared/lib/useEnterExitMountAnimation.js";
import { useRegisterBlockingOverlay } from "../../../shared/lib/useBlockingOverlayOccupancy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "./ShippingCarrierInfoSheet.css";

const SHEET_EXIT_MS = 240;

const ROWS = [
  { field: "description", icon: Info },
  { field: "workHours", icon: Clock },
  { field: "coverage", icon: MapPin },
  { field: "phone", icon: Phone },
  { field: "website", icon: Globe },
];

/**
 * Окно снизу со справкой о службе доставки: описание, график, где работает,
 * телефон и сайт. Пустые поля не показываются.
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   info: {
 *     label: string;
 *     description?: string;
 *     workHours?: string;
 *     coverage?: string;
 *     phone?: string;
 *     website?: string;
 *   } | null;
 * }} props
 */
export function ShippingCarrierInfoSheet({ isOpen, onClose, info }) {
  const sheetId = useId();
  const titleId = `${sheetId}-title`;
  const { mounted, isVisible: visible } = useEnterExitMountAnimation(isOpen, {
    exitMs: SHEET_EXIT_MS,
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

  if (!mounted || !info) {
    return null;
  }

  const rows = ROWS.map((row) => ({
    ...row,
    value: String(info[row.field] ?? "").trim(),
  })).filter((row) => row.value !== "");

  return createPortal(
    <div
      className={[
        "shipping-carrier-info-sheet__backdrop",
        visible ? "shipping-carrier-info-sheet__backdrop--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="presentation"
    >
      <div className="shipping-carrier-info-sheet__scrim" aria-hidden="true" />
      <button
        type="button"
        className="shipping-carrier-info-sheet__dismiss"
        aria-label={SHIPPING_CARRIER_INFO_UI.CLOSE}
        onClick={onClose}
      />
      <div
        id={sheetId}
        className="shipping-carrier-info-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="shipping-carrier-info-sheet__header">
          <h2 id={titleId} className="shipping-carrier-info-sheet__title">
            {info.label}
          </h2>
          <button
            type="button"
            className="shipping-carrier-info-sheet__close"
            onClick={onClose}
          >
            {SHIPPING_CARRIER_INFO_UI.CLOSE}
          </button>
        </header>
        <dl className="shipping-carrier-info-sheet__body">
          {rows.map((row) => (
            <div key={row.field} className="shipping-carrier-info-sheet__row">
              <span className="shipping-carrier-info-sheet__icon" aria-hidden="true">
                <AppIcon icon={row.icon} size="sm" strokeWidth={2.1} />
              </span>
              <div className="shipping-carrier-info-sheet__text">
                <dt className="shipping-carrier-info-sheet__label">
                  {SHIPPING_CARRIER_INFO_UI.FIELD_LABELS[row.field]}
                </dt>
                <dd className="shipping-carrier-info-sheet__value">
                  <InfoValue field={row.field} value={row.value} />
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </div>,
    document.body,
  );
}

/** @param {{ field: string; value: string }} props */
function InfoValue({ field, value }) {
  if (field === "phone") {
    const href = buildShippingCarrierInfoTelHref(value);
    return href ? (
      <a className="shipping-carrier-info-sheet__link" href={href}>
        {value}
      </a>
    ) : (
      value
    );
  }
  if (field === "website") {
    return (
      <a
        className="shipping-carrier-info-sheet__link"
        href={value}
        target="_blank"
        rel="noopener noreferrer"
      >
        {value.replace(/^https?:\/\//iu, "").replace(/\/$/u, "")}
      </a>
    );
  }
  return value;
}
