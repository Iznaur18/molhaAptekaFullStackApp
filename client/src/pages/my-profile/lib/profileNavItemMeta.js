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
  UserCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

/** @typedef {import("lucide-react").LucideIcon} LucideIcon */

/** @type {Record<string, { icon: LucideIcon; tone: string }>} */
export const PROFILE_NAV_ITEM_META = {
  overview: { icon: LayoutDashboard, tone: "indigo" },
  "my-products": { icon: Package, tone: "sky" },
  "my-sales": { icon: Store, tone: "emerald" },
  "my-orders": { icon: ShoppingBag, tone: "blue" },
  auction: { icon: Gavel, tone: "amber" },
  "installment-payments": { icon: CreditCard, tone: "teal" },
  "installment-sales": { icon: Wallet, tone: "cyan" },
  subscriptions: { icon: Users, tone: "violet" },
  wishlist: { icon: Heart, tone: "rose" },
  "data-confirmation": { icon: ShieldCheck, tone: "green" },
  premium: { icon: Crown, tone: "gold" },
  "loyalty-points": { icon: Sparkles, tone: "pink" },
  advertising: { icon: Megaphone, tone: "orange" },
  "edit-profile": { icon: Pencil, tone: "slate" },
  "create-raffle": { icon: Gift, tone: "purple" },
  "product-moderation": { icon: ClipboardCheck, tone: "orange" },
  "intro-ad-moderation": { icon: Megaphone, tone: "amber" },
  "seller-personal-category-moderation": { icon: FolderTree, tone: "teal" },
  "product-reports": { icon: Flag, tone: "rose" },
  "product-promotions": { icon: TrendingUp, tone: "sky" },
  raffles: { icon: Ticket, tone: "fuchsia" },
  "data-confirmation-requests": { icon: UserCheck, tone: "lime" },
  "installment-moderation": { icon: Scale, tone: "indigo" },
  "installment-disputes": { icon: MessageSquareWarning, tone: "red" },
  "admin-orders": { icon: ListOrdered, tone: "blue" },
  "search-synonyms-admin": { icon: Search, tone: "sky" },
  "category-tree-admin": { icon: FolderTree, tone: "emerald" },
  "app-intro-admin": { icon: Clapperboard, tone: "violet" },
  "site-header-banner-admin": { icon: Image, tone: "sky" },
  "popular-products-admin": { icon: Star, tone: "amber" },
  logout: { icon: LogOut, tone: "rose" },
};

/**
 * @param {{ tab: string } & Record<string, unknown>} item
 */
export function enrichProfileNavItem(item) {
  const meta = PROFILE_NAV_ITEM_META[item.tab];
  if (!meta) {
    return item;
  }

  return {
    ...item,
    icon: meta.icon,
    tone: meta.tone,
  };
}
