import { Link } from "react-router-dom";

import {
  REGISTRATION_PERSONAL_DATA_CONSENT_OPERATOR,
  REGISTRATION_PERSONAL_DATA_CONSENT_PURPOSES,
  REGISTRATION_PERSONAL_DATA_CONSENT_SUMMARY,
  REGISTRATION_PERSONAL_DATA_CONSENT_WITHDRAWAL,
} from "../model/registrationConsentContent.js";
import { AUTH_UI } from "../../../shared/config/appUiCopy.js";

import "./RegisterLegalConsentFields.css";

/**
 * @param {{
 *   checked: boolean;
 *   disabled?: boolean;
 *   onToggle: () => void;
 *   children: import('react').ReactNode;
 * }} props
 */
function ConsentCheckbox({ checked, disabled = false, onToggle, children }) {
  return (
    <button
      type="button"
      className="register-consent__row"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
    >
      <span
        className={[
          "register-consent__box",
          checked ? "register-consent__box--checked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      >
        {checked ? "✓" : ""}
      </span>
      <span className="register-consent__text-wrap">{children}</span>
    </button>
  );
}

/**
 * @param {{
 *   termsAccepted: boolean;
 *   personalDataConsentAccepted: boolean;
 *   disabled?: boolean;
 *   onTermsAcceptedChange: (value: boolean) => void;
 *   onPersonalDataConsentAcceptedChange: (value: boolean) => void;
 * }} props
 */
export function RegisterLegalConsentFields({
  termsAccepted,
  personalDataConsentAccepted,
  disabled = false,
  onTermsAcceptedChange,
  onPersonalDataConsentAcceptedChange,
}) {
  return (
    <div className="register-consent">
      <ConsentCheckbox
        checked={termsAccepted}
        disabled={disabled}
        onToggle={() => onTermsAcceptedChange(!termsAccepted)}
      >
        <span className="register-consent__text">
          {AUTH_UI.REGISTER_TERMS_CONSENT_PREFIX}
          <Link
            className="register-consent__link"
            to="/legal/terms"
            onClick={(event) => event.stopPropagation()}
          >
            {AUTH_UI.REGISTER_TERMS_LINK}
          </Link>
          {AUTH_UI.REGISTER_TERMS_CONSENT_AND}
          <Link
            className="register-consent__link"
            to="/legal/listing"
            onClick={(event) => event.stopPropagation()}
          >
            {AUTH_UI.REGISTER_LISTING_LINK}
          </Link>
        </span>
      </ConsentCheckbox>

      <ConsentCheckbox
        checked={personalDataConsentAccepted}
        disabled={disabled}
        onToggle={() =>
          onPersonalDataConsentAcceptedChange(!personalDataConsentAccepted)
        }
      >
        <span className="register-consent__text">
          {AUTH_UI.REGISTER_PRIVACY_CONSENT_PREFIX}
          <Link
            className="register-consent__link"
            to="/legal/privacy"
            onClick={(event) => event.stopPropagation()}
          >
            {AUTH_UI.REGISTER_PRIVACY_CONSENT_LINK}
          </Link>
          {AUTH_UI.REGISTER_PRIVACY_CONSENT_SUFFIX}
          <Link
            className="register-consent__link"
            to="/legal/privacy"
            onClick={(event) => event.stopPropagation()}
          >
            {AUTH_UI.REGISTER_PRIVACY_LINK}
          </Link>
        </span>
        <span className="register-consent__summary">
          {REGISTRATION_PERSONAL_DATA_CONSENT_SUMMARY}
        </span>
        <span className="register-consent__summary">
          {REGISTRATION_PERSONAL_DATA_CONSENT_PURPOSES}
        </span>
        <span className="register-consent__summary">
          {REGISTRATION_PERSONAL_DATA_CONSENT_OPERATOR}
        </span>
        <span className="register-consent__summary">
          {REGISTRATION_PERSONAL_DATA_CONSENT_WITHDRAWAL}
        </span>
      </ConsentCheckbox>
    </div>
  );
}
