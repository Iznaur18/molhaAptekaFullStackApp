import { SITE_HEADER_BANNER_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   items: Array<{
 *     id: string;
 *     enabled: boolean;
 *     imageUrl: string;
 *     imageAlt: string;
 *   }>;
 *   selectedItemId: string | null;
 *   disabled?: boolean;
 *   onSelect: (itemId: string) => void;
 * }} props
 */
export function SiteHeaderBannerAdminSlideList({
  items,
  selectedItemId,
  disabled = false,
  onSelect,
}) {
  if (items.length === 0) {
    return (
      <p className="site-header-banner-admin__slide-list-empty">
        {SITE_HEADER_BANNER_ADMIN_PAGE_UI.EMPTY_ITEMS}
      </p>
    );
  }

  return (
    <ul className="site-header-banner-admin__slide-list" role="list">
      {items.map((item, index) => {
        const isActive = item.id === selectedItemId;
        const label = item.imageAlt.trim() || SITE_HEADER_BANNER_ADMIN_PAGE_UI.ITEM_TITLE(index + 1);

        return (
          <li key={item.id}>
            <button
              type="button"
              className={[
                "site-header-banner-admin__slide-list-item",
                isActive ? "site-header-banner-admin__slide-list-item_active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={disabled}
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelect(item.id)}
            >
              <span className="site-header-banner-admin__slide-list-index">{index + 1}</span>
              <span className="site-header-banner-admin__slide-list-body">
                <span className="site-header-banner-admin__slide-list-label">{label}</span>
                {!item.enabled ? (
                  <span className="site-header-banner-admin__slide-list-badge">
                    {SITE_HEADER_BANNER_ADMIN_PAGE_UI.ITEM_DISABLED_BADGE}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
