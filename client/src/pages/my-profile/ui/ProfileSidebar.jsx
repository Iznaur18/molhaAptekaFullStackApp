import { MY_PROFILE_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { ProfileTabAlert } from "./ProfileTabAlert.jsx";
import { ProfileTabBadge } from "./ProfileTabBadge.jsx";

/**
 * @typedef {{
 *   tab: string;
 *   label: string;
 *   badgeCount?: number;
 *   showAlert?: boolean;
 *   disabled?: boolean;
 *   onClick: () => void;
 *   variant?: "default" | "cta" | "danger";
 *   icon?: import("lucide-react").LucideIcon;
 *   tone?: string;
 * }} ProfileNavItemConfig
 */

/**
 * @typedef {{
 *   id: string;
 *   label?: string;
 *   items: ProfileNavItemConfig[];
 * }} ProfileNavGroup
 */

/**
 * @param {{
 *   groups: ProfileNavGroup[];
 *   activeTab: string;
 * }} props
 */
export function ProfileSidebar({ groups, activeTab }) {
  return (
    <aside className="my-profile-page__sidebar" aria-label={MY_PROFILE_PAGE_UI.NAV_ARIA}>
      <div className="my-profile-page__sidebar-head">
        <h2 className="my-profile-page__title">{MY_PROFILE_PAGE_UI.TAB_TITLE}</h2>
      </div>
      <nav className="my-profile-page__nav">
        {groups.map((group) => (
          <div key={group.id} className="my-profile-page__nav-group">
            {group.label ? (
              <p className="my-profile-page__nav-group-label">{group.label}</p>
            ) : null}
            <ul className="my-profile-page__nav-list" role="list">
              {group.items.map((item) => {
                const isActive = activeTab === item.tab;
                const hasBadge = (item.badgeCount ?? 0) > 0;
                const hasAlert = item.showAlert === true;

                return (
                  <li key={item.tab} className="my-profile-page__nav-item">
                    <button
                      type="button"
                      className={[
                        "my-profile-page__nav-button",
                        isActive ? "my-profile-page__nav-button_active" : "",
                        item.variant === "cta" ? "my-profile-page__nav-button_cta" : "",
                        item.variant === "danger" ? "my-profile-page__nav-button_danger" : "",
                        hasBadge || hasAlert ? "my-profile-page__nav-button_badge" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      data-tone={item.tone ?? "slate"}
                      disabled={item.disabled}
                      aria-current={isActive ? "page" : undefined}
                      onClick={item.onClick}
                    >
                      <span className="my-profile-page__nav-button-main">
                        {item.icon ? (
                          <span className="my-profile-page__nav-icon" aria-hidden="true">
                            <AppIcon icon={item.icon} size="sm" strokeWidth={2.25} />
                          </span>
                        ) : null}
                        <span className="my-profile-page__nav-button-label">{item.label}</span>
                      </span>
                      <ProfileTabAlert show={hasAlert} />
                      <ProfileTabBadge count={item.badgeCount ?? 0} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
