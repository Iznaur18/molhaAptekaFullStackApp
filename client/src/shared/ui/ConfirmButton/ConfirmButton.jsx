import { useEffect, useRef, useState } from "react";

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
}) {
  const [asking, setAsking] = useState(false);
  const timerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));

  useEffect(() => {
    if (!asking) return undefined;
    timerRef.current = setTimeout(() => setAsking(false), AUTO_CANCEL_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [asking]);

  if (!asking) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => setAsking(true)}
        disabled={disabled}
      >
        {isPending && pendingLabel ? pendingLabel : label}
      </button>
    );
  }

  return (
    <span className="confirm-button" role="group">
      <span className="confirm-button__question">{question}</span>
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
    </span>
  );
}
