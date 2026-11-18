import { useMemo, useState } from "react";
import { USER_SEARCH_MIN_LENGTH } from "@molha/api-contract";

import { buildCatalogSubcategoryPickerTiles } from "../../../entities/product-category-display/lib/buildCatalogSubcategoryPickerTiles.js";
import { buildResolvedProductCategoryDisplaysFromRoots } from "../../../entities/product-category-display/lib/resolveProductCategoryDisplay.js";
import { useProductCategoryDisplaysQuery } from "../../../entities/product-category-display/model/useProductCategoryDisplaysQuery.js";
import { CatalogCategoryTilesGridSkeleton } from "../../../entities/product-category-display/ui/CatalogCategoryTilesGridSkeleton.jsx";
import { useProductCategoryLevelQuery } from "../../../entities/product-category-tree/model/useProductCategoryLevelQuery.js";
import { useProductCategorySearchQuery } from "../../../entities/product-category-tree/model/useProductCategorySearchQuery.js";
import { useSellerPersonalCategoryCatalogTilesQuery } from "../../../entities/seller-personal-category/model/useSellerPersonalCategoryCatalogTilesQuery.js";
import { useUsersSearchQuery } from "../../../entities/user/model/useUsersSearchQuery.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { PRODUCT_CATEGORY_TREE_UI } from "../../../shared/config/appUiCopy.js";
import { POPULAR_CATEGORIES_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./CuratedCategoryAddPicker.css";

/**
 * @typedef {"tree" | "personal" | "user"} CuratedCategoryAddKind
 */

/**
 * @param {import('../../../entities/product-category-tree/model/types.js').ProductCategoryNode} node
 */
function formatCategoryPath(node) {
  const parts = Array.isArray(node.pathLabelRu) ? node.pathLabelRu.filter(Boolean) : [];
  if (parts.length > 0) {
    return parts.join(" › ");
  }
  return node.labelRu;
}

/**
 * @param {string} value
 * @returns {CuratedCategoryAddKind}
 */
function normalizeKind(value) {
  if (value === "personal") {
    return "personal";
  }
  if (value === "user") {
    return "user";
  }
  return "tree";
}

/**
 * @param {{
 *   kind: CuratedCategoryAddKind;
 *   onKindChange: (kind: CuratedCategoryAddKind) => void;
 *   listRegionCode: string;
 *   selectedRefId: string;
 *   onSelect: (payload: { kind: CuratedCategoryAddKind; refId: string; label: string }) => void;
 *   disabled?: boolean;
 * }} props
 */
export function CuratedCategoryAddPicker({
  kind,
  onKindChange,
  listRegionCode,
  selectedRefId,
  onSelect,
  disabled = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchDraft, setUserSearchDraft] = useState("");
  const [submittedUserSearch, setSubmittedUserSearch] = useState("");
  const [trail, setTrail] = useState(
    /** @type {{ id: string; labelRu: string }[]} */ ([]),
  );

  const searchQueryResult = useProductCategorySearchQuery({
    query: searchQuery,
    enabled: kind === "tree",
  });
  const personalTilesQuery = useSellerPersonalCategoryCatalogTilesQuery({
    enabled: kind === "personal",
    regionCode: listRegionCode,
  });
  const submittedUserSearchNormalized = submittedUserSearch.trim();
  const canFetchSubmittedUsers =
    kind === "user" && submittedUserSearchNormalized.length >= USER_SEARCH_MIN_LENGTH;
  const usersSearch = useUsersSearchQuery({
    search: submittedUserSearchNormalized,
    enabled: canFetchSubmittedUsers,
  });

  const activeParentId = trail.length === 0 ? null : trail[trail.length - 1].id;
  const treeBrowserActive = kind === "tree";
  const levelQuery = useProductCategoryLevelQuery({
    parentId: activeParentId,
    enabled: treeBrowserActive,
  });
  const displaysQuery = useProductCategoryDisplaysQuery({
    enabled: treeBrowserActive,
  });

  const searchResults = searchQueryResult.data ?? [];
  const personalTiles = personalTilesQuery.data ?? [];
  const treeOptions = levelQuery.categories;
  const displays = displaysQuery.data ?? [];
  const users = usersSearch.users;

  const treeTiles = useMemo(() => {
    if (activeParentId == null) {
      return buildResolvedProductCategoryDisplaysFromRoots(treeOptions, displays).map(
        (item) => ({
          key: item.categoryId ?? item.displaySlug,
          label: item.label,
          imageUrl: item.imageUrl,
          categoryId: item.categoryId ?? undefined,
        }),
      );
    }

    const parent = trail[trail.length - 1];
    if (!parent) {
      return [];
    }

    return buildCatalogSubcategoryPickerTiles({
      parent,
      categories: treeOptions,
      displays,
      includeViewAll: false,
    });
  }, [activeParentId, displays, trail, treeOptions]);

  const handleSelectTree = (node) => {
    onSelect({
      kind: "tree",
      refId: node.id,
      label: formatCategoryPath(node),
    });
    setSearchQuery("");
    setTrail([]);
  };

  const handleTreeTileClick = (item) => {
    if (disabled || !item.categoryId) {
      return;
    }
    const node = treeOptions.find((row) => row.id === item.categoryId);
    if (node) {
      handleSelectTree(node);
    }
  };

  const handleTreeTileDrill = (item, event) => {
    event.stopPropagation();
    if (disabled || !item.categoryId) {
      return;
    }
    const node = treeOptions.find((row) => row.id === item.categoryId);
    if (!node || node.isLeaf) {
      return;
    }
    setTrail((prev) => [...prev, { id: node.id, labelRu: node.labelRu }]);
  };

  const handleBack = () => {
    setTrail((prev) => prev.slice(0, -1));
  };

  const handleSelectUser = (user) => {
    const nickname = String(user.userName ?? "").trim();
    if (!nickname) {
      return;
    }
    onSelect({
      kind: "user",
      refId: String(user._id),
      label: nickname,
    });
  };

  return (
    <div className="curated-category-add-picker">
      <label className="curated-category-add-picker__kind">
        {POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_KIND_LABEL}
        <select
          className="curated-category-add-picker__input"
          value={kind}
          onChange={(event) => {
            onKindChange(normalizeKind(event.target.value));
            setSearchQuery("");
            setUserSearchDraft("");
            setSubmittedUserSearch("");
            setTrail([]);
          }}
          disabled={disabled}
        >
          <option value="tree">
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_KIND_TREE}
          </option>
          <option value="personal">
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_KIND_PERSONAL}
          </option>
          <option value="user">
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_KIND_USER}
          </option>
        </select>
      </label>

      {kind === "tree" ? (
        <>
          <label className="curated-category-add-picker__search">
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_SEARCH_LABEL}
            <input
              className="curated-category-add-picker__input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_SEARCH_PLACEHOLDER}
              disabled={disabled}
            />
          </label>

          {searchQuery.trim().length >= 2 ? (
            <div className="curated-category-add-picker__results">
              {searchQueryResult.isPending ? (
                <p className="curated-category-add-picker__hint">
                  {POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_SEARCH_LOADING}
                </p>
              ) : null}
              {searchQueryResult.error instanceof Error ? (
                <p className="curated-category-add-picker__error" role="alert">
                  {searchQueryResult.error.message}
                </p>
              ) : null}
              {!searchQueryResult.isPending &&
              !searchQueryResult.error &&
              searchResults.length === 0 ? (
                <p className="curated-category-add-picker__hint">
                  {POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_SEARCH_EMPTY}
                </p>
              ) : null}
              {searchResults.length > 0 ? (
                <ul className="curated-category-add-picker__results-list" role="list">
                  {searchResults.map((node) => (
                    <li
                      key={node.id}
                      className="curated-category-add-picker__results-item"
                    >
                      <button
                        type="button"
                        className={[
                          "curated-category-add-picker__result-btn",
                          selectedRefId === node.id &&
                            "curated-category-add-picker__result-btn_selected",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={disabled}
                        onClick={() => handleSelectTree(node)}
                      >
                        <span className="curated-category-add-picker__result-label">
                          {node.labelRu}
                        </span>
                        <span className="curated-category-add-picker__result-path">
                          {formatCategoryPath(node)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <p className="curated-category-add-picker__section-title">
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_BROWSE_TITLE}
          </p>

          {trail.length > 0 ? (
            <nav
              className="curated-category-add-picker__trail"
              aria-label={PRODUCT_CATEGORY_TREE_UI.TRAIL_ARIA}
            >
              {trail.map((step) => (
                <span key={step.id} className="curated-category-add-picker__trail-item">
                  {step.labelRu}
                </span>
              ))}
            </nav>
          ) : null}

          <div className="curated-category-add-picker__grid">
            {levelQuery.isLoading ? (
              <CatalogCategoryTilesGridSkeleton />
            ) : treeOptions.length === 0 ? (
              <p className="curated-category-add-picker__hint">
                {PRODUCT_CATEGORY_TREE_UI.EMPTY_LEVEL}
              </p>
            ) : (
              <ul className="curated-category-add-picker__tree-list">
                {treeTiles.map((item) => {
                  const node = treeOptions.find((row) => row.id === item.categoryId);
                  const canDrill = Boolean(node && !node.isLeaf);

                  return (
                    <li
                      key={item.key}
                      className="curated-category-add-picker__tree-item"
                    >
                      <button
                        type="button"
                        className={[
                          "curated-category-add-picker__tree-select",
                          selectedRefId === item.categoryId &&
                            "curated-category-add-picker__tree-select_selected",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={disabled}
                        onClick={() => handleTreeTileClick(item)}
                      >
                        {item.label}
                      </button>
                      {canDrill ? (
                        <button
                          type="button"
                          className="curated-category-add-picker__tree-drill"
                          disabled={disabled}
                          aria-label={POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_DRILL_ARIA(
                            item.label,
                          )}
                          onClick={(event) => handleTreeTileDrill(item, event)}
                        >
                          →
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {trail.length > 0 ? (
            <button
              type="button"
              className="app-btn app-btn--secondary curated-category-add-picker__back"
              disabled={disabled || levelQuery.isLoading}
              onClick={handleBack}
            >
              {PRODUCT_CATEGORY_TREE_UI.BACK}
            </button>
          ) : null}
        </>
      ) : null}

      {kind === "personal" ? (
        <label className="curated-category-add-picker__personal">
          {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PERSONAL_CATEGORY_LABEL}
          <select
            className="curated-category-add-picker__input"
            value={selectedRefId}
            onChange={(event) => {
              const refId = event.target.value;
              const tile = personalTiles.find((row) => row._id === refId);
              if (!tile) {
                return;
              }
              onSelect({
                kind: "personal",
                refId,
                label: tile.labelRu,
              });
            }}
            disabled={disabled || personalTilesQuery.isPending}
          >
            <option value="">
              {personalTilesQuery.isPending
                ? POPULAR_CATEGORIES_ADMIN_PAGE_UI.PERSONAL_CATEGORY_LOADING
                : POPULAR_CATEGORIES_ADMIN_PAGE_UI.PERSONAL_CATEGORY_PLACEHOLDER}
            </option>
            {personalTiles.map((tile) => (
              <option key={tile._id} value={tile._id}>
                {tile.labelRu}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {kind === "user" ? (
        <>
          <form
            className="curated-category-add-picker__user-search"
            onSubmit={(event) => {
              event.preventDefault();
              const next = userSearchDraft.trim();
              if (next.length < USER_SEARCH_MIN_LENGTH) {
                setSubmittedUserSearch("");
                return;
              }
              setSubmittedUserSearch(next);
            }}
          >
            <label className="curated-category-add-picker__search">
              {POPULAR_CATEGORIES_ADMIN_PAGE_UI.USER_SEARCH_LABEL}
              <input
                className="curated-category-add-picker__input"
                value={userSearchDraft}
                onChange={(event) => setUserSearchDraft(event.target.value)}
                placeholder={POPULAR_CATEGORIES_ADMIN_PAGE_UI.USER_SEARCH_PLACEHOLDER}
                disabled={disabled}
              />
            </label>
            <button
              type="submit"
              className="app-btn app-btn--secondary curated-category-add-picker__user-search-submit"
              disabled={disabled}
            >
              {POPULAR_CATEGORIES_ADMIN_PAGE_UI.USER_SEARCH_SUBMIT}
            </button>
          </form>

          <div className="curated-category-add-picker__results">
            {!canFetchSubmittedUsers &&
            userSearchDraft.trim().length > 0 &&
            userSearchDraft.trim().length < USER_SEARCH_MIN_LENGTH ? (
              <p className="curated-category-add-picker__hint">
                {POPULAR_CATEGORIES_ADMIN_PAGE_UI.USER_SEARCH_TOO_SHORT}
              </p>
            ) : null}
            {!canFetchSubmittedUsers &&
            userSearchDraft.trim().length === 0 &&
            submittedUserSearchNormalized.length === 0 ? (
              <p className="curated-category-add-picker__hint">
                {POPULAR_CATEGORIES_ADMIN_PAGE_UI.USER_SEARCH_HINT}
              </p>
            ) : null}
            {canFetchSubmittedUsers && usersSearch.phase === "loading" ? (
              <p className="curated-category-add-picker__hint">
                {POPULAR_CATEGORIES_ADMIN_PAGE_UI.USER_SEARCH_LOADING}
              </p>
            ) : null}
            {canFetchSubmittedUsers && usersSearch.error ? (
              <p className="curated-category-add-picker__error" role="alert">
                {usersSearch.error}
              </p>
            ) : null}
            {canFetchSubmittedUsers &&
            usersSearch.phase === "success" &&
            users.length === 0 ? (
              <p className="curated-category-add-picker__hint">
                {POPULAR_CATEGORIES_ADMIN_PAGE_UI.USER_SEARCH_EMPTY}
              </p>
            ) : null}
            {canFetchSubmittedUsers && users.length > 0 ? (
              <ul className="curated-category-add-picker__results-list" role="list">
                {users.map((user) => {
                  const nickname = String(user.userName ?? "").trim();
                  const avatarUrl = user.userAvatarUrl
                    ? resolveUploadedImageUrl(user.userAvatarUrl)
                    : null;

                  return (
                    <li
                      key={user._id}
                      className="curated-category-add-picker__results-item"
                    >
                      <button
                        type="button"
                        className={[
                          "curated-category-add-picker__result-btn",
                          "curated-category-add-picker__result-btn--user",
                          selectedRefId === user._id &&
                            "curated-category-add-picker__result-btn_selected",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={disabled || !nickname}
                        onClick={() => handleSelectUser(user)}
                      >
                        {avatarUrl ? (
                          <img
                            className="curated-category-add-picker__user-avatar"
                            src={avatarUrl}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                          />
                        ) : (
                          <span
                            className="curated-category-add-picker__user-avatar curated-category-add-picker__user-avatar--empty"
                            aria-hidden="true"
                          />
                        )}
                        <span className="curated-category-add-picker__result-label">
                          {nickname || user._id}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </>
      ) : null}

      {kind === "personal" && personalTilesQuery.isError ? (
        <p className="curated-category-add-picker__error" role="alert">
          {personalTilesQuery.error instanceof Error
            ? personalTilesQuery.error.message
            : POPULAR_CATEGORIES_ADMIN_PAGE_UI.PERSONAL_CATEGORY_LOAD_ERROR}
        </p>
      ) : null}

      {kind === "personal" &&
      !personalTilesQuery.isPending &&
      !personalTilesQuery.isError &&
      personalTiles.length === 0 ? (
        <p className="curated-category-add-picker__hint">
          {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PERSONAL_CATEGORY_EMPTY}
        </p>
      ) : null}
    </div>
  );
}
