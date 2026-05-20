import { PRODUCT_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductModerationDetailsFooter.css";

/**
 * @param {{
 *   rejectComment: string;
 *   onRejectCommentChange: (value: string) => void;
 *   onApprove: () => void;
 *   onReject: () => void;
 *   isBusy?: boolean;
 *   errorMessage?: string;
 * }} props
 */
export function ProductModerationDetailsFooter({
  rejectComment,
  onRejectCommentChange,
  onApprove,
  onReject,
  isBusy = false,
  errorMessage = "",
}) {
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
          disabled={isBusy}
          placeholder={PRODUCT_MODERATION_PAGE_UI.REJECT_COMMENT_PLACEHOLDER}
          onChange={(event) => onRejectCommentChange(event.target.value)}
        />
      </label>
      <div className="product-moderation-details-footer__actions">
        <button
          type="button"
          className="product-moderation-details-footer__btn product-moderation-details-footer__btn_approve"
          disabled={isBusy}
          onClick={onApprove}
        >
          {isBusy
            ? PRODUCT_MODERATION_PAGE_UI.ACTION_PENDING
            : PRODUCT_MODERATION_PAGE_UI.APPROVE}
        </button>
        <button
          type="button"
          className="product-moderation-details-footer__btn product-moderation-details-footer__btn_reject"
          disabled={isBusy}
          onClick={onReject}
        >
          {PRODUCT_MODERATION_PAGE_UI.REJECT}
        </button>
      </div>
    </div>
  );
}
