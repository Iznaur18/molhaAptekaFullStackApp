import { type ReactElement, type ReactNode } from "react";
import {
  ScrollView,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";

type ProfileAccountScrollBodyProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  refreshControl?: ScrollViewProps["refreshControl"];
};

/**
 * Desktop ProfileAccountShell: ScrollView внутри outer ScrollView с scrollEnabled={false}
 * даёт height 0 на RN web. outerScrollOwns → View; drawer → ScrollView.
 */
export const ProfileAccountScrollBody = ({
  children,
  style,
  contentContainerStyle,
  accessibilityLabel,
  refreshControl,
}: ProfileAccountScrollBodyProps): ReactElement => {
  const { outerScrollOwns, scrollEnabled, resolveListStyle } =
    useProfileAccountNestedListScroll();

  const listStyle = resolveListStyle(style);

  if (outerScrollOwns) {
    return (
      <View style={listStyle} accessibilityLabel={accessibilityLabel}>
        <View style={[{ flexDirection: "column", width: "100%" }, contentContainerStyle]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={listStyle}
      scrollEnabled={scrollEnabled}
      contentContainerStyle={contentContainerStyle}
      accessibilityLabel={accessibilityLabel}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  );
};
