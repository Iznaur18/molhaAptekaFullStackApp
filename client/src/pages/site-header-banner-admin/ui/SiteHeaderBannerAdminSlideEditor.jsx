import {
  normalizeSiteHeaderBannerHexColor,
  resolveSiteHeaderBannerColorInputValue,
} from "../../../entities/site-header-banner/lib/resolvePreviewSiteHeaderBannerSlidesFromForm.js";
import { SITE_HEADER_BANNER_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";

/**
 * @param {{
 *   value: string;
 *   disabled?: boolean;
 *   onChange: (value: string) => void;
 * }} props
 */
function SiteHeaderBannerColorField({ value, disabled = false, onChange }) {
  return (
    <div className="site-header-banner-admin__color-field">
      <input
        className="site-header-banner-admin__color-picker"
        type="color"
        value={resolveSiteHeaderBannerColorInputValue(value)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value.toLowerCase())}
        aria-label={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_BACKGROUND_COLOR}
      />
      <input
        className="site-header-banner-admin__input"
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="#RRGGBB"
        spellCheck={false}
      />
    </div>
  );
}

/**
 * @param {{
 *   item: {
 *     id: string;
 *     enabled: boolean;
 *     imageUrl: string;
 *     imageAlt: string;
 *     linkPath: string;
 *     backgroundColor: string;
 *   };
 *   index: number;
 *   disabled?: boolean;
 *   onChange: (patch: Record<string, unknown>) => void;
 *   onRemove: () => void;
 * }} props
 */
export function SiteHeaderBannerAdminSlideEditor({
  item,
  index,
  disabled = false,
  onChange,
  onRemove,
}) {
  return (
    <div className="site-header-banner-admin__slide-editor">
      <div className="site-header-banner-admin__slide-editor-head">
        <h3 className="site-header-banner-admin__slide-editor-title">
          {SITE_HEADER_BANNER_ADMIN_PAGE_UI.ITEM_TITLE(index + 1)}
        </h3>
      </div>

      <div className="site-header-banner-admin__field-block">
        <label className="site-header-banner-admin__checkbox">
          <input
            type="checkbox"
            checked={item.enabled}
            disabled={disabled}
            onChange={(event) => onChange({ enabled: event.target.checked })}
          />
          <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_ITEM_ENABLED}</span>
        </label>
      </div>

      <div className="site-header-banner-admin__field-block">
        <ImageUrlField
          label={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_IMAGE}
          value={item.imageUrl}
          disabled={disabled}
          onChange={(value) => onChange({ imageUrl: value })}
        />
        <p className="site-header-banner-admin__field-hint">
          {SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT_IMAGE}
        </p>
      </div>

      <div className="site-header-banner-admin__field-block">
        <label className="site-header-banner-admin__label">
          <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_IMAGE_ALT}</span>
          <input
            className="site-header-banner-admin__input"
            value={item.imageAlt}
            disabled={disabled}
            onChange={(event) => onChange({ imageAlt: event.target.value })}
            maxLength={200}
          />
        </label>
      </div>

      <div className="site-header-banner-admin__field-block">
        <label className="site-header-banner-admin__label">
          <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_LINK_PATH}</span>
          <input
            className="site-header-banner-admin__input"
            value={item.linkPath}
            disabled={disabled}
            onChange={(event) => onChange({ linkPath: event.target.value })}
            placeholder={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LINK_PATH_PLACEHOLDER}
          />
        </label>
        <p className="site-header-banner-admin__field-hint">
          {SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT_LINK_PATH}
        </p>
      </div>

      <div className="site-header-banner-admin__field-block">
        <label className="site-header-banner-admin__label">
          <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_BACKGROUND_COLOR}</span>
          <SiteHeaderBannerColorField
            value={item.backgroundColor}
            disabled={disabled}
            onChange={(backgroundColor) => {
              const normalized = normalizeSiteHeaderBannerHexColor(backgroundColor);
              onChange({
                backgroundColor: normalized ?? backgroundColor,
              });
            }}
          />
        </label>
      </div>

      <div className="site-header-banner-admin__field-block site-header-banner-admin__field-block_actions">
        <button
          type="button"
          className="site-header-banner-admin__btn site-header-banner-admin__btn_danger"
          disabled={disabled}
          onClick={onRemove}
        >
          {SITE_HEADER_BANNER_ADMIN_PAGE_UI.REMOVE_ITEM}
        </button>
      </div>
    </div>
  );
}
