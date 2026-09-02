import { useEffect, useState } from "react";

import { useFaqItemLinkMutations } from "../../../entities/faq-item-link/model/useFaqItemLinkMutations.js";
import { FAQ_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   itemId: string;
 *   href: string | null | undefined;
 * }} props
 */
export function FaqItemLinkAdminField({ itemId, href }) {
  const { patchLinkMutation } = useFaqItemLinkMutations();
  const [draft, setDraft] = useState(href ?? "");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(href ?? "");
  }, [href, itemId]);

  const isSaving = patchLinkMutation.isPending;

  const handleSave = async (event) => {
    event.preventDefault();
    setNotice("");
    setError("");

    try {
      await patchLinkMutation.mutateAsync({
        itemId,
        body: { href: draft.trim() === "" ? null : draft.trim() },
      });
      setNotice(
        draft.trim() === "" ? FAQ_UI.ADMIN_LINK_CLEARED : FAQ_UI.ADMIN_LINK_SAVED,
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : FAQ_UI.ADMIN_LINK_SAVE,
      );
    }
  };

  const handleClear = async () => {
    setNotice("");
    setError("");

    try {
      await patchLinkMutation.mutateAsync({
        itemId,
        body: { resetHref: true },
      });
      setDraft("");
      setNotice(FAQ_UI.ADMIN_LINK_CLEARED);
    } catch (clearError) {
      setError(
        clearError instanceof Error ? clearError.message : FAQ_UI.ADMIN_LINK_CLEAR,
      );
    }
  };

  return (
    <form className="faq-page__link-admin" onSubmit={handleSave}>
      <label className="faq-page__link-admin-label" htmlFor={`faq-link-${itemId}`}>
        {FAQ_UI.ADMIN_LINK_LABEL}
      </label>
      <p className="faq-page__link-admin-hint">{FAQ_UI.ADMIN_LINK_HINT}</p>
      <input
        id={`faq-link-${itemId}`}
        className="faq-page__link-admin-input"
        type="text"
        inputMode="url"
        autoComplete="url"
        value={draft}
        placeholder={FAQ_UI.ADMIN_LINK_PLACEHOLDER}
        disabled={isSaving}
        onChange={(event) => setDraft(event.target.value)}
      />
      {error ? (
        <p className="faq-page__link-admin-error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="faq-page__link-admin-notice" role="status">
          {notice}
        </p>
      ) : null}
      <div className="faq-page__link-admin-actions">
        <button type="submit" className="faq-page__link-admin-save" disabled={isSaving}>
          {isSaving ? FAQ_UI.ADMIN_LINK_SAVING : FAQ_UI.ADMIN_LINK_SAVE}
        </button>
        {href ? (
          <button
            type="button"
            className="faq-page__link-admin-clear"
            disabled={isSaving}
            onClick={() => void handleClear()}
          >
            {FAQ_UI.ADMIN_LINK_CLEAR}
          </button>
        ) : null}
      </div>
    </form>
  );
}
