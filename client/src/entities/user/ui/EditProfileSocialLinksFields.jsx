import {
  USER_SOCIAL_LINK_FIELDS,
  USER_SOCIAL_LINK_URL_MAX_LENGTH,
} from "@molha/api-contract";

import { EDIT_PROFILE_MODAL_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   form: Record<string, string>;
 *   onChange: (event: import('react').ChangeEvent<HTMLInputElement>) => void;
 *   onClear: (fieldId: string) => void;
 *   disabled?: boolean;
 * }} props
 */
export function EditProfileSocialLinksFields({
  form,
  onChange,
  onClear,
  disabled = false,
}) {
  return (
    <fieldset className="edit-profile-modal__fieldset">
      <legend className="edit-profile-modal__legend">
        {EDIT_PROFILE_MODAL_UI.SECTION_SOCIAL}
      </legend>
      {USER_SOCIAL_LINK_FIELDS.map((field) => {
        const value = String(form[field.id] ?? "");
        return (
          <label key={field.id} className="edit-profile-modal__label">
            {field.labelRu}
            <span className="edit-profile-modal__social-row">
              <input
                className="edit-profile-modal__input"
                type="url"
                name={field.id}
                value={value}
                onChange={onChange}
                placeholder={EDIT_PROFILE_MODAL_UI.PLACEHOLDER_HTTPS}
                maxLength={USER_SOCIAL_LINK_URL_MAX_LENGTH}
                disabled={disabled}
                autoComplete="off"
              />
              {value.trim() !== "" ? (
                <button
                  type="button"
                  className="edit-profile-modal__social-clear"
                  onClick={() => onClear(field.id)}
                  disabled={disabled}
                  aria-label={EDIT_PROFILE_MODAL_UI.CLEAR_SOCIAL_LINK(field.labelRu)}
                >
                  {EDIT_PROFILE_MODAL_UI.CLEAR_FIELD}
                </button>
              ) : null}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
