import { useEffect, useRef, useState } from "react";
import { USER_SAVED_ADDRESSES_MAX, USER_SAVED_ADDRESS_LABEL_MAX_LENGTH } from "@molha/api-contract";

import { AddressDeliveryFields } from "./AddressDeliveryFields.jsx";
import { createUserSavedAddressId } from "../lib/createUserSavedAddressId.js";
import { createEmptyUserSavedAddressDraft } from "../lib/userSavedAddressesFromUser.js";
import { ensureSingleDefaultUserSavedAddress } from "../lib/ensureSingleDefaultUserSavedAddress.js";
import { validateUserSavedAddressDraft } from "../lib/validateUserSavedAddressesForm.js";
import {
  ADDRESS_DELIVERY_UI,
  ADDRESS_STRUCTURED_UI,
  USER_SAVED_ADDRESSES_UI,
} from "../../../shared/config/appUiCopy.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";

import "./UserSavedAddressesEditor.css";

/**
 * @param {{
 *   value: import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue[];
 *   onChange: (next: import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue[]) => void;
 *   onDefaultRegionCodeChange?: (regionCode: string | null) => void;
 *   disabled?: boolean;
 *   lineInputClassName?: string;
 *   elementId?: string;
 *   onEditingChange?: (isEditing: boolean) => void;
 * }} props
 */
