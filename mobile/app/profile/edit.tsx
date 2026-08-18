import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { EditProfileForm } from "@/features/profile-edit/ui/EditProfileForm";
import { AUTH_UI, EDIT_PROFILE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAuthGateStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function EditProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ focus?: string | string[] }>();
  const focusRaw = params.focus;
  const focusAddress =
    (Array.isArray(focusRaw) ? focusRaw[0] : focusRaw) === "address";
  const styles = useAuthGateStyles();
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
        <AppButton
          label={AUTH_UI.LOGIN_BUTTON}
          variant="primary"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    );
  }

  return (
    <EditProfileForm
      user={user}
      focusAddress={focusAddress}
      onSaved={() => router.replace("/(tabs)/profile")}
    />
  );
}
