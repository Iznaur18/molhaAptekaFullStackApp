import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLogoutMutation } from "@/entities/session/model/useLogoutMutation";
import { ProfileHubMenu } from "@/features/profile-hub/ui/ProfileHubMenu";
import {
  PROFILE_SECTION_OVERVIEW,
  type ProfileSectionId,
} from "@/features/profile-hub/model/profileSections";
import { API_CLIENT_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import {
  PROFILE_MOBILE_NAV_SHEET_ANIMATION,
  useProfileMobileNavSheetStyles,
} from "@/shared/theme/profileChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";

type ProfileMobileNavSheetProps = {
  visible: boolean;
  activeSectionId: ProfileSectionId;
  onClose: () => void;
  onOverviewPress: () => void;
};

const { enterMs, exitMs, slideDistance } = PROFILE_MOBILE_NAV_SHEET_ANIMATION;

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
  const [modalVisible, setModalVisible] = useState(visible);
  const sheetTranslateX = useSharedValue<number>(slideDistance);
  const backdropOpacity = useSharedValue(0);

  const finishClose = useCallback(() => {
    setModalVisible(false);
    setLogoutConfirmOpen(false);
  }, []);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      sheetTranslateX.value = slideDistance;
      backdropOpacity.value = 0;
      sheetTranslateX.value = withTiming(0, {
        duration: enterMs,
        easing: Easing.out(Easing.cubic),
      });
      backdropOpacity.value = withTiming(1, {
        duration: enterMs,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (!modalVisible) {
      return;
    }

    sheetTranslateX.value = withTiming(
      slideDistance,
      {
        duration: exitMs,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(finishClose)();
        }
      },
    );
    backdropOpacity.value = withTiming(0, {
      duration: exitMs,
      easing: Easing.in(Easing.cubic),
    });
  }, [backdropOpacity, finishClose, modalVisible, sheetTranslateX, visible]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sheetTranslateX.value }],
  }));

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
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <Pressable
          style={styles.backdropPress}
          accessibilityLabel={MY_PROFILE_PAGE_UI.MOBILE_NAV_CLOSE_ARIA}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.sheet,
            sheetAnimatedStyle,
            {
              paddingTop: insets.top,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
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
                        variant="cancel"
                        onPress={() => setLogoutConfirmOpen(false)}
                      />
                    </View>
                  </View>
                )}
              </View>
            ) : null}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
