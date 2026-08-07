import { useEffect, useState } from "react";

import { fetchCuratedListProductPreviewAdmin } from "../api/fetchCuratedListProductPreviewAdmin.js";
import { isCuratedProductIdInput } from "../lib/isCuratedProductIdInput.js";

const PREVIEW_DEBOUNCE_MS = 350;

/**
 * @param {string} productIdDraft
 */
export function useCuratedListProductAddPreview(productIdDraft) {
  const [preview, setPreview] = useState(
    /** @type {import('../api/fetchCuratedListProductPreviewAdmin.js').CuratedListProductPreview | null} */ (
      null
    ),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const productId = String(productIdDraft ?? "").trim();
    if (!isCuratedProductIdInput(productId)) {
      setPreview(null);
      setError("");
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setError("");
      void fetchCuratedListProductPreviewAdmin(productId)
        .then((next) => {
          if (cancelled) return;
          setPreview(next);
          setIsLoading(false);
        })
        .catch((e) => {
          if (cancelled) return;
          setPreview(null);
          setIsLoading(false);
          setError(e instanceof Error ? e.message : "Не удалось загрузить товар");
        });
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [productIdDraft]);

  return { preview, isLoading, error };
}
