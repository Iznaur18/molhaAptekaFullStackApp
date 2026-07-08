import { resolveProfileNavSectionTone } from "@izibuy/shared-lib";
import {
  Clapperboard,
  ClipboardCheck,
  CreditCard,
  Crown,
  Flag,
  FolderTree,
  Gavel,
  Gift,
  Heart,
  LayoutDashboard,
  Image,
  ListOrdered,
  Star,
  LogOut,
  MessageSquareWarning,
  Megaphone,
  Package,
  Pencil,
  Scale,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Ticket,
  ToggleLeft,
  UserCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

/** @typedef {import("lucide-react").LucideIcon} LucideIcon */

/** @type {Record<string, { icon: LucideIcon }>} */
export const PROFILE_NAV_ITEM_META = {
  overview: { icon: LayoutDashboard },
  "my-products": { icon: Package },
  "my-sales": { icon: Store },
  "my-orders": { icon: ShoppingBag },
  auction: { icon: Gavel },
  "installment-payments": { icon: CreditCard },
  "installment-sales": { icon: Wallet },
  subscriptions: { icon: Users },
  wishlist: { icon: Heart },
  "data-confirmation": { icon: ShieldCheck },
  premium: { icon: Crown },
  "loyalty-points": { icon: Sparkles },
  advertising: { icon: Megaphone },
  "edit-profile": { icon: Pencil },
  "create-raffle": { icon: Gift },
  "product-moderation": { icon: ClipboardCheck },
  "intro-ad-moderation": { icon: Megaphone },
  "seller-personal-category-moderation": { icon: FolderTree },
  "product-reports": { icon: Flag },
  "product-promotions": { icon: TrendingUp },
  raffles: { icon: Ticket },
  "data-confirmation-requests": { icon: UserCheck },
  "installment-moderation": { icon: Scale },
  "installment-disputes": { icon: MessageSquareWarning },
  "admin-orders": { icon: ListOrdered },
  "search-synonyms-admin": { icon: Search },
  "category-tree-admin": { icon: FolderTree },
  "app-intro-admin": { icon: Clapperboard },
  "site-header-banner-admin": { icon: Image },
  "product-manage-toggle-display-admin": { icon: ToggleLeft },
  "popular-products-admin": { icon: Star },
  logout: { icon: LogOut },
};

/**
 * @param {{ tab: string } & Record<string, unknown>} item
 */
export function enrichProfileNavItem(item) {
  const meta = PROFILE_NAV_ITEM_META[item.tab];
  if (!meta) {
    return {
      ...item,
      tone: resolveProfileNavSectionTone(item.tab),
    };
  }

  return {
    ...item,
    icon: meta.icon,
    tone: resolveProfileNavSectionTone(item.tab),
  };
}
