import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_VIEWER_REGION_CODE,
  getRuRegionByCode,
  isRuRegionCode,
  resolveViewerRegionCode,
} from "@molha/api-contract";

import {
  readSessionViewerRegionCode,
  writeSessionViewerRegionCode,
} from "../lib/viewerRegion.js";

/**
 * Сессия (sessionStorage) → профиль → Москва.
 * Смена на главной пишет только сессию, профиль не трогает.
 *
 * @param {string | null | undefined} profileRegionCode
 */
export function useViewerRegionController(profileRegionCode) {
  const [sessionRegionCode, setSessionRegionCode] = useState(() =>
    readSessionViewerRegionCode(),
  );

  const viewerRegionCode = useMemo(() => {
    if (sessionRegionCode && isRuRegionCode(sessionRegionCode)) {
      return sessionRegionCode;
    }
    return resolveViewerRegionCode(profileRegionCode ?? DEFAULT_VIEWER_REGION_CODE);
  }, [profileRegionCode, sessionRegionCode]);

  const viewerRegionLabel = useMemo(
    () => getRuRegionByCode(viewerRegionCode)?.name ?? viewerRegionCode,
    [viewerRegionCode],
  );

  const setViewerRegionCode = useCallback((code) => {
    const next = String(code ?? "").trim();
    if (!isRuRegionCode(next)) {
      writeSessionViewerRegionCode(null);
      setSessionRegionCode(null);
      return;
    }
    writeSessionViewerRegionCode(next);
    setSessionRegionCode(next);
  }, []);

  return {
    viewerRegionCode,
    viewerRegionLabel,
    setViewerRegionCode,
  };
}
