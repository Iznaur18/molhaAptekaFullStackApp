import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Plus } from "lucide-react";

import { SELLER_SOCIAL_LINKS_UI } from "../../../shared/config/appUiCopy.js";
import { useEnterExitMountAnimation } from "../../../shared/lib/useEnterExitMountAnimation.js";
import { useRegisterBlockingOverlay } from "../../../shared/lib/useBlockingOverlayOccupancy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { getMissingSellerSocialFields } from "../lib/getSellerSocialLinks.js";
import { SocialBrandIcon } from "./SocialBrandIcon.jsx";

// Каркас окна (подложка, выезд снизу, шапка) общий с окном QR-кода.
import "./SellerQrSheet.css";
import "./SellerSocialLinksSheet.css";

const SHEET_EXIT_MS = 240;

/**
 * Окно снизу со ссылками продавца: соцсети, WhatsApp, сайт. Каждая строка
 * открывает ссылку в новой вкладке. Владелец ниже видит то, что ещё не
 * добавил: нажатие ведёт в редактирование профиля (`onAddLink`).
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   links: { id: string; label: string; href: string; display: string }[];
 *   isSelf?: boolean;
 *   onAddLink?: (fieldId: string) => void;
 * }} props
 */
export function SellerSocialLinksSheet({
  isOpen,
  onClose,
  links,
  isSelf = false,
  onAddLink,
}) {
  const sheetId = useId();
  const titleId = `${sheetId}-title`;
  const { mounted, isVisible: visible } = useEnterExitMountAnimation(isOpen, {
    exitMs: SHEET_EXIT_MS,
  });

  useScrollLock(mounted);
  useRegisterBlockingOverlay(mounted);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, onClose]);

  if (!mounted) {
    return null;
  }

  const missingFields =
    isSelf && typeof onAddLink === "function"
      ? getMissingSellerSocialFields(links)
      : [];

  return createPortal(
    <div
      className={[
        "seller-qr-sheet__backdrop",
        visible ? "seller-qr-sheet__backdrop--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="presentation"
    >
      <div className="seller-qr-sheet__scrim" aria-hidden="true" />
      <button
        type="button"
        className="seller-qr-sheet__dismiss"
        aria-label={SELLER_SOCIAL_LINKS_UI.CLOSE}
        onClick={onClose}
      />
      <div
        id={sheetId}
        className="seller-qr-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="seller-qr-sheet__header">
          <h2 id={titleId} className="seller-qr-sheet__title">
            {SELLER_SOCIAL_LINKS_UI.TITLE}
          </h2>
          <button type="button" className="seller-qr-sheet__close" onClick={onClose}>
            {SELLER_SOCIAL_LINKS_UI.CLOSE}
          </button>
        </header>

        <div className="seller-qr-sheet__body">
          {links.length > 0 ? (
            <ul className="seller-social-links__list">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    className="seller-social-links__row"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label={SELLER_SOCIAL_LINKS_UI.OPEN_ARIA(link.label)}
                  >
                    <span
                      className={`seller-social-links__badge seller-social-links__badge--${link.id}`}
                    >
                      <SocialBrandIcon id={link.id} size={22} strokeWidth={2} />
                    </span>
                    <span className="seller-social-links__text">
                      <span className="seller-social-links__label">{link.label}</span>
                      <span className="seller-social-links__value">{link.display}</span>
                    </span>
                    <AppIcon
                      icon={ChevronRight}
                      size="sm"
                      strokeWidth={2.25}
                      className="seller-social-links__chevron"
                    />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          {missingFields.length > 0 ? (
            <section
              className="seller-social-links__add"
              aria-label={SELLER_SOCIAL_LINKS_UI.ADD_TITLE}
            >
              <h3 className="seller-social-links__add-title">
                {SELLER_SOCIAL_LINKS_UI.ADD_TITLE}
              </h3>
              <p className="seller-social-links__add-hint">
                {SELLER_SOCIAL_LINKS_UI.ADD_HINT}
              </p>
              <ul className="seller-social-links__list">
                {missingFields.map((field) => (
                  <li key={field.id}>
                    <button
                      type="button"
                      className="seller-social-links__add-row"
                      aria-label={SELLER_SOCIAL_LINKS_UI.ADD_ARIA(field.labelRu)}
                      onClick={() => {
                        onClose();
                        onAddLink(field.id);
                      }}
                    >
                      <span
                        className={`seller-social-links__badge seller-social-links__badge--${field.id}`}
                      >
                        <SocialBrandIcon id={field.id} size={22} strokeWidth={2} />
                      </span>
                      <span className="seller-social-links__text">
                        <span className="seller-social-links__label">
                          {field.labelRu}
                        </span>
                        <span className="seller-social-links__value">
                          {SELLER_SOCIAL_LINKS_UI.ADD_ROW_HINT}
                        </span>
                      </span>
                      <AppIcon
                        icon={Plus}
                        size="sm"
                        strokeWidth={2.25}
                        className="seller-social-links__chevron"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
