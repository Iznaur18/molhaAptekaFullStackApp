import { RAFFLE_MANAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./RaffleManageActions.css";

/**
 * @param {{
 *   showEdit?: boolean;
 *   showDelete?: boolean;
 *   showPause?: boolean;
 *   onEdit?: () => void;
 *   onDelete?: () => void;
 *   onPause?: () => void;
 *   busy?: boolean;
 *   className?: string;
 * }} props
 */
export function RaffleManageActions({
  showEdit = false,
  showDelete = false,
  showPause = false,
  onEdit,
  onDelete,
  onPause,
  busy = false,
  className = "",
}) {
  if (!showEdit && !showDelete && !showPause) {
    return null;
  }

  const rootClass = ["raffle-manage-actions", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} role="group" aria-label={RAFFLE_MANAGE_UI.GROUP_LABEL}>
      {showEdit && onEdit ? (
        <button
          type="button"
          className="raffle-manage-actions__btn raffle-manage-actions__btn_edit"
          disabled={busy}
          onClick={onEdit}
        >
          {RAFFLE_MANAGE_UI.EDIT}
        </button>
      ) : null}
      {showDelete && onDelete ? (
        <button
          type="button"
          className="raffle-manage-actions__btn raffle-manage-actions__btn_delete"
          disabled={busy}
          onClick={onDelete}
        >
          {RAFFLE_MANAGE_UI.DELETE}
        </button>
      ) : null}
      {showPause && onPause ? (
        <button
          type="button"
          className="raffle-manage-actions__btn raffle-manage-actions__btn_pause"
          disabled={busy}
          onClick={onPause}
        >
          {RAFFLE_MANAGE_UI.PAUSE}
        </button>
      ) : null}
    </div>
  );
}
