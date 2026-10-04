import { Suspense, lazy, useState } from "react";
import { QrCode } from "lucide-react";

import { SELLER_QR_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "./SellerShareLinkButton.css";

// Окно и библиотека QR грузятся только по нажатию: в entry-чанк они не попадают.
const SellerQrSheet = lazy(() =>
  import("./SellerQrSheet.jsx").then((module) => ({ default: module.SellerQrSheet })),
);

/**
 * QR-код своей витрины — рядом с «Поделиться». Показывается только самому
 * продавцу; оформление общее с SellerShareLinkButton.
 *
 * @param {{
 *   sellerId: string;
 *   sellerName?: string;
 *   avatarUrl?: string;
 *   variant?: "banner" | "meta";
 * }} props
 */
export function SellerQrButton({
  sellerId,
  sellerName = "",
  avatarUrl = "",
  variant = "meta",
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Окно остаётся в дереве после первого открытия — иначе не сыграет закрытие.
  const [wasOpened, setWasOpened] = useState(false);

  const id = String(sellerId ?? "").trim();
  if (!id) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={[
          "seller-share-link",
          variant === "banner"
            ? "seller-share-link--banner seller-share-link--banner-second"
            : "seller-share-link--meta",
        ].join(" ")}
        aria-label={SELLER_QR_UI.BUTTON_ARIA}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          setWasOpened(true);
          setIsOpen(true);
        }}
      >
        <AppIcon
          icon={QrCode}
          size="lg"
          strokeWidth={2.1}
          className="seller-share-link__icon"
        />
      </button>
      {wasOpened ? (
        <Suspense fallback={null}>
          <SellerQrSheet
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            sellerId={id}
            sellerName={sellerName}
            avatarUrl={avatarUrl}
          />
        </Suspense>
      ) : null}
    </>
  );
}
