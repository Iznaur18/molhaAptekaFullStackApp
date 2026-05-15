import { useEffect, useRef, useState } from "react";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../model/productConstants.js";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

import "./CreateProductCategorySelect.css";

/**
 * Кастомный выбор категории вместо нативного &lt;select&gt; внутри прокручиваемой модалки
 * (устраняет рывки выпадающего списка ОС).
 *
 * @param {{
 *   value: import('../model/types.js').ProductCategory;
 *   onChange: (category: import('../model/types.js').ProductCategory) => void;
 *   disabled?: boolean;
 * }} props
 */
export function CreateProductCategorySelect({
  value,
  onChange,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      const root = rootRef.current;
      if (
        root &&
        event.target instanceof Node &&
        !root.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) setIsOpen((prev) => !prev);
  };

  const handlePick = (category) => {
    onChange(category);
    setIsOpen(false);
  };

  /** Не отдаём колесо прокрутки родителю (модалка / страница). */
  const handleCategoryMenuWheel = (event) => {
    event.stopPropagation();
  };

  return (
    <div className="create-product-category-select" ref={rootRef}>
      <span className="create-product-category-select__legend">
        {CREATE_PRODUCT_MODAL_UI.LABEL_CATEGORY}
      </span>
      <button
        type="button"
        className="create-product-category-select__trigger"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={handleToggle}
      >
        <span className="create-product-category-select__value">
          {PRODUCT_CATEGORY_LABEL_RU[value]}
        </span>
        <span className="create-product-category-select__chevron" aria-hidden>
          ▾
        </span>
      </button>
      {isOpen ? (
        <ul
          className="create-product-category-select__menu"
          role="listbox"
          onWheel={handleCategoryMenuWheel}
        >
          {PRODUCT_CATEGORIES.map((category) => (
            <li key={category} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={category === value}
                className={
                  category === value
                    ? "create-product-category-select__option create-product-category-select__option_selected"
                    : "create-product-category-select__option"
                }
                onClick={() => handlePick(category)}
              >
                {PRODUCT_CATEGORY_LABEL_RU[category]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
