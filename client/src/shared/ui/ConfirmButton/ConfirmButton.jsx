import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { FORMAT_BOOLEAN_RU } from "../../config/appUiCopy.js";

import "./ConfirmButton.css";

/** Через столько секунд вопрос снимается сам. */
const AUTO_CANCEL_MS = 8000;
/** Окно скрывается сразу; scrim доигрывает после. */
const POPOVER_EXIT_MS = 0;
const SCRIM_EXIT_MS = 250;
const EXIT_MS = POPOVER_EXIT_MS + SCRIM_EXIT_MS;

function getExitMs() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return EXIT_MS;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : EXIT_MS;
}

/**
 * Кнопка, которая спрашивает подтверждение прямо на месте.
 *
 * Раньше здесь стоял `window.confirm`. Браузер после нескольких диалогов
 * подряд предлагает «не показывать больше», и тогда каждый такой вызов молча
 * возвращает «нет»: кнопка выглядит рабочей, но не делает ничего и ничего не
 * говорит. Встроенный вопрос от настроек браузера не зависит.
 *
 * @param {{
 *   label: string;
 *   question: string;
 *   onConfirm: () => void;
 *   disabled?: boolean;
 *   className?: string;
 *   pendingLabel?: string;
 *   isPending?: boolean;
 *   variant?: "inline" | "popover";
 * }} props
 */
export function ConfirmButton({
  label,
  question,
  onConfirm,
  disabled = false,
  className = "",
  pendingLabel = "",
  isPending = false,
  variant = "inline",
}) {
  const [asking, setAsking] = useState(false);
  const [portalMounted, setPortalMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const rootRef = useRef(/** @type {HTMLSpanElement | null} */ (null));
  const panelRef = useRef(/** @type {HTMLSpanElement | null} */ (null));
  const timerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));
  const panelId = useId();
  const isPopover = variant === "popover";

  useEffect(() => {
    if (!asking) return undefined;
    timerRef.current = setTimeout(() => setAsking(false), AUTO_CANCEL_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [asking]);

  useEffect(() => {
    if (!isPopover) return undefined;

    if (asking) {
      setPortalMounted(true);
      setExiting(false);
      return undefined;
    }

    if (!portalMounted) return undefined;

    setExiting(true);
    const exitTimer = setTimeout(() => {
      setPortalMounted(false);
      setExiting(false);
    }, getExitMs());

    return () => clearTimeout(exitTimer);
  }, [asking, isPopover, portalMounted]);

  useEffect(() => {
    if (!asking || !isPopover) return undefined;

    const onPointerDown = (event) => {
      if (!(event.target instanceof Node)) return;
      const root = rootRef.current;
      const panel = panelRef.current;
      if (root?.contains(event.target) || panel?.contains(event.target)) return;
      setAsking(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setAsking(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [asking, isPopover]);

  const closeAsking = () => setAsking(false);
  const triggerLabel = isPending && pendingLabel ? pendingLabel : label;

  const actions = (
    <span className="confirm-button__actions">
      <button
        type="button"
        className="confirm-button__no"
        onClick={closeAsking}
        disabled={disabled || exiting}
      >
        {FORMAT_BOOLEAN_RU.NO}
      </button>
      <button
        type="button"
        className="confirm-button__yes"
        onClick={() => {
          closeAsking();
          onConfirm();
        }}
        disabled={disabled || exiting}
      >
        {FORMAT_BOOLEAN_RU.YES}
      </button>
    </span>
  );

  if (isPopover) {
    const portalClass = exiting
      ? "confirm-button__portal confirm-button__portal--out"
      : "confirm-button__portal";
    const scrimClass = exiting
      ? "confirm-button__scrim confirm-button__scrim--out"
      : "confirm-button__scrim";
    const popoverClass = exiting
      ? "confirm-button__popover confirm-button__popover--out"
      : "confirm-button__popover";

    return (
      <span
        ref={rootRef}
        className={`confirm-button confirm-button--popover${asking ? " confirm-button--open" : ""}`}
      >
        <button
          type="button"
          className={className}
          onClick={() => setAsking((open) => !open)}
          disabled={disabled}
          aria-expanded={asking}
          aria-controls={portalMounted ? panelId : undefined}
          aria-haspopup="dialog"
        >
          {triggerLabel}
        </button>
        {portalMounted
          ? createPortal(
              <span className={portalClass} role="presentation">
                <span
                  className={scrimClass}
                  aria-hidden="true"
                  onClick={closeAsking}
                />
                <span
                  ref={panelRef}
                  id={panelId}
                  className={popoverClass}
                  role="dialog"
                  aria-modal="true"
                  aria-label={question}
                >
                  <span className="confirm-button__question">{question}</span>
                  {actions}
                </span>
              </span>,
              document.body,
            )
          : null}
      </span>
    );
  }

  if (!asking) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => setAsking(true)}
        disabled={disabled}
      >
        {triggerLabel}
      </button>
    );
  }

  return (
    <span className="confirm-button" role="group">
      <span className="confirm-button__question">{question}</span>
      {actions}
    </span>
  );
}
