import { USER_BACKGROUND_PRESETS } from "../model/userBackgroundPresets.js";

import "./UserBackgroundPresetPicker.css";

/**
 * @param {{
 *   value: string;
 *   onChange: (presetId: string) => void;
 *   disabled?: boolean;
 *   legend: string;
 * }} props
 */
export function UserBackgroundPresetPicker({
  value,
  onChange,
  disabled = false,
  legend,
}) {
  return (
    <fieldset className="user-background-presets" disabled={disabled}>
      <legend className="user-background-presets__legend">{legend}</legend>
      <div className="user-background-presets__grid" role="radiogroup">
        {USER_BACKGROUND_PRESETS.map((preset) => {
          const isSelected = value === preset.id;
          return (
            <label
              key={preset.id}
              className={
                isSelected
                  ? "user-background-presets__option user-background-presets__option_selected"
                  : "user-background-presets__option"
              }
              title={preset.labelRu}
            >
              <input
                type="radio"
                name="backgroundPresetId"
                value={preset.id}
                checked={isSelected}
                disabled={disabled}
                className="user-background-presets__input"
                onChange={() => onChange(preset.id)}
              />
              <span
                className="user-background-presets__swatch"
                style={{ backgroundColor: preset.hex }}
                aria-hidden="true"
              />
              <span className="user-background-presets__label">{preset.labelRu}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
