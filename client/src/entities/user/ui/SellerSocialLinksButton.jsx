import { Suspense, lazy, useState } from "react";

import { SELLER_SOCIAL_LINKS_UI } from "../../../shared/config/appUiCopy.js";
import { SocialBrandIcon } from "./SocialBrandIcon.jsx";

import "./SellerShareLinkButton.css";

// Окно грузится только по нажатию: в entry-чанк оно не попадает.
const SellerSocialLinksSheet = lazy(() =>
  import("./SellerSocialLinksSheet.jsx").then((module) => ({
    default: module.SellerSocialLinksSheet,
  })),
);

const BANNER_SLOT_CLASS = {
  first: "",
  third: "seller-share-link--banner-third",
};

/**
 * Значок Instagram на витрине: открывает окно со всеми ссылками продавца
 * (соцсети, WhatsApp, сайт). Видна всем; у чужой витрины без ссылок не
 * показывается, а владельцу окно показывает, чего ещё не хватает.
 *
 * @param {{
 *   links: { id: string; label: string; href: string; display: string }[];
 *   isSelf?: boolean;
 *   onAddLink?: (fieldId: string) => void;
 *   variant?: "banner" | "meta";
 *   bannerSlot?: "first" | "third";
 * }} props
 */
export function SellerSocialLinksButton({
  links,
  isSelf = false,
  onAddLink,
  variant = "meta",
  bannerSlot = "first",
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Окно остаётся в дереве после первого открытия — иначе не сыграет закрытие.
  const [wasOpened, setWasOpened] = useState(false);

  if (links.length === 0 && !isSelf) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={[
          "seller-share-link",
          variant === "banner"
            ? `seller-share-link--banner ${BANNER_SLOT_CLASS[bannerSlot]}`
            : "seller-share-link--meta",
        ]
          .join(" ")
          .trim()}
        aria-label={SELLER_SOCIAL_LINKS_UI.BUTTON_ARIA}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          setWasOpened(true);
          setIsOpen(true);
        }}
      >
        <SocialBrandIcon id="socialInstagramUrl" className="seller-share-link__icon" />
      </button>
      {wasOpened ? (
        <Suspense fallback={null}>
          <SellerSocialLinksSheet
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            links={links}
            isSelf={isSelf}
            onAddLink={onAddLink}
          />
        </Suspense>
      ) : null}
    </>
  );
}
