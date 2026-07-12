import { useNavigate } from "react-router-dom";
import { Check, Crown, ShieldCheck } from "lucide-react";

import { ACCOUNT_REQUIREMENT_MODAL_UI } from "../../config/appUiCopy.js";
import { mainViewToPathname } from "../../lib/homeMainViewPaths.js";
import { AppIcon } from "../icon/index.js";
import { ProductModalShell } from "../ProductModalShell/ProductModalShell.jsx";

import "./AccountRequirementModal.css";

const ACCOUNT_REQUIREMENT_MODAL_TITLE_ID = "account-requirement-modal-title";

/** @typedef {'premium' | 'data-confirmation'} AccountRequirement */

/** @type {Record<AccountRequirement, { icon: import("lucide-react").LucideIcon; view: string; tone: string }>} */
const REQUIREMENT_META = {
  premium: { icon: Crown, view: "premium", tone: "premium" },
  "data-confirmation": { icon: ShieldCheck, view: "data-confirmation", tone: "confirm" },
};

/**
 * Окно-подсказка для действий, требующих премиум или подтверждённый аккаунт.
 * Объясняет, чего не хватает, перечисляет преимущества и ведёт в нужный раздел профиля.
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   requirement: AccountRequirement;
 *   actionLabel?: string;
 * }} props
 */
export function AccountRequirementModal({ isOpen, onClose, requirement, actionLabel }) {
  const navigate = useNavigate();
  const meta = REQUIREMENT_META[requirement];
  const copy = meta ? ACCOUNT_REQUIREMENT_MODAL_UI[requirement] : null;

  if (!meta || !copy) {
    return null;
  }

  const handleCta = () => {
    onClose();
    navigate(mainViewToPathname(meta.view));
  };

  return (
    <ProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={copy.TITLE}
      titleId={ACCOUNT_REQUIREMENT_MODAL_TITLE_ID}
      ariaLabel={ACCOUNT_REQUIREMENT_MODAL_UI.ARIA_DIALOG}
      size="md"
      bodyClassName="account-requirement-modal__body"
      footer={
        <div className="account-requirement-modal__actions">
          <button
            type="button"
            className={`account-requirement-modal__cta account-requirement-modal__cta--${meta.tone}`}
            onClick={handleCta}
          >
            {copy.CTA}
          </button>
          <button
            type="button"
            className="account-requirement-modal__close"
            onClick={onClose}
          >
            {ACCOUNT_REQUIREMENT_MODAL_UI.CLOSE}
          </button>
        </div>
      }
    >
      <div
        className={`account-requirement-modal__badge account-requirement-modal__badge--${meta.tone}`}
      >
        <AppIcon icon={meta.icon} size={28} strokeWidth={2.15} />
      </div>
      <p className="account-requirement-modal__intro">
        {ACCOUNT_REQUIREMENT_MODAL_UI.INTRO(actionLabel)}
      </p>
      <p className="account-requirement-modal__description">{copy.DESCRIPTION}</p>
      <p className="account-requirement-modal__benefits-title">
        {ACCOUNT_REQUIREMENT_MODAL_UI.BENEFITS_TITLE}
      </p>
      <ul className="account-requirement-modal__benefits">
        {copy.BENEFITS.map((benefit) => (
          <li key={benefit} className="account-requirement-modal__benefit">
            <AppIcon
              icon={Check}
              size="sm"
              strokeWidth={2.5}
              className="account-requirement-modal__benefit-icon"
            />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </ProductModalShell>
  );
}
