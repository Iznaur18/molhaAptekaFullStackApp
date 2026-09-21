import {
  CDEK_INTAKE_DAY_END,
  CDEK_INTAKE_DAY_START,
  validateCdekIntakeWindow,
} from "@molha/api-contract";
import { useMutation } from "@tanstack/react-query";
import { useId, useState } from "react";

import { CDEK_WAYBILL_UI } from "../../../shared/config/appUiCopy.js";
import { createCdekIntake } from "../api/cdekWaybillApi.js";

/** Сегодня по Москве, как считает и сервер. */
const moscowDate = (offsetDays = 0) =>
  new Date(Date.now() + 3 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

/** Часы от начала до конца рабочего дня курьера: «09:00» … «22:00». */
const HOURS = (() => {
  const first = Number(CDEK_INTAKE_DAY_START.slice(0, 2));
  const last = Number(CDEK_INTAKE_DAY_END.slice(0, 2));
  return Array.from(
    { length: last - first + 1 },
    (_, index) => `${String(first + index).padStart(2, "0")}:00`,
  );
})();

/**
 * Вызов курьера СДЭК для тарифов «от двери»: день, окно и телефон. Уже
 * вызванный курьер показывается итогом.
 *
 * @param {{
 *   orderId: string;
 *   intake: Record<string, any> | null | undefined;
 *   onBooked: (waybill: Record<string, any>) => void;
 * }} props
 */
export function CdekIntakeSection({ orderId, intake, onBooked }) {
  const ids = {
    date: useId(),
    from: useId(),
    to: useId(),
    phone: useId(),
    comment: useId(),
  };
  const [form, setForm] = useState({
    intakeDate: moscowDate(1),
    timeFrom: "10:00",
    timeTo: "14:00",
    phone: "",
    comment: "",
  });
  const mutation = useMutation({
    mutationFn: createCdekIntake,
    onSuccess: (next) => {
      if (next) onBooked(next);
    },
  });

  if (intake?.uuid) {
    return (
      <div className="cdek-waybill-panel__notice">
        <p className="cdek-waybill-panel__notice-text">
          {CDEK_WAYBILL_UI.INTAKE_BOOKED(intake.date, intake.timeFrom, intake.timeTo)}
        </p>
        {intake.status ? (
          <p className="cdek-waybill-panel__hint">
            {CDEK_WAYBILL_UI.INTAKE_STATUS}: {intake.status}
          </p>
        ) : null}
        {intake.error ? (
          <p className="cdek-waybill-panel__error" role="alert">
            {intake.error}
          </p>
        ) : null}
      </div>
    );
  }

  const windowError = validateCdekIntakeWindow(form, moscowDate(0));
  const canSubmit =
    !windowError && form.phone.trim().length >= 10 && !mutation.isPending;
  /** @param {keyof typeof form} field */
  const bind = (field) => ({
    value: form[field],
    onChange: (/** @type {{ target: { value: string } }} */ event) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value })),
  });

  return (
    <div className="cdek-waybill-panel__form">
      <p className="cdek-waybill-panel__notice-text">{CDEK_WAYBILL_UI.INTAKE_TITLE}</p>
      <div className="cdek-waybill-panel__row">
        <label className="cdek-waybill-panel__field" htmlFor={ids.date}>
          <span className="cdek-waybill-panel__label">
            {CDEK_WAYBILL_UI.INTAKE_DATE}
          </span>
          <input
            id={ids.date}
            type="date"
            className="cdek-waybill-panel__input"
            min={moscowDate(0)}
            {...bind("intakeDate")}
          />
        </label>
        <label className="cdek-waybill-panel__field" htmlFor={ids.from}>
          <span className="cdek-waybill-panel__label">
            {CDEK_WAYBILL_UI.INTAKE_FROM}
          </span>
          <select
            id={ids.from}
            className="cdek-waybill-panel__input"
            {...bind("timeFrom")}
          >
            {HOURS.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </label>
        <label className="cdek-waybill-panel__field" htmlFor={ids.to}>
          <span className="cdek-waybill-panel__label">{CDEK_WAYBILL_UI.INTAKE_TO}</span>
          <select id={ids.to} className="cdek-waybill-panel__input" {...bind("timeTo")}>
            {HOURS.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="cdek-waybill-panel__field" htmlFor={ids.phone}>
        <span className="cdek-waybill-panel__label">
          {CDEK_WAYBILL_UI.INTAKE_PHONE}
        </span>
        <input
          id={ids.phone}
          type="tel"
          autoComplete="tel"
          className="cdek-waybill-panel__input"
          placeholder="+7 900 000-00-00"
          {...bind("phone")}
        />
      </label>
      <label className="cdek-waybill-panel__field" htmlFor={ids.comment}>
        <span className="cdek-waybill-panel__label">
          {CDEK_WAYBILL_UI.INTAKE_COMMENT}
        </span>
        <input
          id={ids.comment}
          className="cdek-waybill-panel__input"
          maxLength={255}
          {...bind("comment")}
        />
      </label>
      {windowError ? <p className="cdek-waybill-panel__hint">{windowError}</p> : null}
      {mutation.isError ? (
        <p className="cdek-waybill-panel__error" role="alert">
          {mutation.error.message}
        </p>
      ) : null}
      <button
        type="button"
        className="cdek-waybill-panel__button"
        disabled={!canSubmit}
        onClick={() =>
          mutation.mutate({
            orderId,
            ...form,
            comment: form.comment.trim() || undefined,
          })
        }
      >
        {mutation.isPending
          ? CDEK_WAYBILL_UI.INTAKE_PENDING
          : CDEK_WAYBILL_UI.INTAKE_SUBMIT}
      </button>
    </div>
  );
}
