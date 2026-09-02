import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

import "./CreateProductWizardInstagramLinkCard.css";

/**
 * Локальное поле визарда: ссылка Instagram (пока без API).
 *
 * @param {{
 *   value: string;
 *   onChange: (url: string) => void;
 *   disabled?: boolean;
 * }} props
 */
export function CreateProductWizardInstagramLinkCard({
  value,
  onChange,
  disabled = false,
}) {
  return (
    <section
      className="create-product-wizard-instagram-link"
      aria-label={CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_INSTAGRAM_TITLE}
    >
      <h4 className="create-product-wizard-instagram-link__label">
        {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_INSTAGRAM_TITLE}{" "}
        <span className="create-product-wizard-instagram-link__optional">
          {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_INSTAGRAM_OPTIONAL_TAG}
        </span>
      </h4>
      <p className="create-product-wizard-instagram-link__hint">
        {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_INSTAGRAM_LEAD}
      </p>
      <label className="create-product-wizard-instagram-link__field">
        <span className="create-product-wizard-instagram-link__field-label">
          {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_INSTAGRAM_LABEL}
        </span>
        <input
          type="url"
          className="create-product-wizard-instagram-link__input"
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          placeholder={CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_INSTAGRAM_PLACEHOLDER}
          disabled={disabled}
          autoComplete="off"
          inputMode="url"
          spellCheck={false}
        />
      </label>
    </section>
  );
}
