import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { SCREEN_STATE_UI } from "@/shared/config";

type ScreenLoadingStateProps = {
  message?: string;
};

export const ScreenLoadingState = ({ message }: ScreenLoadingStateProps) => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" />
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </View>
);

type ScreenErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export const ScreenErrorState = ({ message, onRetry }: ScreenErrorStateProps) => (
  <View style={styles.centered}>
    <Text style={styles.error}>{message}</Text>
    {onRetry ? (
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>{SCREEN_STATE_UI.RETRY}</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  message: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  error: {
    fontSize: 15,
    color: "#c62828",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
