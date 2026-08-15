import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { isClientSentryEnabled } from "../shared/lib/clientSentryEnv.js";
import { disableDocumentPinchZoom } from "../shared/lib/disableDocumentPinchZoom.js";
import { enableAndroidFocusFieldScroll } from "../shared/lib/enableAndroidFocusFieldScroll.js";
import { enablePortraitOrientationLock } from "../shared/lib/enablePortraitOrientationLock.js";
import { initRuntimeDesignTokens } from "../shared/theme/runtimeDesignTokens.js";
import "../index.css";
import App from "./App.jsx";

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

initRuntimeDesignTokens();
disableDocumentPinchZoom();
enableAndroidFocusFieldScroll();
enablePortraitOrientationLock();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
