import { Home, Menu, Plus, ShoppingCart, User } from "lucide-react";

import { useCart } from "../../../entities/cart/model/useCart.js";
import {
  HEADER_CART_BUTTON_UI,
  HEADER_NOTIFICATIONS_BUTTON_UI,
  HEADER_PLACE_PRODUCT_BUTTON_UI,
  HEADER_PROFILE_BUTTON_UI,
  HOME_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "./MobileBottomNav.css";

/**
 * @param {{
 *   isHomeActive: boolean;
 *   isCatalogActive: boolean;
 *   isCartActive: boolean;
 *   isProfileActive: boolean;
 *   isAuthorized: boolean;
 *   unreadNotificationsCount?: number;
 *   onHomeClick: () => void;
 *   onCatalogClick: () => void;
 *   onPlaceProductClick: () => void;
 *   onLoginClick: () => void;
 *   onCartClick: () => void;
 *   onProfileClick: () => void;
 * }} props
 */
export function MobileBottomNav({
  isHomeActive,
  isCatalogActive,
  isCartActive,
  isProfileActive,
  isAuthorized,
  unreadNotificationsCount = 0,
  onHomeClick,
  onCatalogClick,
  onPlaceProductClick,
  onLoginClick,
  onCartClick,
  onProfileClick,
}) {
  const { totalCount } = useCart();
  const cartBadge = totalCount > 0 ? totalCount : null;
  const profileBadge =
    isAuthorized && unreadNotificationsCount > 0 ? unreadNotificationsCount : null;

  const handlePlaceProductClick = () => {
    if (isAuthorized) {
      onPlaceProductClick();
      return;
    }

    onLoginClick();
  };

  const handleProfileClick = () => {
    if (isAuthorized) {
      onProfileClick();
      return;
    }

    onLoginClick();
  };

  return (
    <nav className="mobile-bottom-nav" aria-label={HOME_PAGE_UI.NAV_MOBILE_BOTTOM_ARIA}>
      <MobileBottomNavItem
        ariaLabel={HOME_PAGE_UI.NAV_MOBILE_HOME_ARIA}
        icon={Home}
        isActive={isHomeActive}
        onClick={onHomeClick}
      />
      <MobileBottomNavItem
        ariaLabel={HOME_PAGE_UI.CATALOG_MENU_BUTTON_ARIA}
        icon={Menu}
        isActive={isCatalogActive}
        onClick={onCatalogClick}
      />
      <MobileBottomNavItem
        ariaLabel={
          isAuthorized
            ? HEADER_PLACE_PRODUCT_BUTTON_UI.ARIA
            : HEADER_PLACE_PRODUCT_BUTTON_UI.ARIA_LOGIN_REQUIRED
        }
        icon={Plus}
        onClick={handlePlaceProductClick}
      />
      <MobileBottomNavItem
        ariaLabel={HEADER_CART_BUTTON_UI.ARIA}
        icon={ShoppingCart}
        isActive={isCartActive}
        badgeContent={cartBadge}
        badgeAriaLabel={
          cartBadge != null ? HEADER_CART_BUTTON_UI.COUNT_ARIA : undefined
        }
        onClick={onCartClick}
      />
      <MobileBottomNavItem
        ariaLabel={HEADER_PROFILE_BUTTON_UI.ARIA}
        icon={User}
        isActive={isProfileActive}
        badgeContent={profileBadge}
        badgeAriaLabel={
          profileBadge != null ? HEADER_NOTIFICATIONS_BUTTON_UI.COUNT_ARIA : undefined
        }
        onClick={handleProfileClick}
      />
    </nav>
  );
}

/**
 * @param {{
 *   ariaLabel: string;
 *   icon: import("lucide-react").LucideIcon;
 *   isActive?: boolean;
 *   badgeContent?: number | null;
 *   badgeAriaLabel?: string;
 *   onClick: () => void;
 * }} props
 */
function MobileBottomNavItem({
  ariaLabel,
  icon,
  isActive = false,
  badgeContent = null,
  badgeAriaLabel,
  onClick,
}) {
  const itemClassName = [
    "mobile-bottom-nav__item",
    isActive && "mobile-bottom-nav__item--active",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={itemClassName} aria-label={ariaLabel} onClick={onClick}>
      <span className="mobile-bottom-nav__icon-wrap">
        <AppIcon icon={icon} size="xl" strokeWidth={2.25} className="mobile-bottom-nav__icon" />
        {badgeContent != null ? (
          <span
            className="mobile-bottom-nav__badge"
            aria-label={badgeAriaLabel}
            title={badgeAriaLabel}
          >
            {badgeContent > 99 ? "99+" : badgeContent}
          </span>
        ) : null}
      </span>
    </button>
  );
}
