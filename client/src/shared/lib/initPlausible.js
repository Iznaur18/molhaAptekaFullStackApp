import {
  getPlausibleDomain,
  getPlausibleScriptSrc,
  isPlausibleEnabled,
} from "./plausibleEnv.js";

const SCRIPT_ID = "izibuy-plausible-script";

/**
 * Инжект script.js. Без domain — no-op.
 * SPA pageviews — отдельно через trackPlausiblePageview.
 */
export function initPlausible() {
  if (typeof document === "undefined" || !isPlausibleEnabled()) {
    return;
  }

  if (document.getElementById(SCRIPT_ID)) {
    return;
  }

  window.plausible =
    window.plausible ||
    function plausibleProxy(...args) {
      (window.plausible.q = window.plausible.q || []).push(args);
    };

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.defer = true;
  script.setAttribute("data-domain", getPlausibleDomain());
  script.src = getPlausibleScriptSrc();
  document.head.appendChild(script);
}
