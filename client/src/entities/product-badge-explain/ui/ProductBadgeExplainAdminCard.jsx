import { useEffect, useState } from "react";

import { PRODUCT_BADGE_EXPLAIN_DESCRIPTION_MAX_LENGTH } from "@izibuy/shared-lib";

import { PRODUCT_BADGE_EXPLAIN_ADMIN_UI } from "../../../shared/config/appUiCopy.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";
import { useProductBadgeExplainMutations } from "../model/useProductBadgeExplainMutations.js";

import "./ProductBadgeExplainAdminCard.css";

/**
 * @param {{
 *   badgeKey: string;
 *   title: string;
 *   hint: string;
 *   imageUrl?: string | null;
 *   description?: string | null;
 *   disabled?: boolean;
 * }} props
 */
export function ProductBadgeExplainAdminCard({
  badgeKey,
  title,
  hint,
  imageUrl = null,
  description = null,
  disabled = false,
}) {
  const { patchBadgeMutation } = useProductBadgeExplainMutations();
  const [draftImageUrl, setDraftImageUrl] = useState(imageUrl ?? "");
  const [draftDescription, setDraftDescription] = useState(description ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);
  const isSaving = patchBadgeMutation.isPending;

  useEffect(() => {
    setDraftImageUrl(imageUrl ?? "");
    setDraftDescription(description ?? "");
    setErrorMessage("");
    setSavedNotice(false);
  }, [imageUrl, description, badgeKey]);

  const handleSave = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const trimmedImage = draftImageUrl.trim();
    const trimmedDescription = draftDescription.trim();
    const hadImage = Boolean(imageUrl && String(imageUrl).trim());
    const hadDescription = Boolean(description && String(description).trim());

    try {
      setErrorMessage("");
      setSavedNotice(false);
      const display = await patchBadgeMutation.mutateAsync({
        badgeKey,
        body: {
          imageUrl: trimmedImage || null,
          resetImageUrl: trimmedImage === "" && hadImage,
          description: trimmedDescription || null,
          resetDescription: trimmedDescription === "" && hadDescription,
        },
      });
      setDraftImageUrl(display.imageUrl ?? "");
      setDraftDescription(display.description ?? "");
      setSavedNotice(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : PRODUCT_BADGE_EXPLAIN_ADMIN_UI.SAVE_ERROR,
      );
    }
  };

  const handleResetImage = async () => {
    if (!imageUrl) {
      setDraftImageUrl("");
      return;
    }

    try {
      setErrorMessage("");
      setSavedNotice(false);
      const display = await patchBadgeMutation.mutateAsync({
        badgeKey,
        body: { resetImageUrl: true },
      });
      setDraftImageUrl("");
      setDraftDescription(display.description ?? draftDescription);
      setSavedNotice(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : PRODUCT_BADGE_EXPLAIN_ADMIN_UI.SAVE_ERROR,
      );
    }
  };

  return (
    <article className="product-badge-explain-admin-card">
      <header className="product-badge-explain-admin-card__head">
        <h3 className="product-badge-explain-admin-card__title">{title}</h3>
        <p className="product-badge-explain-admin-card__hint">{hint}</p>
      </header>
      <form
        className="product-badge-explain-admin-card__form"
        onSubmit={handleSave}
      >
        <ImageUrlField
          label={PRODUCT_BADGE_EXPLAIN_ADMIN_UI.LABEL_IMAGE}
          value={draftImageUrl}
          disabled={disabled || isSaving}
          onChange={setDraftImageUrl}
        />
        <label className="product-badge-explain-admin-card__field">
          <span className="product-badge-explain-admin-card__label">
            {PRODUCT_BADGE_EXPLAIN_ADMIN_UI.LABEL_DESCRIPTION}
          </span>
          <textarea
            className="product-badge-explain-admin-card__textarea"
            value={draftDescription}
            disabled={disabled || isSaving}
            maxLength={PRODUCT_BADGE_EXPLAIN_DESCRIPTION_MAX_LENGTH}
            rows={4}
            placeholder={PRODUCT_BADGE_EXPLAIN_ADMIN_UI.DESCRIPTION_PLACEHOLDER}
            onChange={(event) => setDraftDescription(event.target.value)}
          />
        </label>
        {errorMessage ? (
          <p className="product-badge-explain-admin-card__error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {savedNotice ? (
          <p className="product-badge-explain-admin-card__notice" role="status">
            {PRODUCT_BADGE_EXPLAIN_ADMIN_UI.SAVED}
          </p>
        ) : null}
        <div className="product-badge-explain-admin-card__actions">
          <button
            type="submit"
            className="product-badge-explain-admin-card__btn product-badge-explain-admin-card__btn_primary"
            disabled={disabled || isSaving}
          >
            {isSaving
              ? PRODUCT_BADGE_EXPLAIN_ADMIN_UI.SAVING
              : PRODUCT_BADGE_EXPLAIN_ADMIN_UI.SAVE}
          </button>
          <button
            type="button"
            className="product-badge-explain-admin-card__btn product-badge-explain-admin-card__btn_secondary"
            disabled={disabled || isSaving || (!imageUrl && !draftImageUrl.trim())}
            onClick={() => void handleResetImage()}
          >
            {PRODUCT_BADGE_EXPLAIN_ADMIN_UI.RESET_IMAGE}
          </button>
        </div>
      </form>
    </article>
  );
}
