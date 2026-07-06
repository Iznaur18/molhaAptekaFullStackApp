import { useEffect, useState } from "react";

import { ProductManageToggleRow } from "../../product/ui/ProductManageToggleRow.jsx";
import { useProductManageToggleDisplayMutations } from "../model/useProductManageToggleDisplayMutations.js";
import { PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI } from "../../../shared/config/appUiCopy.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";

import "./ProductManageToggleAdminCard.css";

/**
 * @param {{
 *   toggleKey: string;
 *   variant: import("@izibuy/shared-lib").ProductManageToggleRowVariant;
 *   title: string;
 *   description: string;
 *   checked?: boolean;
 *   imageUrl?: string | null;
 *   disabled?: boolean;
 *   onSaved?: (display: import("../model/types.js").ProductManageToggleDisplayFromApi) => void;
 * }} props
 */
export function ProductManageToggleAdminCard({
  toggleKey,
  variant,
  title,
  description,
  checked = true,
  imageUrl = null,
  disabled = false,
  onSaved,
}) {
  const { patchToggleMutation } = useProductManageToggleDisplayMutations();
  const [draftImageUrl, setDraftImageUrl] = useState(imageUrl ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);
  const isSaving = patchToggleMutation.isPending;

  useEffect(() => {
    setDraftImageUrl(imageUrl ?? "");
    setErrorMessage("");
    setSavedNotice(false);
  }, [imageUrl, toggleKey]);

  const handleSave = async (event) => {
    event.preventDefault();
    const trimmed = draftImageUrl.trim();
    const hadImage = Boolean(imageUrl && String(imageUrl).trim());

    try {
      setErrorMessage("");
      setSavedNotice(false);
      const { display } = await patchToggleMutation.mutateAsync({
        toggleKey,
        body: {
          imageUrl: trimmed || null,
          resetImageUrl: trimmed === "" && hadImage,
        },
      });
      setDraftImageUrl(display.imageUrl ?? "");
      setSavedNotice(true);
      onSaved?.(display);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.SAVE_ERROR,
      );
    }
  };

  const handleReset = async () => {
    if (!imageUrl) {
      setDraftImageUrl("");
      return;
    }

    try {
      setErrorMessage("");
      setSavedNotice(false);
      const { display } = await patchToggleMutation.mutateAsync({
        toggleKey,
        body: { resetImageUrl: true },
      });
      setDraftImageUrl("");
      setSavedNotice(true);
      onSaved?.(display);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.SAVE_ERROR,
      );
    }
  };

  return (
    <article className="product-manage-toggle-admin-card">
      <div className="product-manage-toggle-admin-card__preview" aria-hidden="true">
        <ProductManageToggleRow
          title={title}
          description={description}
          checked={checked}
          variant={variant}
          imageUrl={draftImageUrl.trim() || imageUrl}
          disabled
        />
      </div>
      <form className="product-manage-toggle-admin-card__form" onSubmit={handleSave}>
        <ImageUrlField
          label={PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.LABEL_IMAGE}
          value={draftImageUrl}
          disabled={disabled || isSaving}
          onChange={setDraftImageUrl}
        />
        {errorMessage ? (
          <p className="product-manage-toggle-admin-card__error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {savedNotice ? (
          <p className="product-manage-toggle-admin-card__notice" role="status">
            {PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.SAVED}
          </p>
        ) : null}
        <div className="product-manage-toggle-admin-card__actions">
          <button
            type="submit"
            className="product-manage-toggle-admin-card__btn product-manage-toggle-admin-card__btn_primary"
            disabled={disabled || isSaving}
          >
            {isSaving
              ? PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.SAVING
              : PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.SAVE}
          </button>
          <button
            type="button"
            className="product-manage-toggle-admin-card__btn product-manage-toggle-admin-card__btn_secondary"
            disabled={disabled || isSaving || (!imageUrl && !draftImageUrl.trim())}
            onClick={() => void handleReset()}
          >
            {PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.RESET_IMAGE}
          </button>
        </div>
      </form>
    </article>
  );
}
