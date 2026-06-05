import { HOME_PAGE_UI } from "../../config/appUiCopy.js";

import "./PageChunkFallback.css";

export function PageChunkFallback() {
  return (
    <p className="page-chunk-fallback" role="status">
      {HOME_PAGE_UI.LOADING_SESSION}
    </p>
  );
}
