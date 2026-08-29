import { Children, isValidElement, useMemo } from "react";
import {
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { isReactNativeWeb } from "@/shared/lib/isReactNativeWeb";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";

type HorizontalOverflowRowProps = {
  height: number;
  shellStyle?: StyleProp<ViewStyle>;
  trackStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityRole?: "tablist" | "list" | "none";
};

type TrackItem = {
  key: string;
  node: React.ReactElement;
};

const trackItemShellStyle: ViewStyle = {
  flexGrow: 0,
  flexShrink: 0,
  flex: 0,
  alignSelf: "center",
};

const shellBaseStyle = (height: number): ViewStyle => ({
  height,
  maxHeight: height,
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  flexGrow: 0,
  flexShrink: 0,
  flex: 0,
  alignSelf: "stretch",
  overflow: "hidden",
});

const domTrackBaseStyle = (height: number): ViewStyle => ({
  height,
  maxHeight: height,
  width: "100%",
  flexDirection: "row",
  flexWrap: "nowrap",
  alignItems: "center",
  flexGrow: 0,
  flexShrink: 0,
  overflowX: "auto",
  overflowY: "hidden",
  overscrollBehaviorX: "contain",
  scrollbarWidth: "none",
});

const nativeScrollStyle = (height: number): ViewStyle => ({
  height,
  maxHeight: height,
  width: "100%",
  flexGrow: 0,
  flexShrink: 0,
  flex: 0,
});

const nativeTrackBaseStyle = (height: number): ViewStyle => ({
  flexDirection: "row",
  flexWrap: "nowrap",
  alignItems: "center",
  flexGrow: 0,
  flexShrink: 0,
  height,
  maxHeight: height,
});

const toTrackItems = (children: React.ReactNode): TrackItem[] =>
  Children.toArray(children)
    .filter(isValidElement)
    .map((node, index) => ({
      key: node.key != null ? String(node.key) : `track-item-${index}`,
      node,
    }));

/** Горизонтальная лента фиксированной высоты. Web: div+overflow-x; native: ScrollView без flexGrow. */
export const HorizontalOverflowRow = ({
  height,
  shellStyle,
  trackStyle,
  children,
  accessibilityLabel,
  accessibilityRole,
}: HorizontalOverflowRowProps) => {
  const trackItems = useMemo(() => toTrackItems(children), [children]);
  const shellStyleResolved = [shellBaseStyle(height), shellStyle];

  if (isReactNativeWeb()) {
    return (
      <View style={shellStyleResolved}>
        <View
          style={[domTrackBaseStyle(height), trackStyle]}
          accessibilityRole={accessibilityRole}
          accessibilityLabel={accessibilityLabel}
        >
          {trackItems.map((item) => (
            <View key={item.key} style={trackItemShellStyle}>
              {item.node}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={shellStyleResolved}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={nativeScrollStyle(height)}
        contentContainerStyle={[nativeTrackBaseStyle(height), trackStyle]}
        keyboardShouldPersistTaps="handled"
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        {...nestedHorizontalScrollProps}
      >
        {trackItems.map((item) => (
          <View key={item.key} style={trackItemShellStyle}>
            {item.node}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
