import {
  getPlausibleDomain,
  isPlausibleEnabled,
  isPlausiblePaScript,
  resolvePlausibleScriptSrc,
} from "./plausibleEnv.js";

const SCRIPT_ID = "izibuy-plausible-script";

/**
 * Инжект Plausible. Без SCRIPT_SRC/DOMAIN — no-op.
 * SPA pageviews — trackPlausiblePageview после смены route.
 */
export function initPlausible() {
  if (typeof document === "undefined" || !isPlausibleEnabled()) {
    return;
  }

  if (document.getElementById(SCRIPT_ID)) {
    return;
  }

  const src = resolvePlausibleScriptSrc();
  if (!src) {
    return;
  }

  installPlausibleQueue();

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = src;

  if (!isPlausiblePaScript(src)) {
    const domain = getPlausibleDomain();
    if (domain) {
      script.setAttribute("data-domain", domain);
    }
  }

  document.head.appendChild(script);

  if (isPlausiblePaScript(src) && typeof window.plausible.init === "function") {
    window.plausible.init();
  }
}

/** Очередь вызовов до загрузки script (как в сниппете Plausible). */
function installPlausibleQueue() {
  window.plausible =
    window.plausible ||
    function plausibleProxy(...args) {
      (window.plausible.q = window.plausible.q || []).push(args);
    };

  window.plausible.init =
    window.plausible.init ||
    function plausibleInit(options) {
      window.plausible.o = options || {};
    };
}
