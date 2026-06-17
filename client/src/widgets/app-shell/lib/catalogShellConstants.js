import { parseCatalogQueryFromSearchParams } from "../../../entities/product/lib/catalogCatalogQuery.js";

/** @typedef {{ open: boolean; phase: 'idle'|'loading'|'success'|'error'; user: import('../../../entities/user/model/types.js').UserPublicProfile | null; error: string }} ProfileModalState */

export const EMPTY_PROFILE_MODAL = Object.freeze({
  open: false,
  phase: "idle",
  user: null,
  error: "",
});

export const EMPTY_MY_PROFILE_PAGE = Object.freeze({
  phase: "idle",
  user: null,
  error: "",
});

/**
 * @returns {ReturnType<typeof parseCatalogQueryFromSearchParams> | null}
 */
export const readInitialCatalogQuery = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== "/" && path !== "/catalog") {
    return null;
  }
  return parseCatalogQueryFromSearchParams(new URLSearchParams(window.location.search));
};

export const readInitialCatalogCategory = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== "/catalog") {
    return null;
  }
  return readInitialCatalogQuery()?.category ?? null;
};
