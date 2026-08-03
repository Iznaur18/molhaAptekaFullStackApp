import { useEffect, useState } from "react";

import {
  PRODUCT_CARD_UI,
  PRODUCT_MODERATION_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./ProductModerationDetailsFooter.css";

/**
 * @param {{
 *   rejectComment: string;
 *   onRejectCommentChange: (value: string) => void;
 *   onApprove: () => void;
 *   onReject: () => void;
 *   onDelete?: () => void | Promise<void>;
 *   canDelete?: boolean;
 *   hasOpenSales?: boolean;
 *   isBusy?: boolean;
 *   errorMessage?: string;
 * }} props
 */
export function ProductModerationDetailsFooter({
  rejectComment,
  onRejectCommentChange,
  onApprove,
  onReject,
  onDelete,
  canDelete = false,
  hasOpenSales = false,
  isBusy = false,
  errorMessage = "",
}) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setIsDeleteConfirmOpen(false);
  }, [onDelete]);

  return (
    <div className="product-moderation-details-footer">
      {errorMessage ? (
        <p className="product-moderation-details-footer__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <label className="product-moderation-details-footer__reject-label">
        {PRODUCT_MODERATION_PAGE_UI.REJECT_COMMENT_LABEL}
        <textarea
          className="product-moderation-details-footer__reject-input"
          rows={3}
          value={rejectComment}
          disabled={isBusy || isDeleteConfirmOpen}
          placeholder={PRODUCT_MODERATION_PAGE_UI.REJECT_COMMENT_PLACEHOLDER}
          onChange={(event) => onRejectCommentChange(event.target.value)}
        />
      </label>
      <div className="product-moderation-details-footer__actions">
        <button
          type="button"
          className="app-btn app-btn--success"
          disabled={isBusy || isDeleteConfirmOpen}
          onClick={onApprove}
        >
          {isBusy
            ? PRODUCT_MODERATION_PAGE_UI.ACTION_PENDING
            : PRODUCT_MODERATION_PAGE_UI.APPROVE}
        </button>
        <button
          type="button"
          className="app-btn app-btn--outline"
          disabled={isBusy || isDeleteConfirmOpen}
          onClick={onReject}
        >
          {PRODUCT_MODERATION_PAGE_UI.REJECT}
        </button>
        {canDelete && typeof onDelete === "function" ? (
          hasOpenSales ? (
            <p className="product-moderation-details-footer__open-sales-hint">
              {PRODUCT_CARD_UI.OPEN_SALES_LOCKED_HINT}
            </p>
          ) : isDeleteConfirmOpen ? (
            <>
              <p className="product-moderation-details-footer__delete-confirm-question">
                {PRODUCT_CARD_UI.DELETE_CONFIRM_QUESTION}
              </p>
              <button
                type="button"
                className="app-btn app-btn--danger"
                disabled={isBusy}
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  void onDelete();
                }}
              >
                {PRODUCT_CARD_UI.DELETE_CONFIRM_YES}
              </button>
              <button
                type="button"
                className="app-btn app-btn--secondary"
                disabled={isBusy}
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                {PRODUCT_CARD_UI.DELETE_CONFIRM_CANCEL}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="app-btn app-btn--danger product-moderation-details-footer__btn--wide"
              disabled={isBusy}
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              {PRODUCT_CARD_UI.DELETE_PRODUCT}
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
