import { FormRequiredMark } from "./FormRequiredMark.jsx";

import "./FormFieldLabel.css";

/**
 * @param {{
 *   children: import('react').ReactNode;
 *   required?: boolean;
 *   className?: string;
 * }} props
 */
export function FormFieldLabel({ children, required = false, className = "" }) {
  const rootClass = ["form-field-label", className].filter(Boolean).join(" ");

  return (
    <span className={rootClass}>
      {children}
      {required ? <FormRequiredMark /> : null}
    </span>
  );
}
