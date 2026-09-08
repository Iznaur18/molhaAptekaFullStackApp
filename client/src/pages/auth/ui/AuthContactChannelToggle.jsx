import { isEmailAuthEnabled } from "@izibuy/shared-lib";

/**
 * Переключатель email/телефон. Когда почта выключена — ничего не рисует.
 *
 * @param {{
 *   channel: "email" | "phone";
 *   onChange: (channel: "email" | "phone") => void;
 *   disabled?: boolean;
 *   ariaLabel: string;
 *   emailLabel: string;
 *   phoneLabel: string;
 * }} props
 */
export function AuthContactChannelToggle({
  channel,
  onChange,
  disabled = false,
  ariaLabel,
  emailLabel,
  phoneLabel,
}) {
  if (!isEmailAuthEnabled()) {
    return null;
  }

  return (
    <div className="auth-page__channel" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className={
          channel === "email"
            ? "auth-page__channel-btn auth-page__channel-btn--active"
            : "auth-page__channel-btn"
        }
        onClick={() => onChange("email")}
        disabled={disabled}
      >
        {emailLabel}
      </button>
      <button
        type="button"
        className={
          channel === "phone"
            ? "auth-page__channel-btn auth-page__channel-btn--active"
            : "auth-page__channel-btn"
        }
        onClick={() => onChange("phone")}
        disabled={disabled}
      >
        {phoneLabel}
      </button>
    </div>
  );
}
