import { Pressable, StyleSheet, Text, View } from "react-native";

import { HUB_SECTION_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type HubSectionPlaceholderProps = {
  title: string;
  hint?: string;
  onBack?: () => void;
};

export const HubSectionPlaceholder = ({
  title,
  hint = HUB_SECTION_UI.PLACEHOLDER_HINT,
  onBack,
}: HubSectionPlaceholderProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.hint, { color: theme.colors.textMuted }]}>{hint}</Text>
      {onBack ? (
        <Pressable style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>{HUB_SECTION_UI.BACK_TO_PROFILE}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#111",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
