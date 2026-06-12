import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { EditProfileForm } from "@/features/profile-edit/ui/EditProfileForm";
import { AUTH_UI, EDIT_PROFILE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function EditProfileScreen() {
  const router = useRouter();
  const sessionQuery = useAuthSessionQuery();
  const user = sessionQuery.data?.user;

  if (sessionQuery.isPending) {
    return <ScreenLoadingState message={AUTH_UI.SESSION_CHECK} />;
  }

  if (sessionQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(sessionQuery.error, AUTH_UI.SESSION_ERROR)}
        onRetry={() => sessionQuery.refetch()}
      />
    );
  }

  if (!user?._id) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{EDIT_PROFILE_UI.AUTH_REQUIRED}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.buttonText}>{AUTH_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  return <EditProfileForm user={user} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
