import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { INSTALLMENT_UI } from "@/shared/config";
import { useInstallmentContractCardChromeStyles } from "@/shared/theme/installmentContractCardChromeStyles";

const PROGRESS_ANIMATION_MS = 650;

type InstallmentContractProgressBarProps = {
  percent: number;
  ariaLabel?: string;
};

export const InstallmentContractProgressBar = ({
  percent,
  ariaLabel,
}: InstallmentContractProgressBarProps) => {
  const styles = useInstallmentContractCardChromeStyles();
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clampedPercent, {
      duration: PROGRESS_ANIMATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedPercent, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View
      style={styles.progress}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clampedPercent }}
      accessibilityLabel={ariaLabel ?? `${INSTALLMENT_UI.CONTRACT_PAID}: ${clampedPercent}%`}
    >
      <Animated.View style={[styles.progressFill, fillStyle]} />
    </View>
  );
};
