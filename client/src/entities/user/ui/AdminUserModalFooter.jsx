import { ADMIN_EDIT_USER_UI } from "../../../shared/config/appUiCopy.js";

import "./AdminUserModalFooter.css";

/**
 * @param {{
 *   onEditClick: () => void;
 *   onDeleteClick: () => void;
 *   children?: import('react').ReactNode;
 * }} props
 */
export function AdminUserModalFooter({
  onEditClick,
  onDeleteClick,
  children = null,
}) {
  return (
    <div className="admin-user-modal-footer">
      <div className="admin-user-modal-footer__admin">
        <button
          type="button"
          className="admin-user-modal-footer__btn admin-user-modal-footer__btn_edit"
          onClick={onEditClick}
        >
          {ADMIN_EDIT_USER_UI.EDIT_BUTTON}
        </button>
        <button
          type="button"
          className="admin-user-modal-footer__btn admin-user-modal-footer__btn_delete"
          onClick={onDeleteClick}
        >
          {ADMIN_EDIT_USER_UI.DELETE_BUTTON}
        </button>
      </div>
      {children}
    </div>
  );
}
