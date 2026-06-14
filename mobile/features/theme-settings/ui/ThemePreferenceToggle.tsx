import { Pressable, StyleSheet, Text, View } from "react-native";

import { THEME_SETTINGS_UI } from "@/shared/config";
import { useAppTheme, useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import type { ThemePreference } from "@/shared/theme/themePreferenceStorage";

const OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: "system", label: THEME_SETTINGS_UI.SYSTEM },
  { value: "light", label: THEME_SETTINGS_UI.LIGHT },
  { value: "dark", label: THEME_SETTINGS_UI.DARK },
];

export const ThemePreferenceToggle = () => {
  const theme = useAppTheme();
  const { preference, setPreference } = useAppThemeSettings();

  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{THEME_SETTINGS_UI.LABEL}</Text>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const isActive = preference === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.chip,
                {
                  borderColor: theme.colors.borderStrong,
                  backgroundColor: isActive ? theme.colors.action : theme.colors.surface,
                },
              ]}
              onPress={() => setPreference(option.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? theme.colors.onContrast : theme.colors.text },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 420,
    gap: 8,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
