import {
  USER_SOCIAL_LINK_FIELDS,
  USER_SOCIAL_LINK_HANDLE_MAX_LENGTH,
  USER_SOCIAL_LINK_URL_MAX_LENGTH,
} from "@molha/api-contract";

import { EDIT_PROFILE_MODAL_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   form: Record<string, string>;
 *   onChange: (event: import('react').ChangeEvent<HTMLInputElement>) => void;
 *   onClear: (fieldId: string) => void;
 *   disabled?: boolean;
 *   hideLegend?: boolean;
 * }} props
 */
export function EditProfileSocialLinksFields({
  form,
  onChange,
  onClear,
  disabled = false,
  hideLegend = false,
}) {
  const fields = USER_SOCIAL_LINK_FIELDS.map((field) => {
    const value = String(form[field.id] ?? "");
    const isWebsite = field.id === "socialWebsiteUrl";
    return (
      <label key={field.id} className="edit-profile-modal__label">
        {field.labelRu}
        <span className="edit-profile-modal__social-row">
          <input
            className="edit-profile-modal__input"
            type="text"
            name={field.id}
            value={value}
            onChange={onChange}
            placeholder={field.placeholderRu}
            maxLength={
              isWebsite
                ? USER_SOCIAL_LINK_URL_MAX_LENGTH
                : USER_SOCIAL_LINK_HANDLE_MAX_LENGTH
            }
            disabled={disabled}
            autoComplete="off"
            inputMode={field.id === "socialWhatsappUrl" ? "tel" : "text"}
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
  });

  if (hideLegend) {
    return fields;
  }

  return (
    <fieldset className="edit-profile-modal__fieldset">
      <legend className="edit-profile-modal__legend">
        {EDIT_PROFILE_MODAL_UI.SECTION_SOCIAL}
      </legend>
      {fields}
    </fieldset>
  );
}
