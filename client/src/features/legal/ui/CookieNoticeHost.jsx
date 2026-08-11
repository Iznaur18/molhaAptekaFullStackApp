import { useCallback, useState } from "react";

import {
  hasAcceptedCookieNotice,
  markCookieNoticeAccepted,
} from "../lib/cookieNoticeStorage.js";
import { CookieNoticeSheet } from "./CookieNoticeSheet.jsx";

/** Показывает CookieNoticeSheet при первом визите (web). */
export function CookieNoticeHost() {
  const [isOpen, setIsOpen] = useState(() => !hasAcceptedCookieNotice());

  const handleAccept = useCallback(() => {
    markCookieNoticeAccepted();
    setIsOpen(false);
  }, []);

  return <CookieNoticeSheet isOpen={isOpen} onAccept={handleAccept} />;
}
