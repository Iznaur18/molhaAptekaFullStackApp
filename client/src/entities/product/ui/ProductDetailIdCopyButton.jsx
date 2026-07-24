import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { copyTextToClipboard } from "../../../shared/lib/copyTextToClipboard.js";
import { AppIcon } from "../../../shared/ui/icon/AppIcon.jsx";

import "./ProductDetailIdCopyButton.css";

const COPY_FEEDBACK_MS = 2000;

/**
 * @param {{ productId: string }} props
 */
export function ProductDetailIdCopyButton({ productId }) {
  const [isCopied, setIsCopied] = useState(false);
  const feedbackTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current != null) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    try {
      await copyTextToClipboard(productId);
      setIsCopied(true);
      if (feedbackTimerRef.current != null) {
        clearTimeout(feedbackTimerRef.current);
      }
      feedbackTimerRef.current = setTimeout(() => {
        setIsCopied(false);
        feedbackTimerRef.current = null;
      }, COPY_FEEDBACK_MS);
    } catch {
      window.alert(PRODUCT_DETAILS_MODAL_UI.COPY_ID_FAILED);
    }
  };

  return (
    <button
      type="button"
      className="product-detail-id-copy-button"
      onClick={() => {
        void handleClick();
      }}
      aria-label={
        isCopied
          ? PRODUCT_DETAILS_MODAL_UI.COPY_ID_DONE_ARIA
          : PRODUCT_DETAILS_MODAL_UI.COPY_ID_ARIA
      }
    >
      <AppIcon
        icon={isCopied ? Check : Copy}
        size="sm"
        className={
          isCopied
            ? "product-detail-id-copy-button__icon product-detail-id-copy-button__icon--done"
            : "product-detail-id-copy-button__icon"
        }
      />
    </button>
  );
}
