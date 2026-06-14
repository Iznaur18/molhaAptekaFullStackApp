import { Text, View } from "react-native";

import { HUB_SECTION_UI } from "@/shared/config";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { AppButton } from "@/shared/ui/AppButton";

type HubSectionPlaceholderProps = {
  title: string;
  hint?: string;
  onBack?: () => void;
};

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[3],
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: theme.colors.text,
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    color: theme.colors.textMuted,
  },
  button: {
    marginTop: theme.spacing[3],
  },
}));

export const HubSectionPlaceholder = ({
  title,
  hint = HUB_SECTION_UI.PLACEHOLDER_HINT,
  onBack,
}: HubSectionPlaceholderProps) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
      {onBack ? (
        <AppButton
          label={HUB_SECTION_UI.BACK_TO_PROFILE}
          onPress={onBack}
          style={styles.button}
        />
      ) : null}
    </View>
  );
};
