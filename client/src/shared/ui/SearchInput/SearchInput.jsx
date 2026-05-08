import "./SearchInput.css";

/**
 * Универсальное поле поиска с кнопкой очистки и индикатором ожидания.
 *
 * @param {{
 *   value: string;
 *   onChange: (next: string) => void;
 *   placeholder: string;
 *   ariaLabel: string;
 *   clearAriaLabel: string;
 *   pendingAriaLabel: string;
 *   isPending?: boolean;
 * }} props
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  clearAriaLabel,
  pendingAriaLabel,
  isPending = false,
}) {
  const handleChange = (event) => onChange(event.target.value);
  const handleClear = () => onChange("");
  const showClearButton = value !== "";

  return (
    <div className="search-input" role="search">
      <input
        type="search"
        className="search-input__field"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        spellCheck={false}
      />
      {showClearButton ? (
        <button
          type="button"
          className="search-input__clear"
          onClick={handleClear}
          aria-label={clearAriaLabel}
        >
          ×
        </button>
      ) : null}
      {isPending ? (
        <span
          className="search-input__spinner"
          aria-label={pendingAriaLabel}
          role="status"
        />
      ) : null}
    </div>
  );
}
