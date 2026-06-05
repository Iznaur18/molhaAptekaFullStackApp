import { useEffect, useState } from "react";

import {
  computeStaffPremiumExpiresAtInput,
  formatPremiumExpiresAtDisplay,
  isPremiumExpiresAtInputActive,
  STAFF_PREMIUM_PRESET_MONTHS,
} from "../lib/computeStaffPremiumExpiry.js";
import { isPremiumActive } from "../lib/isPremiumActive.js";
import { ADMIN_EDIT_USER_UI } from "../../../shared/config/appUiCopy.js";

import "./AdminPremiumStaffControl.css";

/**
 * @param {{
 *   user: import('../model/types.js').UserPublicProfile;
 *   premiumExpiresAt: string;
 *   onPremiumExpiresAtChange: (value: string) => void;
 *   disabled?: boolean;
 * }} props
 */
export function AdminPremiumStaffControl({
  user,
  premiumExpiresAt,
  onPremiumExpiresAtChange,
  disabled = false,
}) {
  const [premiumEnabled, setPremiumEnabled] = useState(false);
  const [termMode, setTermMode] = useState(
    /** @type {'preset' | 'custom'} */ ("preset"),
  );
  const [presetMonths, setPresetMonths] = useState(1);

  useEffect(() => {
    const active = isPremiumActive(user);
    setPremiumEnabled(active);
    setTermMode(active ? "custom" : "preset");
    setPresetMonths(1);
  }, [user._id]);

  const statusText = isPremiumExpiresAtInputActive(premiumExpiresAt)
    ? ADMIN_EDIT_USER_UI.PREMIUM_STATUS_ACTIVE(
        formatPremiumExpiresAtDisplay(premiumExpiresAt),
      )
    : ADMIN_EDIT_USER_UI.PREMIUM_STATUS_OFF;

  const handleToggle = (event) => {
    const nextEnabled = event.target.checked;
    if (!nextEnabled) {
      setPremiumEnabled(false);
      onPremiumExpiresAtChange("");
      return;
    }

    setPremiumEnabled(true);
    setTermMode("preset");
    setPresetMonths(1);
    onPremiumExpiresAtChange(computeStaffPremiumExpiresAtInput(user, 1));
  };

  const handlePresetClick = (months) => {
    if (disabled) {
      return;
    }
    setPremiumEnabled(true);
    setTermMode("preset");
    setPresetMonths(months);
    onPremiumExpiresAtChange(computeStaffPremiumExpiresAtInput(user, months));
  };

  const handleCustomChange = (event) => {
    const nextValue = event.target.value;
    setPremiumEnabled(nextValue.trim() !== "");
    setTermMode("custom");
    onPremiumExpiresAtChange(nextValue);
  };

  return (
    <section
      className="admin-premium-staff-control"
      aria-labelledby="admin-premium-staff-control-title"
    >
      <div className="admin-premium-staff-control__header">
        <h3
          id="admin-premium-staff-control-title"
          className="admin-premium-staff-control__title"
        >
          {ADMIN_EDIT_USER_UI.PREMIUM_CARD_TITLE}
        </h3>
        <p className="admin-premium-staff-control__status">{statusText}</p>
      </div>

      <label className="admin-premium-staff-control__toggle">
        <input
          type="checkbox"
          checked={premiumEnabled}
          onChange={handleToggle}
          disabled={disabled}
        />
        <span>{ADMIN_EDIT_USER_UI.PREMIUM_TOGGLE_LABEL}</span>
      </label>

      {premiumEnabled ? (
        <div className="admin-premium-staff-control__panel">
          <p className="admin-premium-staff-control__hint">
            {ADMIN_EDIT_USER_UI.PREMIUM_EXTEND_HINT}
          </p>
          <div
            className="admin-premium-staff-control__presets"
            role="group"
            aria-label={ADMIN_EDIT_USER_UI.PREMIUM_PRESETS_ARIA}
          >
            {STAFF_PREMIUM_PRESET_MONTHS.map((months) => {
              const isSelected = termMode === "preset" && presetMonths === months;
              return (
                <button
                  key={months}
                  type="button"
                  className={
                    isSelected
                      ? "admin-premium-staff-control__preset admin-premium-staff-control__preset_selected"
                      : "admin-premium-staff-control__preset"
                  }
                  disabled={disabled}
                  onClick={() => handlePresetClick(months)}
                >
                  {ADMIN_EDIT_USER_UI.PREMIUM_PRESET_MONTHS(months)}
                </button>
              );
            })}
          </div>
          <label className="admin-premium-staff-control__custom">
            <span>{ADMIN_EDIT_USER_UI.PREMIUM_CUSTOM_DATE_LABEL}</span>
            <input
              type="datetime-local"
              className="admin-premium-staff-control__datetime"
              value={premiumExpiresAt}
              onChange={handleCustomChange}
              onFocus={() => setTermMode("custom")}
              disabled={disabled}
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}
