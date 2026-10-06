import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { buildSellerQrPath } from "@molha/api-contract";

import { useMySellerQrStatsQuery } from "../../analytics/model/useSellerQrAnalytics.js";
import { SELLER_QR_UI } from "../../../shared/config/appUiCopy.js";
import { useEnterExitMountAnimation } from "../../../shared/lib/useEnterExitMountAnimation.js";
import { useRegisterBlockingOverlay } from "../../../shared/lib/useBlockingOverlayOccupancy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { drawSellerQrCard } from "../lib/drawSellerQrCard.js";
import {
  SELLER_QR_QUIET_ZONE,
  buildSellerQrMatrix,
  buildSellerQrSvgPath,
} from "../lib/sellerQrMatrix.js";

import "./SellerQrSheet.css";

const SHEET_EXIT_MS = 240;

/**
 * @param {Blob} blob
 * @param {string} fileName
 */
function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Сразу отзывать нельзя: Safari не успевает начать загрузку.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Окно снизу с QR-кодом своей витрины: карточка (аватар, имя, код), скачать
 * PNG, поделиться и счётчик переходов по коду.
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   sellerId: string;
 *   sellerName?: string;
 *   avatarUrl?: string;
 *   isOwn?: boolean;
 * }} props
 */
export function SellerQrSheet({
  isOpen,
  onClose,
  sellerId,
  sellerName = "",
  avatarUrl = "",
  isOwn = true,
}) {
  const sheetId = useId();
  const titleId = `${sheetId}-title`;
  const { mounted, isVisible: visible } = useEnterExitMountAnimation(isOpen, {
    exitMs: SHEET_EXIT_MS,
  });
  const statsQuery = useMySellerQrStatsQuery({ enabled: mounted && isOwn });
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);

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

  const displayName = String(sellerName ?? "").trim() || SELLER_QR_UI.BRAND;
  // В код зашит постоянный адрес витрины: напечатанный код должен работать всегда.
  const url = `${window.location.origin}${buildSellerQrPath(sellerId)}`;
  const matrix = useMemo(() => buildSellerQrMatrix(url), [url]);
  const svgPath = useMemo(() => buildSellerQrSvgPath(matrix), [matrix]);
  const viewBoxSize = matrix.length + SELLER_QR_QUIET_ZONE * 2;

  if (!mounted) {
    return null;
  }

  const buildCard = () =>
    drawSellerQrCard({
      matrix,
      sellerName: displayName,
      caption: SELLER_QR_UI.CARD_CAPTION,
      brand: SELLER_QR_UI.BRAND,
      avatarUrl: avatarFailed ? "" : avatarUrl,
    });

  /** @param {(blob: Blob) => Promise<void> | void} handleBlob */
  const withCard = async (handleBlob) => {
    setIsBuilding(true);
    setError("");
    try {
      await handleBlob(await buildCard());
    } catch (cardError) {
      // Отмена системного окна «Поделиться» — не ошибка.
      if (cardError instanceof DOMException && cardError.name === "AbortError") {
        return;
      }
      console.error("Seller QR card failed", cardError);
      setError(SELLER_QR_UI.DOWNLOAD_ERROR);
    } finally {
      setIsBuilding(false);
    }
  };

  const fileName = SELLER_QR_UI.FILE_NAME(displayName);

  const handleDownload = () => withCard((blob) => downloadBlob(blob, fileName));

  const handleShare = () =>
    withCard(async (blob) => {
      const file = new File([blob], fileName, { type: "image/png" });
      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({ files: [file], title: displayName });
          return;
        } catch (shareError) {
          if (shareError instanceof DOMException && shareError.name === "AbortError") {
            return;
          }
          // Браузер не дал открыть «Поделиться» (жест истёк, пока рисовалась
          // картинка) — отдаём её файлом, чтобы нажатие не пропало.
          console.warn("Seller QR share is unavailable, downloading", shareError);
        }
      }
      // Системного «Поделиться» с файлом нет (десктоп) — отдаём картинку файлом.
      downloadBlob(blob, fileName);
    });

  const stats = statsQuery.data;

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
        aria-label={SELLER_QR_UI.CLOSE}
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
            {SELLER_QR_UI.TITLE}
          </h2>
          <button type="button" className="seller-qr-sheet__close" onClick={onClose}>
            {SELLER_QR_UI.CLOSE}
          </button>
        </header>

        <div className="seller-qr-sheet__body">
          {/* Карточка всегда светлая: так код читается камерой и в тёмной теме. */}
          <div className="seller-qr-sheet__card">
            {avatarUrl && !avatarFailed ? (
              <img
                className="seller-qr-sheet__avatar"
                src={avatarUrl}
                alt=""
                width={56}
                height={56}
                onError={() => setAvatarFailed(true)}
              />
            ) : null}
            <p className="seller-qr-sheet__name">{displayName}</p>
            <svg
              className="seller-qr-sheet__code"
              viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
              role="img"
              aria-label={SELLER_QR_UI.QR_ALT}
              shapeRendering="crispEdges"
            >
              <rect width={viewBoxSize} height={viewBoxSize} fill="#ffffff" />
              <path d={svgPath} fill="#111111" />
            </svg>
            <p className="seller-qr-sheet__caption">{SELLER_QR_UI.CARD_CAPTION}</p>
            <p className="seller-qr-sheet__brand">{SELLER_QR_UI.BRAND}</p>
          </div>

          <p className="seller-qr-sheet__hint">
            {isOwn ? SELLER_QR_UI.HINT : SELLER_QR_UI.HINT_VISITOR}
          </p>

          <div className="seller-qr-sheet__actions">
            <button
              type="button"
              className="app-btn app-btn--primary"
              disabled={isBuilding}
              onClick={handleDownload}
            >
              {isBuilding ? SELLER_QR_UI.DOWNLOAD_PENDING : SELLER_QR_UI.DOWNLOAD}
            </button>
            <button
              type="button"
              className="app-btn app-btn--secondary"
              disabled={isBuilding}
              onClick={handleShare}
            >
              {SELLER_QR_UI.SHARE}
            </button>
          </div>

          {error ? (
            <p className="seller-qr-sheet__error" role="alert">
              {error}
            </p>
          ) : null}

          {/* Переходы по коду — личная статистика продавца, гостю не показываем. */}
          {isOwn ? (
            <section
              className="seller-qr-sheet__stats"
              aria-label={SELLER_QR_UI.STATS_TITLE}
            >
              <h3 className="seller-qr-sheet__stats-title">
                {SELLER_QR_UI.STATS_TITLE}
              </h3>
              {statsQuery.isPending ? (
                <p className="seller-qr-sheet__stats-text">
                  {SELLER_QR_UI.STATS_LOADING}
                </p>
              ) : statsQuery.isError ? (
                <p className="seller-qr-sheet__error" role="alert">
                  {statsQuery.error instanceof Error
                    ? statsQuery.error.message
                    : SELLER_QR_UI.STATS_FALLBACK}
                </p>
              ) : stats.total === 0 ? (
                <p className="seller-qr-sheet__stats-text">
                  {SELLER_QR_UI.STATS_EMPTY}
                </p>
              ) : (
                <>
                  <p className="seller-qr-sheet__stats-value">
                    {SELLER_QR_UI.STATS_TOTAL(stats.total)}
                  </p>
                  <p className="seller-qr-sheet__stats-text">
                    {SELLER_QR_UI.STATS_RECENT(stats.recent, stats.recentDays)}
                  </p>
                </>
              )}
              <p className="seller-qr-sheet__stats-note">{SELLER_QR_UI.STATS_NOTE}</p>
            </section>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
