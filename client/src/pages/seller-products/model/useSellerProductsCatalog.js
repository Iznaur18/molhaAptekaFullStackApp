import { useCallback, useEffect, useRef, useState } from "react";

import { mapSellerCatalogItemsToProducts } from "../../../entities/user/lib/mapSellerCatalogItemsToProducts.js";
import {
  fetchUserProducts,
  USER_PROFILE_PRODUCTS_API_LIMIT_MAX,
} from "../../../entities/user/api/fetchUserProducts.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ sellerId: string; enabled: boolean }} params
 */
export function useSellerProductsCatalog({ sellerId, enabled }) {
  const [phase, setPhase] = useState("idle");
  const [products, setProducts] = useState(
    /** @type {import('../../../entities/product/model/types.js').ProductFromApi[]} */ ([]),
  );
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(
    /** @type {string | null} */ (null),
  );
  const pageRef = useRef(1);
  const loadSeqRef = useRef(0);
  const sentinelRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const loadPage = useCallback(
    async (page, { append }) => {
      const result = await fetchUserProducts(sellerId, {
        page,
        limit: USER_PROFILE_PRODUCTS_API_LIMIT_MAX,
      });
      const nextProducts = mapSellerCatalogItemsToProducts(result.items);
      setProducts((prev) => (append ? [...prev, ...nextProducts] : nextProducts));
      setHasMore(Boolean(result.pagination?.hasMore));
      pageRef.current = page;
    },
    [sellerId],
  );

  const reload = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    setPhase("loading");
    setError("");
    setLoadMoreError(null);
    setHasMore(false);
    pageRef.current = 1;

    try {
      await loadPage(1, { append: false });
      if (seq !== loadSeqRef.current) return;
      setPhase("success");
    } catch (e) {
      if (seq !== loadSeqRef.current) return;
      setError(
        e instanceof Error ? e.message : API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK,
      );
      setPhase("error");
    }
  }, [loadPage]);

  useEffect(() => {
    if (!enabled) {
      setPhase("idle");
      return undefined;
    }
    void reload();
    return () => {
      loadSeqRef.current += 1;
    };
  }, [enabled, reload]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || phase !== "success") return;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      await loadPage(pageRef.current + 1, { append: true });
    } catch (e) {
      setLoadMoreError(
        e instanceof Error ? e.message : API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK,
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, loadPage, phase]);

  useEffect(() => {
    if (!enabled || phase !== "success" || !hasMore) return undefined;
    const el = sentinelRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, hasMore, loadMore, phase]);

  return {
    phase,
    products,
    error,
    hasMore,
    isLoadingMore,
    loadMoreError,
    sentinelRef,
    retryLoadMore: loadMore,
    reload,
  };
}
