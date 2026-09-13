import "./__errorBeacon.js"; // [TEMP DIAG] ловит ошибки старта на мобильных — удалить после

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { isClientSentryEnabled } from "../shared/lib/clientSentryEnv.js";
import { isPlausibleEnabled } from "../shared/lib/plausibleEnv.js";
import { disableDocumentPinchZoom } from "../shared/lib/disableDocumentPinchZoom.js";
import { enableAndroidFocusFieldScroll } from "../shared/lib/enableAndroidFocusFieldScroll.js";
import { enablePortraitOrientationLock } from "../shared/lib/enablePortraitOrientationLock.js";
import { enableSoftKeyboardOpenClass } from "../shared/lib/enableSoftKeyboardOpenClass.js";
import { initRuntimeDesignTokens } from "../shared/theme/runtimeDesignTokens.js";
import "../index.css";
import { rememberCatalogFeedModeFromUrl } from "../widgets/catalog-product-grid/lib/catalogFeedMode.js";
import App from "./App.jsx";
import { startScrollJankProbe } from "./scrollJankProbe.js"; // [TEMP DIAG] плавность прокрутки на телефонах — удалить после

if (isClientSentryEnabled()) {
  const bootSentry = () => {
    void import("../shared/lib/initClientSentry.js").then(({ initClientSentry }) =>
      initClientSentry(),
    );
  };
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(bootSentry, { timeout: 4000 });
  } else {
    window.setTimeout(bootSentry, 2500);
  }
}

if (isPlausibleEnabled()) {
  const bootPlausible = () => {
    void import("../shared/lib/initPlausible.js").then(({ initPlausible }) =>
      initPlausible(),
    );
  };
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(bootPlausible, { timeout: 4000 });
  } else {
    window.setTimeout(bootPlausible, 2500);
  }
}

initRuntimeDesignTokens();
disableDocumentPinchZoom();
enableAndroidFocusFieldScroll();
enablePortraitOrientationLock();
enableSoftKeyboardOpenClass();
startScrollJankProbe();
// [TEMP A/B] До роутера: он убирает query с главной раньше, чем монтируется лента.
rememberCatalogFeedModeFromUrl();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
