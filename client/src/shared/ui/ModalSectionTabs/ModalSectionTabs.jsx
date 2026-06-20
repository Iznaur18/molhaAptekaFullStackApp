import "./ModalSectionTabs.css";

/**
 * @param {{
 *   tabs: ReadonlyArray<{ id: string; label: string }>;
 *   activeTabId: string;
 * onTabChange: (tabId: string) => void;
 *   ariaLabel?: string;
 *   className?: string;
 * }} props
 */
export function ModalSectionTabs({
  tabs,
  activeTabId,
  onTabChange,
  ariaLabel,
  className = "",
}) {
  const rootClassName = ["modal-section-tabs", className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[
              "modal-section-tabs__tab",
              isActive ? "modal-section-tabs__tab_active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
