import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { HEADER_USERS_BUTTON_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon, LayoutGrid } from "../../../shared/ui/icon/index.js";
import { buildHeaderUsersMenuItems } from "../lib/buildHeaderUsersMenuItems.js";
import {
  HEADER_USERS_STRETCH_ANIM_MS,
  HEADER_USERS_STRETCH_ICON_SIZE_PX,
  resolveHeaderUsersStretchMenuHeight,
} from "../lib/headerUsersStretchLayout.js";

import "./HeaderUsersStretchMenu.css";

const MENU_ITEMS = buildHeaderUsersMenuItems();
const OPEN_HEIGHT_PX = resolveHeaderUsersStretchMenuHeight(MENU_ITEMS.length);

/**
 * @param {{
 *   activeItemKey?: import("../lib/buildHeaderUsersMenuItems.js").HeaderUsersMenuItemKey | null;
 *   onItemAction: (action: import("../lib/buildHeaderUsersMenuItems.js").HeaderUsersMenuItemAction) => void;
 * }} props
 */
export function HeaderUsersStretchMenu({ activeItemKey = null, onItemAction }) {
  const menuId = useId();
  const anchorRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [isOpen, setIsOpen] = useState(false);
  const [portalVisible, setPortalVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [portalAnchor, setPortalAnchor] = useState(
    /** @type {{ top: number; left: number } | null} */ (null),
  );

  const measureAnchor = () => {
    const node = anchorRef.current;
    if (!node) {
      return null;
    }

    const rect = node.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
    };
  };

  useEffect(() => {
    if (isOpen) {
      setPortalVisible(true);
      const frame = requestAnimationFrame(() => {
        setIsExpanded(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    setIsExpanded(false);
    if (!portalVisible) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPortalVisible(false);
      setPortalAnchor(null);
    }, HEADER_USERS_STRETCH_ANIM_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, portalVisible]);

  useLayoutEffect(() => {
    if (!portalVisible) {
      return undefined;
    }

    const update = () => {
      setPortalAnchor(measureAnchor());
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [portalVisible]);

  useEffect(() => {
    if (!portalVisible) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [portalVisible]);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setPortalAnchor(measureAnchor());
    setIsOpen(true);
  };

  const handleItemClick = (item) => {
    if (!item.action) {
      return;
    }

    setIsOpen(false);
    onItemAction(item.action);
  };

  const shellClassName = [
    "header-users-stretch__shell",
    isExpanded && "header-users-stretch__shell--open",
  ]
    .filter(Boolean)
    .join(" ");

  const renderShell = (extraClassName, style) => (
    <div
      className={[shellClassName, extraClassName].filter(Boolean).join(" ")}
      style={{
        ...style,
        "--header-users-stretch-open-height": `${OPEN_HEIGHT_PX}px`,
      }}
      role="menu"
      id={menuId}
      aria-label={HEADER_USERS_BUTTON_UI.MENU_ARIA}
    >
      <button
        type="button"
        className="header-users-stretch__toggle"
        onClick={handleToggle}
        aria-label={HEADER_USERS_BUTTON_UI.TOGGLE_ARIA}
        aria-expanded={isOpen || isExpanded}
        aria-controls={menuId}
      >
        {isExpanded ? (
          <span className="header-users-stretch__toggle-circle">
            <AppIcon icon={LayoutGrid} size={HEADER_USERS_STRETCH_ICON_SIZE_PX} />
          </span>
        ) : (
          <AppIcon icon={LayoutGrid} size={HEADER_USERS_STRETCH_ICON_SIZE_PX} />
        )}
      </button>
      <div className="header-users-stretch__items" aria-hidden={!isExpanded}>
        {MENU_ITEMS.map((item) => {
          const isActive = item.key === activeItemKey;
          const itemClassName = [
            "header-users-stretch__item",
            isActive && "header-users-stretch__item--active",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={item.key}
              type="button"
              className={itemClassName}
              role="menuitem"
              aria-label={item.accessibilityLabel}
              disabled={!item.action}
              tabIndex={isExpanded ? 0 : -1}
              onClick={() => handleItemClick(item)}
            >
              <AppIcon icon={item.icon} size={HEADER_USERS_STRETCH_ICON_SIZE_PX} />
            </button>
          );
        })}
      </div>
    </div>
  );

  const showPortal = portalVisible && portalAnchor != null;

  return (
    <div className="header-users-stretch" ref={anchorRef}>
      {showPortal ? (
        <div className="header-users-stretch__placeholder" aria-hidden="true" />
      ) : (
        renderShell()
      )}
      {showPortal
        ? createPortal(
            <>
              <button
                type="button"
                className="header-users-stretch__backdrop"
                aria-label={HEADER_USERS_BUTTON_UI.MENU_CLOSE_ARIA}
                onClick={handleToggle}
              />
              {renderShell("header-users-stretch__shell--portal", {
                top: portalAnchor.top,
                left: portalAnchor.left,
              })}
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
