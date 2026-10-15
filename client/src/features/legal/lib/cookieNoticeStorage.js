import {
  COOKIE_NOTICE_ACCEPTED_EVENT,
  COOKIE_NOTICE_ACCEPTED_STORAGE_KEY,
} from "../model/cookieNoticeConstants.js";
import { reportClientIssue } from "../../../shared/lib/reportClientIssue.js";

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
  } catch (error) {
    // storage недоступен (private mode / запрет) — UI останется до перезагрузки
    reportClientIssue("cookieNoticeStorage", error);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COOKIE_NOTICE_ACCEPTED_EVENT));
  }
}
