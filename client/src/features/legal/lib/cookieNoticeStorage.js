import { COOKIE_NOTICE_ACCEPTED_STORAGE_KEY } from "../model/cookieNoticeConstants.js";

export function hasAcceptedCookieNotice() {
  try {
    return localStorage.getItem(COOKIE_NOTICE_ACCEPTED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markCookieNoticeAccepted() {
  try {
    localStorage.setItem(COOKIE_NOTICE_ACCEPTED_STORAGE_KEY, "1");
  } catch {
    // storage недоступен (private mode / запрет) — UI останется до перезагрузки
  }
}
