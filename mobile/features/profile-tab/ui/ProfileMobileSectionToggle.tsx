import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";

import { MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useProfileMobileNavToggleStyles } from "@/shared/theme/profileChromeStyles";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

type ProfileMobileSectionToggleProps = {
  activeLabel: string;
  onPress: () => void;
};

export const ProfileMobileSectionToggle = ({
  activeLabel,
  onPress,
}: ProfileMobileSectionToggleProps) => {
  const styles = useProfileMobileNavToggleStyles();
  const { theme } = useAppThemeSettings();

  return (
    <Pressable
      style={styles.root}
      accessibilityRole="button"
      accessibilityLabel={MY_PROFILE_PAGE_UI.MOBILE_NAV_TOGGLE_ARIA}
      onPress={onPress}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name="menu" size={20} color={theme.colors.action} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.caption}>{MY_PROFILE_PAGE_UI.MOBILE_NAV_CURRENT_SECTION}</Text>
        <Text style={styles.label} numberOfLines={1}>
          {activeLabel}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={theme.colors.textMuted} />
    </Pressable>
  );
};
