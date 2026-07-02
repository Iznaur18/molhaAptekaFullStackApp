import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
  type LayoutRectangle,
} from "react-native";

import type { FeaturedRaffleManage } from "@/entities/raffle/model/types";
import { RAFFLE_MANAGE_UI } from "@/shared/config";
import { useRaffleFeaturedBannerManageMenuStyles } from "@/shared/theme/raffleFeaturedStyles";

const MENU_GAP = 4;

type RaffleFeaturedBannerManageMenuProps = FeaturedRaffleManage;

type ManageMenuItem = {
  key: "edit" | "delete" | "pause";
  label: string;
  onPress: () => void;
  tone: "edit" | "delete" | "pause";
};

export const RaffleFeaturedBannerManageMenu = ({
  showEdit = false,
  showDelete = false,
  showPause = false,
  onEdit,
  onDelete,
  onPause,
  busy = false,
}: RaffleFeaturedBannerManageMenuProps) => {
  const styles = useRaffleFeaturedBannerManageMenuStyles();
  const toggleRef = useRef<View>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<LayoutRectangle | null>(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    toggleRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchor({ x, y, width, height });
      setMenuOpen(true);
    });
  }, []);

  const handleToggleMenu = useCallback(() => {
    if (busy) {
      return;
    }
    if (menuOpen) {
      closeMenu();
      return;
    }
    openMenu();
  }, [busy, closeMenu, menuOpen, openMenu]);

  const handleAction = useCallback(
    (action: () => void) => {
      closeMenu();
      action();
    },
    [closeMenu],
  );

  const items: ManageMenuItem[] = [];
  if (showEdit && onEdit) {
    items.push({
      key: "edit",
      label: RAFFLE_MANAGE_UI.EDIT,
      onPress: onEdit,
      tone: "edit",
    });
  }
  if (showDelete && onDelete) {
    items.push({
      key: "delete",
      label: RAFFLE_MANAGE_UI.DELETE,
      onPress: onDelete,
      tone: "delete",
    });
  }
  if (showPause && onPause) {
    items.push({
      key: "pause",
      label: RAFFLE_MANAGE_UI.PAUSE,
      onPress: onPause,
      tone: "pause",
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Pressable
        ref={toggleRef}
        style={[styles.toggle, menuOpen && styles.toggleOpen, busy && styles.toggleDisabled]}
        accessibilityRole="button"
        accessibilityLabel={RAFFLE_MANAGE_UI.GROUP_LABEL}
        accessibilityState={{ expanded: menuOpen, disabled: busy }}
        disabled={busy}
        onPress={handleToggleMenu}
      >
        <Text style={styles.toggleText}>⋯</Text>
      </Pressable>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={closeMenu}
          accessibilityLabel={RAFFLE_MANAGE_UI.MENU_CLOSE_ARIA}
        />
        {menuAnchor ? (
          <View
            style={[
              styles.menu,
              {
                top: menuAnchor.y + menuAnchor.height + MENU_GAP,
                right:
                  Dimensions.get("window").width - menuAnchor.x - menuAnchor.width,
              },
            ]}
          >
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <Pressable
                  key={item.key}
                  style={[
                    styles.menuItem,
                    item.tone === "edit" && styles.menuItemEdit,
                    item.tone === "delete" && styles.menuItemDelete,
                    item.tone === "pause" && styles.menuItemPause,
                    isLast && styles.menuItemLast,
                  ]}
                  onPress={() => handleAction(item.onPress)}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      item.tone === "edit" && styles.menuItemTextEdit,
                      item.tone === "delete" && styles.menuItemTextDelete,
                      item.tone === "pause" && styles.menuItemTextPause,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </Modal>
    </>
  );
};
