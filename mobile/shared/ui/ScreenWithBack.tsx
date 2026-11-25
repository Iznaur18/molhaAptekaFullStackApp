import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { resolveScreenBackContentPaddingTop } from "@/shared/lib/screenBackButtonLayout";
import { useScreenWithBackStyles } from "@/shared/theme/screenBackButtonStyles";
import { PageCanvas } from "@/shared/ui/PageCanvas";
import { ScreenBackButton } from "@/shared/ui/ScreenBackButton";

type ScreenWithBackProps = {
  children: ReactNode;
};

export const ScreenWithBack = ({ children }: ScreenWithBackProps) => {
  const insets = useSafeAreaInsets();
  const styles = useScreenWithBackStyles();
  const contentPaddingTop = resolveScreenBackContentPaddingTop(insets.top);

  return (
    <PageCanvas>
      <ScreenBackButton />
      <View style={[styles.content, { paddingTop: contentPaddingTop }]}>
        {children}
      </View>
    </PageCanvas>
  );
};
