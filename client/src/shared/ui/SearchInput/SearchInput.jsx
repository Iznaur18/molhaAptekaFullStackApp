import { ModalCloseIcon } from "../icon/index.js";

import "./SearchInput.css";

/**
 * Универсальное поле поиска с кнопкой очистки и индикатором ожидания.
 *
 * `onSubmit` вызывается по Enter («Найти»/«Search» на экранной клавиатуре).
 * Enter ловится на самом поле, а не только неявной отправкой формы: последняя
 * работает лишь пока в форме ровно одно текстовое поле. Форма всегда гасит
 * нативную отправку — без `onSubmit` Enter просто ничего не делает.
 *
 * @param {{
 *   value: string;
 *   onChange: (next: string) => void;
 *   onSubmit?: () => void;
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
  onSubmit,
  placeholder,
  ariaLabel,
  clearAriaLabel,
  pendingAriaLabel,
  isPending = false,
}) {
  const handleChange = (event) => onChange(event.target.value);
  const handleClear = () => onChange("");
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.();
  };
  const handleKeyDown = (event) => {
    if (event.key !== "Enter") {
      return;
    }
    // preventDefault гасит неявную отправку формы — иначе submit прилетит дважды.
    event.preventDefault();
    onSubmit?.();
  };
  const showClearButton = value !== "";

  return (
    <form className="search-input" role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        className="search-input__field"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
      />
      {showClearButton ? (
        <button
          type="button"
          className="search-input__clear"
          onClick={handleClear}
          aria-label={clearAriaLabel}
        >
          <ModalCloseIcon size="lg" />
        </button>
      ) : null}
      {isPending ? (
        <span
          className="search-input__spinner"
          aria-label={pendingAriaLabel}
          role="status"
        />
      ) : null}
    </form>
  );
}
