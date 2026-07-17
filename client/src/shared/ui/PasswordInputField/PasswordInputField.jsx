import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import "./PasswordInputField.css";

/**
 * @param {{
 * className?: string;
 * name: string;
 * value: string;
 * onChange: (event: import("react").ChangeEvent<HTMLInputElement>) => void;
 * required?: boolean;
 * minLength?: number;
 * autoComplete?: string;
 * "aria-required"?: boolean | "true" | "false";
 * "aria-invalid"?: boolean | "true" | "false";
 * showPasswordAria: string;
 * hidePasswordAria: string;
 * }} props
 */
export function PasswordInputField({
  className = "",
  name,
  value,
  onChange,
  required,
  minLength,
  autoComplete,
  "aria-required": ariaRequired,
  "aria-invalid": ariaInvalid,
  showPasswordAria,
  hidePasswordAria,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const toggleId = useId();
  const toggleAria = isVisible ? hidePasswordAria : showPasswordAria;
  const inputClassName = ["password-input-field__input", className].filter(Boolean).join(" ");

  return (
    <div className="password-input-field">
      <input
        className={inputClassName}
        type={isVisible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        aria-required={ariaRequired}
        aria-invalid={ariaInvalid}
      />
      <button
        id={toggleId}
        type="button"
        className="password-input-field__toggle"
        onClick={() => setIsVisible((prev) => !prev)}
        aria-label={toggleAria}
        aria-pressed={isVisible}
      >
        {isVisible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
    </div>
  );
}
