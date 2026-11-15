import { usePathname, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { useViewerRegion } from "@/entities/region/model/ViewerRegionProvider";
import { RuRegionPickerSheet } from "@/entities/region/ui/RuRegionPickerSheet";
import { buildHomeCatalogUsersMenuItems } from "@/features/home-feed/lib/buildHomeCatalogUsersMenuItems";
import { HomeCatalogUsersStretchMenu } from "@/features/home-feed/ui/HomeCatalogUsersStretchMenu";

const USERS_ROUTE = "/users";

type HomeCatalogUsersButtonProps = {
  embeddedInForegroundSheet?: boolean;
};

export const HomeCatalogUsersButton = ({
  embeddedInForegroundSheet = false,
}: HomeCatalogUsersButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { viewerRegionCode, setViewerRegionCode } = useViewerRegion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const menuItems = useMemo(() => buildHomeCatalogUsersMenuItems(), []);
  const isUsersActive =
    pathname === USERS_ROUTE || pathname.startsWith(`${USERS_ROUTE}/`);
  const isTermsActive = pathname === "/legal/terms";
  const isFaqActive = pathname === "/faq";

  const handleToggleMenu = useCallback(() => {
    setMenuOpen((current) => !current);
  }, []);

  const handleItemPress = useCallback(
    (item: (typeof menuItems)[number]) => {
      setMenuOpen(false);
      if (item.key === "region") {
        setRegionOpen(true);
        return;
      }
      if (!item.href) {
        return;
      }
      router.push(item.href as never);
    },
    [router],
  );

  return (
    <>
      <HomeCatalogUsersStretchMenu
        open={menuOpen}
        items={menuItems}
        activeItemKey={
          isUsersActive ? "users" : isTermsActive ? "terms" : isFaqActive ? "faq" : null
        }
        embeddedInForegroundSheet={embeddedInForegroundSheet}
        onToggle={handleToggleMenu}
        onItemPress={handleItemPress}
      />
      <RuRegionPickerSheet
        open={regionOpen}
        value={viewerRegionCode}
        onClose={() => setRegionOpen(false)}
        onSelect={(code) => {
          setViewerRegionCode(code);
          setRegionOpen(false);
        }}
      />
    </>
  );
};
