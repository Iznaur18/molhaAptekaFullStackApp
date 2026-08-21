import { useCallback, useState } from "react";

import { COOKIE_NOTICE_ACCEPTED_STORAGE_KEY } from "../model/cookieNoticeConstants.js";
import {
  hasAcceptedCookieNotice,
  markCookieNoticeAccepted,
} from "../lib/cookieNoticeStorage.js";
import { CookieNoticeSheet } from "./CookieNoticeSheet.jsx";

function shouldForceOpenCookieNotice() {
  try {
    return new URLSearchParams(window.location.search).has("cookieNotice");
  } catch {
    return false;
  }
}

/** Показывает CookieNoticeSheet при первом визите (web). `?cookieNotice` — форс-показ. */
export function CookieNoticeHost() {
  const [isOpen, setIsOpen] = useState(() => {
    if (shouldForceOpenCookieNotice()) {
      try {
        localStorage.removeItem(COOKIE_NOTICE_ACCEPTED_STORAGE_KEY);
      } catch {
        // ignore
      }
      return true;
    }
    return !hasAcceptedCookieNotice();
  });

  const handleAccept = useCallback(() => {
    markCookieNoticeAccepted();
    setIsOpen(false);
  }, []);

  return <CookieNoticeSheet isOpen={isOpen} onAccept={handleAccept} />;
}
