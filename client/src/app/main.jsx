import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { isClientSentryEnabled } from "../shared/lib/clientSentryEnv.js";
import { disableDocumentPinchZoom } from "../shared/lib/disableDocumentPinchZoom.js";
import { enableInputFocusPageScrollLock } from "../shared/lib/enableInputFocusPageScrollLock.js";
import { initRuntimeDesignTokens } from "../shared/theme/runtimeDesignTokens.js";
import "../index.css";
import App from "./App.jsx";

if (isClientSentryEnabled()) {
  void import("../shared/lib/initClientSentry.js").then(({ initClientSentry }) =>
    initClientSentry(),
  );
}

initRuntimeDesignTokens();
disableDocumentPinchZoom();
enableInputFocusPageScrollLock();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
