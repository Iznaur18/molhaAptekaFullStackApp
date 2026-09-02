import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { fetchAllMyProducts } from "../../product/api/fetchMyProducts.js";
import {
  createSellerShelf,
  deleteSellerShelf,
  patchSellerShelf,
  reorderSellerShelves,
  setSellerShelfProducts,
} from "../api/sellerShelfApi.js";
import { useMySellerShelvesQuery } from "../model/useMySellerShelvesQuery.js";
import { sellerShelfQueryKeys } from "../model/sellerShelfQueryKeys.js";
import { SELLER_SHELF_UI } from "../../../shared/config/appUiCopy.js";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";

import "./MyProductsShelvesPanel.css";

/**
 * Управление полками витрины в «Мои товары».
 */
export function MyProductsShelvesPanel() {
  const queryClient = useQueryClient();
  const shelvesQuery = useMySellerShelvesQuery();
  const [newName, setNewName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editName, setEditName] = useState("");
  const [isAssignRenaming, setIsAssignRenaming] = useState(false);
  const [assignShelfId, setAssignShelfId] = useState(/** @type {string | null} */ (null));
  const [selectedIds, setSelectedIds] = useState(/** @type {Set<string>} */ (new Set()));
  const [isExpanded, setIsExpanded] = useState(false);
  const bodyId = "my-products-shelves-body";

  const shelves = shelvesQuery.data?.shelves ?? [];
  const maxShelves = shelvesQuery.data?.maxShelves ?? 10;
  const nameMaxChars = shelvesQuery.data?.nameMaxChars ?? 30;
  const atLimit = shelves.length >= maxShelves;

  const assignShelf = useMemo(
    () =>
      shelves.find((shelf) => String(shelf._id) === String(assignShelfId ?? "")) ??
      null,
    [assignShelfId, shelves],
  );

  const productsQuery = useQuery({
    queryKey: [...sellerShelfQueryKeys.all, "assign-products"],
    queryFn: () => fetchAllMyProducts(),
    enabled: Boolean(assignShelfId),
    staleTime: 15_000,
  });

  const invalidateShelves = () => {
    void queryClient.invalidateQueries({ queryKey: sellerShelfQueryKeys.mine() });
  };

  const createMutation = useMutation({
    mutationFn: () => createSellerShelf({ name: newName.trim() }),
    onSuccess: () => {
      setNewName("");
      setErrorMessage("");
      invalidateShelves();
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : SELLER_SHELF_UI.LOAD_ERROR);
    },
  });

  const patchMutation = useMutation({
    mutationFn: (/** @type {{ shelfId: string; name: string }} */ input) =>
      patchSellerShelf(input.shelfId, { name: input.name }),
    onSuccess: () => {
      setIsAssignRenaming(false);
      setEditName("");
      invalidateShelves();
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : SELLER_SHELF_UI.LOAD_ERROR);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (/** @type {string} */ shelfId) => deleteSellerShelf(shelfId),
    onSuccess: (_data, shelfId) => {
      if (assignShelfId === shelfId) {
        closeAssign();
      }
      invalidateShelves();
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : SELLER_SHELF_UI.LOAD_ERROR);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (/** @type {string[]} */ orderedShelfIds) =>
      reorderSellerShelves(orderedShelfIds),
    onSuccess: () => {
      invalidateShelves();
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : SELLER_SHELF_UI.LOAD_ERROR);
    },
  });

  const assignMutation = useMutation({
    mutationFn: (/** @type {{ shelfId: string; productIds: string[] }} */ input) =>
      setSellerShelfProducts(input.shelfId, input.productIds),
    onSuccess: () => {
      setAssignShelfId(null);
      setSelectedIds(new Set());
      invalidateShelves();
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : SELLER_SHELF_UI.LOAD_ERROR);
    },
  });

  const openAssign = (shelfId) => {
    setErrorMessage("");
    setAssignShelfId(String(shelfId));
    setSelectedIds(new Set());
    setIsAssignRenaming(false);
    setEditName("");
  };

  const closeAssign = () => {
    setAssignShelfId(null);
    setSelectedIds(new Set());
    setIsAssignRenaming(false);
    setEditName("");
  };

  const confirmDeleteShelf = (shelfId) => {
    if (!window.confirm(SELLER_SHELF_UI.DELETE_CONFIRM)) return;
    deleteMutation.mutate(shelfId);
  };

  const cancelShelfRename = () => {
    setIsAssignRenaming(false);
    setEditName("");
  };

  const startShelfRename = () => {
    if (!assignShelf) return;
    setErrorMessage("");
    setIsAssignRenaming(true);
    setEditName(assignShelf.name);
  };

  const commitShelfRename = () => {
    if (!assignShelfId || !assignShelf) {
      cancelShelfRename();
      return;
    }

    const trimmed = editName.trim();
    if (!trimmed || trimmed === assignShelf.name) {
      cancelShelfRename();
      return;
    }

    patchMutation.mutate({
      shelfId: assignShelfId,
      name: trimmed,
    });
  };

  useEffect(() => {
    if (!assignShelfId || !productsQuery.data) {
      return;
    }
    const next = new Set();
    for (const product of productsQuery.data) {
      if (String(product.sellerShelfId ?? "") === String(assignShelfId)) {
        next.add(String(product._id));
      }
    }
    setSelectedIds(next);
  }, [assignShelfId, productsQuery.data]);

  const moveShelf = (shelfId, direction) => {
    const index = shelves.findIndex((s) => s._id === shelfId);
    if (index < 0) return;
    const target = index + direction;
    if (target < 0 || target >= shelves.length) return;
    const ordered = shelves.map((s) => s._id);
    const [item] = ordered.splice(index, 1);
    ordered.splice(target, 0, item);
    reorderMutation.mutate(ordered);
  };

  const openAssignFromKeyboard = (event, shelfId) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    openAssign(shelfId);
  };

  const toggleProduct = (productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const assignShelfNameBlock = assignShelf ? (
    <div className="my-products-shelves__assign-shelf-name">
      {isAssignRenaming ? (
        <input
          id="assign-shelf-name-input"
          className="my-products-shelves__assign-name-input"
          type="text"
          maxLength={nameMaxChars}
          value={editName}
          disabled={patchMutation.isPending}
          autoFocus
          aria-label={SELLER_SHELF_UI.RENAME_LABEL}
          onChange={(event) => setEditName(event.target.value)}
          onBlur={commitShelfRename}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitShelfRename();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              cancelShelfRename();
            }
          }}
        />
      ) : (
        <button
          type="button"
          className="my-products-shelves__assign-name-btn"
          aria-label={SELLER_SHELF_UI.RENAME_NAME_ARIA}
          onClick={startShelfRename}
        >
          <span className="my-products-shelves__assign-name-main">
            <span className="my-products-shelves__assign-name-label">
              {SELLER_SHELF_UI.RENAME_LABEL}
            </span>
            <span className="my-products-shelves__assign-name-value">{assignShelf.name}</span>
          </span>
          <span className="my-products-shelves__assign-name-action" aria-hidden="true">
            {SELLER_SHELF_UI.RENAME_TAP_HINT}
          </span>
        </button>
      )}
    </div>
  ) : null;

  return (
    <section
      className={[
        "my-products-shelves",
        isExpanded ? "my-products-shelves_expanded" : "my-products-shelves_collapsed",
      ].join(" ")}
      aria-label={SELLER_SHELF_UI.TITLE}
    >
      <button
        type="button"
        className="my-products-shelves__toggle"
        aria-expanded={isExpanded}
        aria-controls={bodyId}
        aria-label={SELLER_SHELF_UI.EXPAND_TOGGLE(isExpanded)}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <span className="my-products-shelves__toggle-main">
          <h3 className="my-products-shelves__title">{SELLER_SHELF_UI.TITLE}</h3>
          {shelves.length > 0 ? (
            <span className="my-products-shelves__collapsed-count">
              {SELLER_SHELF_UI.COLLAPSED_COUNT(shelves.length)}
            </span>
          ) : null}
        </span>
        <span className="my-products-shelves__toggle-action">
          {SELLER_SHELF_UI.EXPAND_TOGGLE(isExpanded)}
        </span>
      </button>

      <div
        id={bodyId}
        className={[
          "my-products-shelves__fold",
          isExpanded ? "my-products-shelves__fold_open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={!isExpanded}
        inert={!isExpanded ? true : undefined}
      >
        <div className="my-products-shelves__fold-clip">
          <div className="my-products-shelves__fold-inner">
          <p className="my-products-shelves__hint">{SELLER_SHELF_UI.HINT}</p>

          <form
            className="my-products-shelves__create"
            onSubmit={(event) => {
              event.preventDefault();
              if (!newName.trim() || atLimit || createMutation.isPending) return;
              createMutation.mutate();
            }}
          >
            <input
              className="my-products-shelves__input"
              type="text"
              maxLength={nameMaxChars}
              placeholder={SELLER_SHELF_UI.CREATE_PLACEHOLDER}
              value={newName}
              disabled={atLimit || createMutation.isPending}
              onChange={(event) => setNewName(event.target.value)}
            />
            <button
              type="submit"
              className="app-btn app-btn--secondary my-products-shelves__create-btn"
              disabled={atLimit || !newName.trim() || createMutation.isPending}
            >
              {createMutation.isPending
                ? SELLER_SHELF_UI.CREATE_PENDING
                : SELLER_SHELF_UI.CREATE}
            </button>
          </form>
          {atLimit ? (
            <p className="my-products-shelves__limit">{SELLER_SHELF_UI.LIMIT_REACHED}</p>
          ) : null}

          {shelvesQuery.isLoading ? (
            <p className="my-products-shelves__state">{SELLER_SHELF_UI.LOADING}</p>
          ) : null}
          {shelvesQuery.isError ? (
            <p
              className="my-products-shelves__state my-products-shelves__state_error"
              role="alert"
            >
              {shelvesQuery.error instanceof Error
                ? shelvesQuery.error.message
                : SELLER_SHELF_UI.LOAD_ERROR}
            </p>
          ) : null}
          {errorMessage ? (
            <p
              className="my-products-shelves__state my-products-shelves__state_error"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          {!shelvesQuery.isLoading && shelves.length === 0 ? (
            <p className="my-products-shelves__state">{SELLER_SHELF_UI.EMPTY}</p>
          ) : null}

          {shelves.length > 0 ? (
            <ul className="my-products-shelves__list" role="list">
              {shelves.map((shelf, index) => (
                <li key={shelf._id} className="my-products-shelves__item">
                  <div
                    className="my-products-shelves__item-main"
                    role="button"
                    tabIndex={0}
                    aria-label={SELLER_SHELF_UI.ASSIGN_TITLE(shelf.name)}
                    onClick={() => openAssign(shelf._id)}
                    onKeyDown={(event) => openAssignFromKeyboard(event, shelf._id)}
                  >
                    <span className="my-products-shelves__count">
                      {SELLER_SHELF_UI.PRODUCT_COUNT(shelf.productCount)}
                    </span>
                    <span className="my-products-shelves__name-text">{shelf.name}</span>
                  </div>
                  <div
                    className="my-products-shelves__item-actions"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <div className="my-products-shelves__item-tools">
                      <button
                        type="button"
                        className="my-products-shelves__tool-btn"
                        aria-label={SELLER_SHELF_UI.MOVE_LEFT_ARIA}
                        disabled={index === 0 || reorderMutation.isPending}
                        onClick={() => moveShelf(shelf._id, -1)}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        className="my-products-shelves__tool-btn"
                        aria-label={SELLER_SHELF_UI.MOVE_RIGHT_ARIA}
                        disabled={index >= shelves.length - 1 || reorderMutation.isPending}
                        onClick={() => moveShelf(shelf._id, 1)}
                      >
                        →
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          </div>
        </div>
      </div>

      <ProductModalShell
        isOpen={Boolean(assignShelfId)}
        size="fullHeight"
        hideCloseButton
        closeOnEscape={!isAssignRenaming}
        panelClassName="my-products-shelves__assign-panel"
        bodyClassName="my-products-shelves__assign-modal-body"
        footerClassName="my-products-shelves__assign-footer-wrap"
        onClose={closeAssign}
        title={assignShelf ? SELLER_SHELF_UI.ASSIGN_MODAL_TITLE : SELLER_SHELF_UI.ASSIGN}
        ariaLabel={assignShelf ? SELLER_SHELF_UI.ASSIGN_TITLE(assignShelf.name) : undefined}
        titleId="seller-shelf-assign-title"
        footer={
          <div className="my-products-shelves__assign-footer">
            <button
              type="button"
              className="app-btn app-btn--danger"
              disabled={
                !assignShelfId ||
                deleteMutation.isPending ||
                assignMutation.isPending ||
                patchMutation.isPending
              }
              onClick={() => {
                if (!assignShelfId) return;
                confirmDeleteShelf(assignShelfId);
              }}
            >
              {deleteMutation.isPending
                ? SELLER_SHELF_UI.DELETE_PENDING
                : SELLER_SHELF_UI.DELETE}
            </button>
            <button
              type="button"
              className="app-btn app-btn--secondary"
              disabled={
                assignMutation.isPending ||
                deleteMutation.isPending ||
                patchMutation.isPending
              }
              onClick={closeAssign}
            >
              {SELLER_SHELF_UI.ASSIGN_CANCEL}
            </button>
            <button
              type="button"
              className="app-btn app-btn--primary my-products-shelves__assign-footer-save"
              disabled={
                assignMutation.isPending ||
                deleteMutation.isPending ||
                patchMutation.isPending ||
                productsQuery.isLoading
              }
              onClick={() => {
                if (!assignShelfId) return;
                assignMutation.mutate({
                  shelfId: assignShelfId,
                  productIds: [...selectedIds],
                });
              }}
            >
              {assignMutation.isPending
                ? SELLER_SHELF_UI.ASSIGN_PENDING
                : SELLER_SHELF_UI.ASSIGN_SAVE}
            </button>
          </div>
        }
      >
        <ul className="my-products-shelves__assign-list" role="list">
          {assignShelf ? (
            <li className="my-products-shelves__assign-item my-products-shelves__assign-item_name">
              {assignShelfNameBlock}
            </li>
          ) : null}
          {productsQuery.isLoading ? (
            <li className="my-products-shelves__assign-item">
              <p className="my-products-shelves__assign-state">{SELLER_SHELF_UI.LOADING}</p>
            </li>
          ) : (productsQuery.data?.length ?? 0) === 0 ? (
            <li className="my-products-shelves__assign-item">
              <p className="my-products-shelves__assign-state">{SELLER_SHELF_UI.ASSIGN_EMPTY}</p>
            </li>
          ) : (
            (productsQuery.data ?? []).map((product) => {
              const id = String(product._id);
              const checked = selectedIds.has(id);
              const otherShelf =
                product.sellerShelfId &&
                String(product.sellerShelfId) !== String(assignShelfId);
              const productName =
                String(product.productName ?? "").trim() || "Товар";

              return (
                <li key={id} className="my-products-shelves__assign-item">
                  <label
                    className={[
                      "my-products-shelves__assign-row",
                      checked ? "my-products-shelves__assign-row_selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      type="checkbox"
                      className="my-products-shelves__assign-check"
                      checked={checked}
                      onChange={() => toggleProduct(id)}
                    />
                    <span className="my-products-shelves__assign-row-body">
                      <span className="my-products-shelves__assign-product-name">{productName}</span>
                      {otherShelf ? (
                        <span className="my-products-shelves__assign-badge">
                          {SELLER_SHELF_UI.ASSIGN_OTHER_SHELF}
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })
          )}
        </ul>
      </ProductModalShell>
    </section>
  );
}
