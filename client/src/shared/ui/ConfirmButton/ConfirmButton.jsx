import { useEffect, useId, useRef, useState } from "react";

import { FORMAT_BOOLEAN_RU } from "../../config/appUiCopy.js";

import "./ConfirmButton.css";

/** Через столько секунд вопрос снимается сам. */
const AUTO_CANCEL_MS = 8000;

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
  const rootRef = useRef(/** @type {HTMLSpanElement | null} */ (null));
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
    if (!asking || !isPopover) return undefined;

    const onPointerDown = (event) => {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node)) return;
      if (!root.contains(event.target)) setAsking(false);
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

  const triggerLabel = isPending && pendingLabel ? pendingLabel : label;

  const actions = (
    <span className="confirm-button__actions">
      <button
        type="button"
        className="confirm-button__no"
        onClick={() => setAsking(false)}
        disabled={disabled}
      >
        {FORMAT_BOOLEAN_RU.NO}
      </button>
      <button
        type="button"
        className="confirm-button__yes"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        disabled={disabled}
      >
        {FORMAT_BOOLEAN_RU.YES}
      </button>
    </span>
  );

  if (isPopover) {
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
          aria-controls={asking ? panelId : undefined}
          aria-haspopup="dialog"
        >
          {triggerLabel}
        </button>
        {asking ? (
          <span
            id={panelId}
            className="confirm-button__popover"
            role="dialog"
            aria-label={question}
          >
            <span className="confirm-button__question">{question}</span>
            {actions}
          </span>
        ) : null}
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
