import { COMMON_UI } from "../../config/appUiCopy.js";

import "./FormRequiredMark.css";

export function FormRequiredMark() {
  return (
    <span className="form-required-mark" aria-hidden="true">
      {COMMON_UI.REQUIRED_FIELD_HINT}
    </span>
  );
}
