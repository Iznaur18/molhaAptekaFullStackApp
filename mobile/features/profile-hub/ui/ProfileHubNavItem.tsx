import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";

import { buildProfileNavItemPresentation } from "@/features/profile-hub/lib/profileNavItemPresentation";
import type { EnrichedProfileNavItem } from "@/features/profile-hub/lib/enrichProfileNavItem";
import { MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useProfileHubMenuStyles } from "@/shared/theme/profileChromeStyles";

type ProfileHubNavItemProps = {
  item: EnrichedProfileNavItem;
  isActive: boolean;
  onPress: () => void;
};

export const ProfileHubNavItem = ({ item, isActive, onPress }: ProfileHubNavItemProps) => {
  const { theme, colorScheme } = useAppThemeSettings();
  const styles = useProfileHubMenuStyles();
  const isCta = item.variant === "cta";
  const isDisabled = item.disabled === true;
  const presentation = buildProfileNavItemPresentation(item.tone, {
    isActive,
    isCta,
    colorScheme,
    onContrastColor: theme.colors.onContrast,
  });

  return (
    <Pressable
      style={[
        styles.item,
        presentation.container,
        isDisabled && styles.itemDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityState={{ selected: isActive }}
    >
      <View style={[styles.itemIconWrap, presentation.iconWrap]}>
        <MaterialIcons name={item.iconName} size={18} color={presentation.iconColor} />
      </View>
      <Text
        style={[
          styles.itemLabel,
          presentation.label,
          !isActive && !isCta ? { color: theme.colors.textSecondary } : null,
          isDisabled && styles.itemLabelDisabled,
        ]}
      >
        {item.label}
      </Text>
      {item.showAlert ? <View style={styles.alertDot} /> : null}
      {item.badgeCount != null && item.badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {MY_PROFILE_PAGE_UI.TAB_BADGE(item.badgeCount)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};
