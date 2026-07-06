import { usePathname, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { buildHomeCatalogUsersMenuItems } from "@/features/home-feed/lib/buildHomeCatalogUsersMenuItems";
import { HomeCatalogUsersStretchMenu } from "@/features/home-feed/ui/HomeCatalogUsersStretchMenu";

const USERS_ROUTE = "/users";

export const HomeCatalogUsersButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const sessionQuery = useAuthSessionQuery();
  const isAuthorized = sessionQuery.data?.user != null;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuItems = useMemo(() => buildHomeCatalogUsersMenuItems(), []);
  const isUsersActive = pathname === USERS_ROUTE || pathname.startsWith(`${USERS_ROUTE}/`);

  const handleToggleMenu = useCallback(() => {
    setMenuOpen((current) => !current);
  }, []);

  const handleItemPress = useCallback(
    (item: (typeof menuItems)[number]) => {
      if (!item.href) {
        return;
      }

      setMenuOpen(false);
      router.push(item.href as never);
    },
    [router],
  );

  if (!isAuthorized) {
    return null;
  }

  return (
    <HomeCatalogUsersStretchMenu
      open={menuOpen}
      items={menuItems}
      activeItemKey={isUsersActive ? "users" : null}
      onToggle={handleToggleMenu}
      onItemPress={handleItemPress}
    />
  );
};
