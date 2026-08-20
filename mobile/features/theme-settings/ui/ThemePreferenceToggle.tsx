import { Pressable, Text, View } from "react-native";

import { THEME_SETTINGS_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useThemePreferenceToggleStyles } from "@/shared/theme/profileChromeStyles";
import type { ThemePreference } from "@/shared/theme/themePreferenceStorage";

const OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: "light", label: THEME_SETTINGS_UI.LIGHT },
  { value: "dark", label: THEME_SETTINGS_UI.DARK },
  { value: "custom", label: THEME_SETTINGS_UI.CUSTOM },
];

type ThemePreferenceToggleProps = {
  centered?: boolean;
};

export const ThemePreferenceToggle = ({ centered = false }: ThemePreferenceToggleProps) => {
  const styles = useThemePreferenceToggleStyles();
  const { preference, setPreference } = useAppThemeSettings();

  return (
    <View style={[styles.root, centered ? styles.rootCentered : null]}>
      <Text style={[styles.label, centered ? styles.labelCentered : null]}>
        {THEME_SETTINGS_UI.LABEL}
      </Text>
      <View style={[styles.row, centered ? styles.rowCentered : null]}>
        {OPTIONS.map((option) => {
          const isActive = preference === option.value;
          return (
            <Pressable
              key={option.value}
              style={[styles.chip, isActive ? styles.chipActive : styles.chipIdle]}
              onPress={() => setPreference(option.value)}
            >
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextIdle]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