export function UserSavedAddressesEditor({
  value,
  onChange,
  onDefaultRegionCodeChange,
  disabled = false,
  lineInputClassName = "",
  elementId = "edit-profile-address",
  onEditingChange,
}) {
  const [editingId, setEditingId] = useState(/** @type {string | null} */ (null));
  const [draft, setDraft] = useState(createEmptyUserSavedAddressDraft);
  const [draftError, setDraftError] = useState("");
  const editorRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  useEffect(() => {
    onEditingChange?.(Boolean(editingId));
  }, [editingId, onEditingChange]);

  useEffect(() => {
    if (!editingId || !editorRef.current) {
      return undefined;
    }
    editorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return undefined;
  }, [editingId]);

  const addresses = Array.isArray(value) ? value : [];

  const closeEditor = () => {
    setEditingId(null);
    setDraft(createEmptyUserSavedAddressDraft());
    setDraftError("");
  };

  const startAdd = () => {
    if (disabled || addresses.length >= USER_SAVED_ADDRESSES_MAX) {
      return;
    }
    setEditingId("new");
    setDraft(createEmptyUserSavedAddressDraft());
    setDraftError("");
  };

  /**
   * @param {string} id
   */
  const startEdit = (id) => {
    if (disabled) {
      return;
    }
    const current = addresses.find((item) => item.id === id);
    if (!current) {
      return;
    }
    setEditingId(id);
    setDraft({ ...current });
    setDraftError("");
  };

  const commitDraft = () => {
    const error = validateUserSavedAddressDraft(draft);
    if (error) {
      setDraftError(error);
      return;
    }

    const nextItem = {
      ...draft,
      id: editingId === "new" ? createUserSavedAddressId() : draft.id,
      label: String(draft.label ?? "").trim(),
      flat: String(draft.flat ?? "").trim(),
      isDefault: editingId === "new" ? addresses.length === 0 : draft.isDefault,
    };

    const nextList =
      editingId === "new"
        ? [...addresses, nextItem]
        : addresses.map((item) => (item.id === editingId ? nextItem : item));

    const normalized = ensureSingleDefaultUserSavedAddress(nextList);
    onChange(normalized);
    syncDefaultRegion(normalized);
    closeEditor();
  };

  /**
   * @param {import('../model/userSavedAddressTypes.js').UserSavedAddressFormValue[]} nextList
   */
  const syncDefaultRegion = (nextList) => {
    const defaultAddress = nextList.find((item) => item.isDefault) ?? null;
    onDefaultRegionCodeChange?.(defaultAddress?.regionCode ?? null);
  };

  /**
   * @param {string} id
   */
  const setDefault = (id) => {
    if (disabled) {
      return;
    }
    const nextList = addresses.map((item) => ({
      ...item,
      isDefault: item.id === id,
    }));
    onChange(nextList);
    syncDefaultRegion(nextList);
  };

  /**
   * @param {string} id
   */
  const removeAddress = (id) => {
    if (disabled) {
      return;
    }
    if (!window.confirm(USER_SAVED_ADDRESSES_UI.REMOVE_CONFIRM)) {
      return;
    }

    const nextList = addresses.filter((item) => item.id !== id);
    const normalized = ensureSingleDefaultUserSavedAddress(nextList);
    onChange(normalized);
    syncDefaultRegion(normalized);

    if (editingId === id) {
      closeEditor();
    }
  };

  const handleDraftAddressChange = (nextAddress) => {
    setDraft((prev) => ({ ...prev, ...nextAddress }));
    setDraftError("");
  };

  return (
    <div className="user-saved-addresses" id={elementId}>
      <FormFieldLabel>{USER_SAVED_ADDRESSES_UI.SECTION_LABEL}</FormFieldLabel>

      {addresses.length === 0 ? (
        <p className="user-saved-addresses__empty">{USER_SAVED_ADDRESSES_UI.EMPTY}</p>
      ) : (
        <ul className="user-saved-addresses__list">
          {addresses.map((item) => (
            <li key={item.id} className="user-saved-addresses__card">
              <label className="user-saved-addresses__default">
                <input
                  type="radio"
                  name="user-default-address"
                  checked={item.isDefault}
                  disabled={disabled}
                  onChange={() => setDefault(item.id)}
                />
                <span>{USER_SAVED_ADDRESSES_UI.LABEL_DEFAULT}</span>
              </label>

              {item.label ? (
                <p className="user-saved-addresses__label">{item.label}</p>
              ) : null}

              <p className="user-saved-addresses__line">
                {USER_SAVED_ADDRESSES_UI.FORMAT_LINE(item.line, item.flat)}
              </p>

              <div className="user-saved-addresses__actions">
                <button
                  type="button"
                  className="user-saved-addresses__action user-saved-addresses__action_danger"
                  disabled={disabled}
                  onClick={() => removeAddress(item.id)}
                >
                  {USER_SAVED_ADDRESSES_UI.REMOVE}
                </button>
                <button
                  type="button"
                  className="user-saved-addresses__action user-saved-addresses__action_edit"
                  disabled={disabled}
                  onClick={() => startEdit(item.id)}
                >
                  {USER_SAVED_ADDRESSES_UI.EDIT}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingId ? (
        <div ref={editorRef} className="user-saved-addresses__editor">
          <label className="user-saved-addresses__field">
            <FormFieldLabel>{USER_SAVED_ADDRESSES_UI.LABEL_NAME}</FormFieldLabel>
            <input
              type="text"
              className={lineInputClassName}
              value={draft.label}
              maxLength={USER_SAVED_ADDRESS_LABEL_MAX_LENGTH}
              placeholder={USER_SAVED_ADDRESSES_UI.PLACEHOLDER_NAME}
              disabled={disabled}
              onChange={(event) => {
                setDraft((prev) => ({ ...prev, label: event.target.value }));
                setDraftError("");
              }}
            />
          </label>

          <AddressDeliveryFields
            value={draft}
            onChange={handleDraftAddressChange}
            disabled={disabled}
            displayOnly
            rootId={`${elementId}-editor`}
            lineInputClassName={lineInputClassName}
            labels={{ line: ADDRESS_STRUCTURED_UI.SECTION_LABEL }}
          />

          <label className="user-saved-addresses__field">
            <FormFieldLabel>{ADDRESS_DELIVERY_UI.LABEL_FLAT}</FormFieldLabel>
            <input
              type="text"
              className={lineInputClassName}
              value={draft.flat}
              disabled={disabled}
              autoComplete="address-line2"
              placeholder={ADDRESS_STRUCTURED_UI.PLACEHOLDER_FLAT}
              onChange={(event) => {
                setDraft((prev) => ({ ...prev, flat: event.target.value }));
                setDraftError("");
              }}
            />
          </label>

          {draftError ? (
            <p className="user-saved-addresses__error" role="alert">
              {draftError}
            </p>
          ) : null}

          <div className="user-saved-addresses__editor-actions">
            <button
              type="button"
              className="user-saved-addresses__save"
              disabled={disabled}
              onClick={commitDraft}
            >
              {USER_SAVED_ADDRESSES_UI.SAVE}
            </button>
            <button
              type="button"
              className="user-saved-addresses__cancel"
              disabled={disabled}
              onClick={closeEditor}
            >
              {USER_SAVED_ADDRESSES_UI.CANCEL}
            </button>
          </div>
        </div>
      ) : null}

      {!editingId && addresses.length < USER_SAVED_ADDRESSES_MAX ? (
        <button
          type="button"
          className="user-saved-addresses__add"
          disabled={disabled}
          onClick={startAdd}
        >
          {USER_SAVED_ADDRESSES_UI.ADD}
        </button>
      ) : null}
    </div>
  );
}
