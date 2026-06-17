import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initClientSentry } from "./shared/lib/initClientSentry.js";
import { initRuntimeDesignTokens } from "./shared/theme/runtimeDesignTokens.js";
import "./index.css";
import App from "./App.jsx";

initClientSentry();
initRuntimeDesignTokens();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
