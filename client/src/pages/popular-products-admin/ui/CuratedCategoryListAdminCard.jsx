import { useCallback, useState } from "react";
import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";

import { resolveCuratedAddCategoryBlockReason } from "../../../entities/curated-category-list/lib/resolveCuratedAddCategoryBlockReason.js";
import { useCuratedListCategoryAddPreview } from "../../../entities/curated-category-list/model/useCuratedListCategoryAddPreview.js";
import { RuRegionSelect } from "../../../entities/region/ui/RuRegionSelect.jsx";
import { POPULAR_CATEGORIES_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import { CuratedCategoryAddPicker } from "./CuratedCategoryAddPicker.jsx";
import "./CuratedCategoryListAdminCard.css";

/**
 * @param {{
 *   list: import('../../../entities/curated-category-list/model/types.js').CuratedCategoryListFromApi;
 *   isFirst: boolean;
 *   isLast: boolean;
 *   isBusy: boolean;
 *   onMoveUp: () => void;
 *   onMoveDown: () => void;
 *   onDeleteList: () => void;
 *   onSaveList: (payload: { title: string; regionCode: string }) => Promise<void>;
 *   onAddCategory: (payload: { kind: "tree" | "personal"; refId: string }) => Promise<void>;
 *   onRemoveCategory: (itemKey: string) => Promise<void>;
 * }} props
 */
export function CuratedCategoryListAdminCard({
  list,
  isFirst,
  isLast,
  isBusy,
  onMoveUp,
  onMoveDown,
  onDeleteList,
  onSaveList,
  onAddCategory,
  onRemoveCategory,
}) {
  const [titleDraft, setTitleDraft] = useState(list.title);
  const [regionDraft, setRegionDraft] = useState(
    list.regionCode || DEFAULT_VIEWER_REGION_CODE,
  );
  const [kindDraft, setKindDraft] = useState(/** @type {"tree" | "personal"} */ ("tree"));
  const [refIdDraft, setRefIdDraft] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [localError, setLocalError] = useState("");
  const {
    preview,
    isLoading: isPreviewLoading,
    error: previewError,
  } = useCuratedListCategoryAddPreview(kindDraft, refIdDraft);

  const listRegionCode = list.regionCode || DEFAULT_VIEWER_REGION_CODE;
  const regionBlockReason = resolveCuratedAddCategoryBlockReason({
    preview,
    listRegionCode,
  });
  const canAddCategory =
    Boolean(preview) &&
    !isPreviewLoading &&
    !previewError &&
    regionBlockReason == null;

  const handleSaveList = useCallback(async () => {
    setLocalError("");
    if (!regionDraft) {
      setLocalError(POPULAR_CATEGORIES_ADMIN_PAGE_UI.REGION_REQUIRED);
      return;
    }
    try {
      await onSaveList({ title: titleDraft, regionCode: regionDraft });
    } catch (e) {
      setLocalError(
        e instanceof Error ? e.message : POPULAR_CATEGORIES_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    }
  }, [onSaveList, regionDraft, titleDraft]);

  const handleSelectCategory = useCallback(
    ({ kind, refId, label }) => {
      setKindDraft(kind);
      setRefIdDraft(refId);
      setSelectedLabel(label);
      setLocalError("");
    },
    [],
  );

  const handleAddCategory = useCallback(async () => {
    setLocalError("");
    const refId = refIdDraft.trim();
    if (!refId) {
      setLocalError(POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_REQUIRED);
      return;
    }
    if (!canAddCategory) {
      if (typeof regionBlockReason === "string" && regionBlockReason !== "catalog") {
        setLocalError(regionBlockReason);
      } else if (regionBlockReason === "catalog") {
        setLocalError(POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_NOT_VISIBLE);
      } else if (previewError) {
        setLocalError(previewError);
      }
      return;
    }

    try {
      await onAddCategory({ kind: kindDraft, refId });
      setRefIdDraft("");
      setSelectedLabel("");
    } catch (e) {
      setLocalError(
        e instanceof Error ? e.message : POPULAR_CATEGORIES_ADMIN_PAGE_UI.ADD_ITEM_ERROR,
      );
    }
  }, [
    canAddCategory,
    kindDraft,
    onAddCategory,
    previewError,
    refIdDraft,
    regionBlockReason,
  ]);

  const handleRemoveCategory = useCallback(
    async (itemKey) => {
      setLocalError("");
      try {
        await onRemoveCategory(itemKey);
      } catch (e) {
        setLocalError(
          e instanceof Error
            ? e.message
            : POPULAR_CATEGORIES_ADMIN_PAGE_UI.REMOVE_ITEM_ERROR,
        );
      }
    },
    [onRemoveCategory],
  );

  return (
    <article className="curated-list-admin-card">
      <header className="curated-list-admin-card__header">
        <div className="curated-list-admin-card__order">
          <button
            type="button"
            className="app-btn app-btn--secondary app-btn--icon"
            onClick={onMoveUp}
            disabled={isBusy || isFirst}
            aria-label={POPULAR_CATEGORIES_ADMIN_PAGE_UI.MOVE_UP_ARIA}
          >
            ↑
          </button>
          <button
            type="button"
            className="app-btn app-btn--secondary app-btn--icon"
            onClick={onMoveDown}
            disabled={isBusy || isLast}
            aria-label={POPULAR_CATEGORIES_ADMIN_PAGE_UI.MOVE_DOWN_ARIA}
          >
            ↓
          </button>
        </div>
        <button
          type="button"
          className="app-btn app-btn--danger"
          onClick={onDeleteList}
          disabled={isBusy}
        >
          {POPULAR_CATEGORIES_ADMIN_PAGE_UI.DELETE_LIST}
        </button>
      </header>

      <label className="curated-list-admin-card__label">
        {POPULAR_CATEGORIES_ADMIN_PAGE_UI.LIST_TITLE_LABEL}
        <input
          className="curated-list-admin-card__input"
          value={titleDraft}
          maxLength={60}
          onChange={(event) => setTitleDraft(event.target.value)}
          disabled={isBusy}
        />
      </label>
      <label className="curated-list-admin-card__label">
        {POPULAR_CATEGORIES_ADMIN_PAGE_UI.LIST_REGION_LABEL}
        <RuRegionSelect
          value={regionDraft}
          onChange={setRegionDraft}
          disabled={isBusy}
          required
        />
      </label>
      <button
        type="button"
        className="app-btn app-btn--secondary"
        onClick={() => void handleSaveList()}
        disabled={isBusy || titleDraft.trim() === "" || !regionDraft}
      >
        {POPULAR_CATEGORIES_ADMIN_PAGE_UI.SAVE_TITLE}
      </button>

      <div className="curated-list-admin-card__add">
        <CuratedCategoryAddPicker
          kind={kindDraft}
          onKindChange={(nextKind) => {
            setKindDraft(nextKind);
            setRefIdDraft("");
            setSelectedLabel("");
          }}
          listRegionCode={regionDraft || listRegionCode}
          selectedRefId={refIdDraft}
          onSelect={handleSelectCategory}
          disabled={isBusy}
        />
        {selectedLabel ? (
          <p className="curated-list-admin-card__selected">
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_NAME_LABEL}: {selectedLabel}
          </p>
        ) : null}
        <button
          type="button"
          className="app-btn app-btn--primary"
          onClick={() => void handleAddCategory()}
          disabled={isBusy || !canAddCategory}
        >
          {POPULAR_CATEGORIES_ADMIN_PAGE_UI.ADD_CATEGORY}
        </button>
      </div>

      {isPreviewLoading ? (
        <p className="curated-list-admin-card__preview curated-list-admin-card__preview--muted">
          {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_LOADING}
        </p>
      ) : null}

      {previewError ? (
        <p className="curated-list-admin-card__error" role="alert">
          {previewError}
        </p>
      ) : null}

      {preview && !isPreviewLoading ? (
        <div
          className={[
            "curated-list-admin-card__preview",
            regionBlockReason ? "curated-list-admin-card__preview--warn" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <p className="curated-list-admin-card__preview-row">
            <span className="curated-list-admin-card__preview-label">
              {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_NAME_LABEL}
            </span>
            <span>{preview.label}</span>
          </p>
          {preview.kind === "personal" ? (
            <p className="curated-list-admin-card__preview-row">
              <span className="curated-list-admin-card__preview-label">
                {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_REGION_LABEL}
              </span>
              <span>{preview.regionLabel}</span>
            </p>
          ) : null}
          {regionBlockReason === "catalog" ? (
            <p className="curated-list-admin-card__preview-status" role="status">
              {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_NOT_VISIBLE}
            </p>
          ) : typeof regionBlockReason === "string" ? (
            <p className="curated-list-admin-card__preview-status" role="status">
              {regionBlockReason}
            </p>
          ) : (
            <p className="curated-list-admin-card__preview-status curated-list-admin-card__preview-status--ok">
              {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_OK}
            </p>
          )}
        </div>
      ) : null}

      {localError ? (
        <p className="curated-list-admin-card__error" role="alert">
          {localError}
        </p>
      ) : null}

      {list.items.length === 0 ? (
        <p className="curated-list-admin-card__empty">
          {POPULAR_CATEGORIES_ADMIN_PAGE_UI.EMPTY_LIST}
        </p>
      ) : (
        <ul className="curated-list-admin-card__items" role="list">
          {list.items.map((item) => (
            <li key={item.itemKey} className="curated-list-admin-card__item" role="listitem">
              <code className="curated-list-admin-card__product-id">
                {item.kind === "personal" ? "Личная" : "Дерево"} · {item.refId}
              </code>
              <button
                type="button"
                className="app-btn app-btn--secondary"
                onClick={() => void handleRemoveCategory(item.itemKey)}
                disabled={isBusy}
              >
                {POPULAR_CATEGORIES_ADMIN_PAGE_UI.REMOVE_CATEGORY}
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
