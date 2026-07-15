import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import {
  PROFILE_MOBILE_NAV_TOGGLE_BORDER_RADIUS,
  useProfileMobileNavToggleStyles,
} from "@/shared/theme/profileChromeStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

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
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.outer, animatedStyle]}>
      <Pressable
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityLabel={MY_PROFILE_PAGE_UI.MOBILE_NAV_TOGGLE_ARIA}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 18, stiffness: 350 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 350 });
        }}
      >
        <SquircleView
          radius={PROFILE_MOBILE_NAV_TOGGLE_BORDER_RADIUS}
          style={styles.root}
          shadowStyle={styles.shadow}
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
          <MaterialIcons name="expand-more" size={24} color={theme.colors.onContrast} />
        </SquircleView>
      </Pressable>
    </Animated.View>
  );
};
