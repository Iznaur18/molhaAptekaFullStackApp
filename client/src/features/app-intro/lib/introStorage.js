import { APP_INTRO_SEEN_STORAGE_KEY } from "../model/introConstants.js";

export function hasSeenAppIntro() {
  try {
    return localStorage.getItem(APP_INTRO_SEEN_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markAppIntroSeen() {
  try {
    localStorage.setItem(APP_INTRO_SEEN_STORAGE_KEY, "1");
  } catch {
    // storage недоступен
  }
}
