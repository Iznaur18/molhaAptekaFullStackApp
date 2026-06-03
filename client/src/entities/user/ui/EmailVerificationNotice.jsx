import { EMAIL_VERIFICATION_UI } from "../../../shared/config/appUiCopy.js";

import "./EmailVerificationNotice.css";

/**
 * @param {{
 *   notice: { kind: 'success' | 'error'; message: string } | null;
 *   onDismiss: () => void;
 * }} props
 */
export function EmailVerificationNotice({ notice, onDismiss }) {
  if (!notice) {
    return null;
  }

  return (
    <div
      className={`email-verification-notice email-verification-notice_${notice.kind}`}
      role="status"
    >
      <p className="email-verification-notice__text">{notice.message}</p>
      <button
        type="button"
        className="email-verification-notice__dismiss"
        onClick={onDismiss}
        aria-label={EMAIL_VERIFICATION_UI.DISMISS_NOTICE}
      >
        ×
      </button>
    </div>
  );
}
