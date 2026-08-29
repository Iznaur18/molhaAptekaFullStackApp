import { USER_BUSINESS_HOURS_WEEKDAY_LABELS_RU } from "@molha/api-contract";

import { EDIT_PROFILE_MODAL_UI } from "../../../shared/config/appUiCopy.js";

import "./EditProfileBusinessHoursFields.css";

const WEEKDAY_OPTIONS = USER_BUSINESS_HOURS_WEEKDAY_LABELS_RU.map((label, index) => ({
  value: index,
  label,
}));

/**
 * @param {{
 *   enabled: boolean;
 *   weekdays: number[];
 *   openTime: string;
 *   closeTime: string;
 *   disabled?: boolean;
 *   onEnabledChange: (enabled: boolean) => void;
 *   onWeekdaysChange: (weekdays: number[]) => void;
 *   onOpenTimeChange: (value: string) => void;
 *   onCloseTimeChange: (value: string) => void;
 * }} props
 */
export function EditProfileBusinessHoursFields({
  enabled,
  weekdays,
  openTime,
  closeTime,
  disabled = false,
  onEnabledChange,
  onWeekdaysChange,
  onOpenTimeChange,
  onCloseTimeChange,
}) {
  const toggleWeekday = (day) => {
    const next = weekdays.includes(day)
      ? weekdays.filter((value) => value !== day)
      : [...weekdays, day].sort((a, b) => a - b);
    onWeekdaysChange(next);
  };

  return (
    <div className="edit-profile-business-hours">
      <label className="edit-profile-modal__label edit-profile-modal__label_row">
        <input
          type="checkbox"
          checked={enabled}
          disabled={disabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
        />
        {EDIT_PROFILE_MODAL_UI.LABEL_BUSINESS_HOURS_ENABLED}
      </label>
      {enabled ? (
        <>
          <fieldset className="edit-profile-business-hours__weekdays" disabled={disabled}>
            <legend className="edit-profile-business-hours__legend">
              {EDIT_PROFILE_MODAL_UI.LABEL_BUSINESS_HOURS_DAYS}
            </legend>
            <div className="edit-profile-business-hours__weekday-grid">
              {WEEKDAY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="edit-profile-business-hours__weekday"
                >
                  <input
                    type="checkbox"
                    checked={weekdays.includes(option.value)}
                    onChange={() => toggleWeekday(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="edit-profile-business-hours__times">
            <label className="edit-profile-modal__label">
              {EDIT_PROFILE_MODAL_UI.LABEL_BUSINESS_HOURS_OPEN}
              <input
                className="edit-profile-modal__input"
                type="time"
                value={openTime}
                disabled={disabled}
                onChange={(event) => onOpenTimeChange(event.target.value)}
              />
            </label>
            <label className="edit-profile-modal__label">
              {EDIT_PROFILE_MODAL_UI.LABEL_BUSINESS_HOURS_CLOSE}
              <input
                className="edit-profile-modal__input"
                type="time"
                value={closeTime}
                disabled={disabled}
                onChange={(event) => onCloseTimeChange(event.target.value)}
              />
            </label>
          </div>
          <p className="edit-profile-modal__hint">{EDIT_PROFILE_MODAL_UI.HINT_BUSINESS_HOURS}</p>
        </>
      ) : null}
    </div>
  );
}
