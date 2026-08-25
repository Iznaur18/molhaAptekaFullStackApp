import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfileHubMenu } from "@/features/profile-hub/ui/ProfileHubMenu";
import { ProfileNavLogoutFooter } from "@/features/profile-tab/ui/ProfileNavLogoutFooter";
import {
  PROFILE_SECTION_OVERVIEW,
  type ProfileSectionId,
} from "@/features/profile-hub/model/profileSections";
import { MY_PROFILE_PAGE_UI } from "@/shared/config";
import {
  PROFILE_MOBILE_NAV_SHEET_ANIMATION,
  useProfileMobileNavSheetStyles,
} from "@/shared/theme/profileChromeStyles";

type ProfileMobileNavSheetProps = {
  visible: boolean;
  activeSectionId: ProfileSectionId;
  onClose: () => void;
  onOverviewPress: () => void;
  /** phone: справа; tablet drawer: слева (web ≤900 / ≤640). */
  side?: "left" | "right";
};

const { enterMs, exitMs, slideDistance } = PROFILE_MOBILE_NAV_SHEET_ANIMATION;

export const ProfileMobileNavSheet = ({
  visible,
  activeSectionId,
  onClose,
  onOverviewPress,
  side = "right",
}: ProfileMobileNavSheetProps) => {
  const insets = useSafeAreaInsets();
  const styles = useProfileMobileNavSheetStyles();
  const [modalVisible, setModalVisible] = useState(visible);
  const closedOffset = side === "left" ? -slideDistance : slideDistance;
  const sheetTranslateX = useSharedValue(closedOffset);
  const backdropOpacity = useSharedValue(0);

  const finishClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      sheetTranslateX.value = closedOffset;
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
      closedOffset,
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
  }, [
    backdropOpacity,
    closedOffset,
    finishClose,
    modalVisible,
    sheetTranslateX,
    visible,
  ]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sheetTranslateX.value }],
  }));

  const handleNavigate = () => {
    onClose();
  };

  const handleOverviewPress = () => {
    onOverviewPress();
    onClose();
  };

  const isFromLeft = side === "left";

  return (
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={onClose}>
      <Animated.View
        style={[
          styles.backdrop,
          backdropAnimatedStyle,
          isFromLeft && { flexDirection: "row-reverse" as const },
        ]}
      >
        <Pressable
          style={styles.backdropPress}
          accessibilityLabel={MY_PROFILE_PAGE_UI.MOBILE_NAV_CLOSE_ARIA}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.sheet,
            isFromLeft && styles.sheetFromLeft,
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
              <ProfileNavLogoutFooter onLoggedOut={onClose} />
            ) : null}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
