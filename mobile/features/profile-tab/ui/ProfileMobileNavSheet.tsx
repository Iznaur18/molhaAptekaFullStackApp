import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLogoutMutation } from "@/entities/session/model/useLogoutMutation";
import { ProfileHubMenu } from "@/features/profile-hub/ui/ProfileHubMenu";
import {
  PROFILE_SECTION_OVERVIEW,
  type ProfileSectionId,
} from "@/features/profile-hub/model/profileSections";
import { API_CLIENT_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProfileMobileNavSheetStyles } from "@/shared/theme/profileChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";

type ProfileMobileNavSheetProps = {
  visible: boolean;
  activeSectionId: ProfileSectionId;
  onClose: () => void;
  onOverviewPress: () => void;
};

export const ProfileMobileNavSheet = ({
  visible,
  activeSectionId,
  onClose,
  onOverviewPress,
}: ProfileMobileNavSheetProps) => {
  const insets = useSafeAreaInsets();
  const styles = useProfileMobileNavSheetStyles();
  const logoutMutation = useLogoutMutation();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleNavigate = () => {
    onClose();
    setLogoutConfirmOpen(false);
  };

  const handleOverviewPress = () => {
    onOverviewPress();
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      onClose();
      setLogoutConfirmOpen(false);
    } catch {
      // mutation error surface below
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={styles.backdropPress}
          accessibilityLabel={MY_PROFILE_PAGE_UI.MOBILE_NAV_CLOSE_ARIA}
          onPress={onClose}
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <ScrollView contentContainerStyle={styles.sheetContent}>
            <ProfileHubMenu
              activeSectionId={activeSectionId}
              onOverviewPress={handleOverviewPress}
              onNavigate={handleNavigate}
              variant="sheet"
            />

            {activeSectionId === PROFILE_SECTION_OVERVIEW ? (
              <View style={styles.logoutFooter}>
                {logoutMutation.isError ? (
                  <Text style={styles.logoutError}>
                    {formatApiErrorMessage(logoutMutation.error, API_CLIENT_UI.LOGOUT_FALLBACK)}
                  </Text>
                ) : null}
                {!logoutConfirmOpen ? (
                  <AppButton
                    label={MY_PROFILE_PAGE_UI.LOGOUT}
                    variant="outline"
                    onPress={() => setLogoutConfirmOpen(true)}
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
                        variant="ghost"
                        onPress={() => setLogoutConfirmOpen(false)}
                      />
                    </View>
                  </View>
                )}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
