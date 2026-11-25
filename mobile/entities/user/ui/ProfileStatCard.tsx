import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { ProfileRow } from "@/entities/user/lib/groupProfileRows";
import { getProfileRowIcon } from "@/entities/user/lib/profileRowIcons";
import { resolveProfileStatIconGradient } from "@/entities/user/lib/profileStatIconGradients";
import { useUserProfileInfoPanelStyles } from "@/entities/user/ui/userProfileInfoPanelStyles";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { GradientFill } from "@/shared/ui/GradientFill";

type ProfileStatCardProps = {
  row: ProfileRow;
  isWide?: boolean;
  onPress?: (() => void) | null;
};

export const ProfileStatCard = ({
  row,
  isWide = false,
  onPress = null,
}: ProfileStatCardProps) => {
  const theme = useAppTheme();
  const styles = useUserProfileInfoPanelStyles();
  const icon = getProfileRowIcon(row.id);
  const isEmpty = row.value === "—";
  const gradient = resolveProfileStatIconGradient(row.id);
  const clickable = typeof onPress === "function";

  const content = (
    <>
      {icon ? (
        <View style={styles.statIcon}>
          <GradientFill colors={gradient} />
          <Feather name={icon} size={15} color="#ffffff" />
        </View>
      ) : null}
      <View style={[styles.statText, isWide && styles.statCardWideBody]}>
        <Text style={styles.statLabel} numberOfLines={isWide ? 1 : 2}>
          {row.label}
        </Text>
        <Text
          style={[
            styles.statValue,
            isEmpty && styles.statValueEmpty,
            isWide && styles.statValueWide,
          ]}
          numberOfLines={isWide ? 3 : 1}
        >
          {row.value}
        </Text>
      </View>
      {clickable ? (
        <View style={styles.statChevron} accessibilityElementsHidden>
          <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
        </View>
      ) : null}
    </>
  );

  if (!clickable) {
    return (
      <View style={[styles.statCard, isWide && styles.statCardWide]}>{content}</View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.statCard,
        isWide && styles.statCardWide,
        pressed ? styles.statCardPressed : null,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={row.label}
    >
      {content}
    </Pressable>
  );
};
