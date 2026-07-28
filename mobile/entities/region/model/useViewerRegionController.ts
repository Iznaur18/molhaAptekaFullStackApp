import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_VIEWER_REGION_CODE,
  getRuRegionByCode,
  isRuRegionCode,
} from "@molha/api-contract";

import {
  readSessionViewerRegionCode,
  resolveClientViewerRegionCode,
  writeSessionViewerRegionCode,
} from "../lib/viewerRegion";

/**
 * Сессия (SecureStore / sessionStorage) → профиль → Москва.
 * Смена на главной пишет только сессию.
 */
export function useViewerRegionController(profileRegionCode?: string | null) {
  const [sessionRegionCode, setSessionRegionCode] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await readSessionViewerRegionCode();
      if (!cancelled) {
        setSessionRegionCode(stored);
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const viewerRegionCode = useMemo(
    () => resolveClientViewerRegionCode(profileRegionCode, sessionRegionCode),
    [profileRegionCode, sessionRegionCode],
  );

  const viewerRegionLabel = useMemo(
    () => getRuRegionByCode(viewerRegionCode)?.name ?? viewerRegionCode,
    [viewerRegionCode],
  );

  const setViewerRegionCode = useCallback((code: string) => {
    const next = String(code ?? "").trim();
    if (!isRuRegionCode(next)) {
      void writeSessionViewerRegionCode(null);
      setSessionRegionCode(null);
      return;
    }
    void writeSessionViewerRegionCode(next);
    setSessionRegionCode(next);
  }, []);

  return {
    viewerRegionCode: hydrated
      ? viewerRegionCode
      : resolveClientViewerRegionCode(profileRegionCode, null),
    viewerRegionLabel,
    setViewerRegionCode,
    hydrated,
    defaultRegionCode: DEFAULT_VIEWER_REGION_CODE,
  };
}
