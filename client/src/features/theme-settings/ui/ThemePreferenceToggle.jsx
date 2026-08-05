import { useEffect, useState } from "react";

import { THEME_SETTINGS_UI } from "../../../shared/config/appUiCopy.js";
import {
  getThemePreference,
  setThemePreference,
  subscribeThemePreference,
} from "../../../shared/theme/runtimeDesignTokens.js";

import "./ThemePreferenceToggle.css";

/** @typedef {import('../../../shared/theme/themePreferenceStorage.js').ThemePreference} ThemePreference */

const OPTIONS = [
  { value: /** @type {ThemePreference} */ ("system"), label: THEME_SETTINGS_UI.SYSTEM },
  { value: /** @type {ThemePreference} */ ("light"), label: THEME_SETTINGS_UI.LIGHT },
  { value: /** @type {ThemePreference} */ ("dark"), label: THEME_SETTINGS_UI.DARK },
  { value: /** @type {ThemePreference} */ ("custom"), label: THEME_SETTINGS_UI.CUSTOM },
];

export function ThemePreferenceToggle() {
  const [preference, setPreference] = useState(getThemePreference);

  useEffect(() => subscribeThemePreference(setPreference), []);

  return (
    <div className="theme-preference-toggle">
      <p className="theme-preference-toggle__label">{THEME_SETTINGS_UI.LABEL}</p>
      <div className="theme-preference-toggle__row" role="group" aria-label={THEME_SETTINGS_UI.LABEL}>
        {OPTIONS.map((option) => {
          const isActive = preference === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={[
                "theme-preference-toggle__chip",
                isActive ? "theme-preference-toggle__chip--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={isActive}
              onClick={() => setThemePreference(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
