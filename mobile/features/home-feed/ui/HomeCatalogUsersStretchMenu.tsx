import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  View,
  type LayoutRectangle,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";

import type { HomeCatalogUsersMenuItem } from "@/features/home-feed/lib/buildHomeCatalogUsersMenuItems";
import { useHomeCatalogUsersStretchMenuAnimation } from "@/features/home-feed/model/useHomeCatalogUsersStretchMenuAnimation";
import { HEADER_USERS_BUTTON_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useHomeCatalogHeaderStyles } from "@/shared/theme/homeCatalogHeaderStyles";

type HomeCatalogUsersStretchMenuProps = {
  open: boolean;
  items: HomeCatalogUsersMenuItem[];
  activeItemKey: HomeCatalogUsersMenuItem["key"] | null;
  onToggle: () => void;
  onItemPress: (item: HomeCatalogUsersMenuItem) => void;
};

export const HomeCatalogUsersStretchMenu = ({
  open,
  items,
  activeItemKey,
  onToggle,
  onItemPress,
}: HomeCatalogUsersStretchMenuProps) => {
  const styles = useHomeCatalogHeaderStyles();
  const { theme } = useAppThemeSettings();
  const anchorRef = useRef<View>(null);
  const [menuAnchor, setMenuAnchor] = useState<LayoutRectangle | null>(null);
  const { shellAnimatedStyle, itemsAnimatedStyle } = useHomeCatalogUsersStretchMenuAnimation({
    open,
    itemCount: items.length,
    closedBackgroundColor: theme.colors.surface,
    openBackgroundColor: theme.colors.surface,
    closedBorderColor: theme.colors.border,
    openBorderColor: theme.colors.border,
  });

  const measureAnchor = useCallback(() => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchor({ x, y, width, height });
    });
  }, []);

  const handleToggle = useCallback(() => {
    if (open) {
      onToggle();
      return;
    }

    anchorRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchor({ x, y, width, height });
      onToggle();
    });
  }, [onToggle, open]);

  const handleItemPress = useCallback(
    (item: HomeCatalogUsersMenuItem) => {
      onItemPress(item);
    },
    [onItemPress],
  );

  const renderShellBody = () => (
    <>
      <Pressable
        style={styles.usersStretchToggle}
        accessibilityRole="button"
        accessibilityLabel={HEADER_USERS_BUTTON_UI.TOGGLE_ARIA}
        accessibilityState={{ expanded: open }}
        onPress={handleToggle}
      >
        {open ? (
          <View style={styles.usersStretchIconCircle}>
            <MaterialIcons name="visibility" size={22} color={theme.colors.textSecondary} />
          </View>
        ) : (
          <MaterialIcons name="visibility" size={22} color={theme.colors.textSecondary} />
        )}
      </Pressable>

      <Animated.View style={[styles.usersStretchItems, itemsAnimatedStyle]}>
        {items.map((item) => {
          const isActive = item.key === activeItemKey;
          const iconColor = isActive ? theme.colors.action : theme.colors.textSecondary;

          return (
            <Pressable
              key={item.key}
              style={[styles.usersStretchItem, isActive && styles.usersStretchItemActive]}
              accessibilityRole="menuitem"
              accessibilityLabel={item.accessibilityLabel}
              onPress={() => handleItemPress(item)}
            >
              <MaterialIcons name={item.icon} size={22} color={iconColor} />
            </Pressable>
          );
        })}
      </Animated.View>
    </>
  );

  const renderShell = (shellStyle?: StyleProp<ViewStyle>) => (
    <Animated.View
      style={[styles.usersStretchShell, shellStyle, shellAnimatedStyle]}
      accessibilityRole="menu"
      accessibilityLabel={HEADER_USERS_BUTTON_UI.MENU_ARIA}
    >
      {renderShellBody()}
    </Animated.View>
  );

  const portalShellStyle =
    menuAnchor == null
      ? null
      : {
          top: menuAnchor.y,
          right: Dimensions.get("window").width - menuAnchor.x - menuAnchor.width,
        };

  return (
    <>
      <View ref={anchorRef} style={styles.usersNavPill} onLayout={measureAnchor}>
        {open ? <View style={styles.usersNavPillPlaceholder} /> : renderShell()}
      </View>

      <Modal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleToggle}
      >
        <Pressable
          style={styles.usersMenuPortalBackdrop}
          onPress={handleToggle}
          accessibilityLabel={HEADER_USERS_BUTTON_UI.MENU_CLOSE_ARIA}
        />
        {portalShellStyle ? renderShell([styles.usersStretchShellPortal, portalShellStyle]) : null}
      </Modal>
    </>
  );
};
