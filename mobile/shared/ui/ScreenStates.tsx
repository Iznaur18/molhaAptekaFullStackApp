import { ActivityIndicator, Text, View } from "react-native";

import { SCREEN_STATE_UI } from "@/shared/config";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { AppButton } from "@/shared/ui/AppButton";

type ScreenLoadingStateProps = {
  message?: string;
};

const useStyles = createThemedStyles((theme) => ({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
  },
  message: {
    marginTop: theme.spacing[3],
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  error: {
    fontSize: 15,
    color: theme.colors.danger,
    textAlign: "center",
  },
  retryButton: {
    marginTop: theme.spacing[4],
  },
}));

export const ScreenLoadingState = ({ message }: ScreenLoadingStateProps) => {
  const styles = useStyles();

  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

type ScreenErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export const ScreenErrorState = ({ message, onRetry }: ScreenErrorStateProps) => {
  const styles = useStyles();

  return (
    <View style={styles.centered}>
      <Text style={styles.error}>{message}</Text>
      {onRetry ? (
        <AppButton label={SCREEN_STATE_UI.RETRY} onPress={onRetry} style={styles.retryButton} />
      ) : null}
    </View>
  );
};
