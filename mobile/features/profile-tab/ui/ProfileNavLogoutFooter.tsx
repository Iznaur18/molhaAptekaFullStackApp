import { useState } from "react";
import { Text, View } from "react-native";

import { useLogoutMutation } from "@/entities/session/model/useLogoutMutation";
import { API_CLIENT_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProfileMobileNavSheetStyles } from "@/shared/theme/profileChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";

type ProfileNavLogoutFooterProps = {
  onLoggedOut?: () => void;
};

export const ProfileNavLogoutFooter = ({ onLoggedOut }: ProfileNavLogoutFooterProps) => {
  const styles = useProfileMobileNavSheetStyles();
  const logoutMutation = useLogoutMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setConfirmOpen(false);
      onLoggedOut?.();
    } catch {
      // mutation error below
    }
  };

  return (
    <View style={styles.logoutFooter}>
      {logoutMutation.isError ? (
        <Text style={styles.logoutError}>
          {formatApiErrorMessage(logoutMutation.error, API_CLIENT_UI.LOGOUT_FALLBACK)}
        </Text>
      ) : null}
      {!confirmOpen ? (
        <AppButton
          label={MY_PROFILE_PAGE_UI.LOGOUT}
          variant="outline"
          onPress={() => setConfirmOpen(true)}
          disabled={logoutMutation.isPending}
        />
      ) : (
        <View style={styles.logoutConfirm}>
          <Text style={styles.logoutQuestion}>{MY_PROFILE_PAGE_UI.LOGOUT_CONFIRM}</Text>
          <View style={styles.logoutActions}>
            <AppButton
              label={MY_PROFILE_PAGE_UI.LOGOUT_YES}
              variant="primary"
              onPress={() => void handleLogout()}
              disabled={logoutMutation.isPending}
            />
            <AppButton
              label={MY_PROFILE_PAGE_UI.LOGOUT_CANCEL}
              variant="cancel"
              onPress={() => setConfirmOpen(false)}
            />
          </View>
        </View>
      )}
    </View>
  );
};
