import { useCallback } from "react";
import {
  Platform,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { resolveSquircleRadius } from "@/shared/lib/squircle/resolveSquircleRadius";

export type SquircleCornerRadii = {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
};

type SquircleViewProps = Omit<ViewProps, "style"> & {
  radius?: number;
  cornerRadii?: SquircleCornerRadii;
  style?: StyleProp<ViewStyle>;
  outerStyle?: StyleProp<ViewStyle>;
  shadowStyle?: StyleProp<ViewStyle>;
};

const resolveCornerRadii = (
  radius: number | undefined,
  cornerRadii: SquircleCornerRadii | undefined,
): SquircleCornerRadii => {
  if (cornerRadii) {
    return {
      topLeft: resolveSquircleRadius(cornerRadii.topLeft),
      topRight: resolveSquircleRadius(cornerRadii.topRight),
      bottomLeft: resolveSquircleRadius(cornerRadii.bottomLeft),
      bottomRight: resolveSquircleRadius(cornerRadii.bottomRight),
    };
  }

  const uniformRadius = resolveSquircleRadius(radius ?? 0);
  return {
    topLeft: uniformRadius,
    topRight: uniformRadius,
    bottomLeft: uniformRadius,
    bottomRight: uniformRadius,
  };
};

const buildOuterRadiusStyle = (corners: SquircleCornerRadii): ViewStyle => ({
  borderTopLeftRadius: corners.topLeft,
  borderTopRightRadius: corners.topRight,
  borderBottomLeftRadius: corners.bottomLeft,
  borderBottomRightRadius: corners.bottomRight,
  ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
});

const buildClipStyle = (corners: SquircleCornerRadii): ViewStyle => ({
  borderTopLeftRadius: corners.topLeft,
  borderTopRightRadius: corners.topRight,
  borderBottomLeftRadius: corners.bottomLeft,
  borderBottomRightRadius: corners.bottomRight,
  overflow: "hidden",
  ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
});

/**
 * Скруглённый контейнер. На всех платформах — borderRadius + overflow.
 * outerStyle всегда на отдельном слое: на Android overflow+absolute на одном View
 * ломает клип углов (особенно планшеты).
 */
export const SquircleView = ({
  radius,
  cornerRadii: cornerRadiiProp,
  style,
  outerStyle,
  shadowStyle,
  children,
  onLayout,
  ...rest
}: SquircleViewProps) => {
  const corners = resolveCornerRadii(radius, cornerRadiiProp);
  const clipStyle = buildClipStyle(corners);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onLayout?.(event);
    },
    [onLayout],
  );

  if (outerStyle != null || shadowStyle != null) {
    return (
      <View
        style={[
          outerStyle,
          shadowStyle != null ? [buildOuterRadiusStyle(corners), shadowStyle] : null,
        ]}
        onLayout={handleLayout}
      >
        <View style={[clipStyle, style]} {...rest}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={[clipStyle, style]} onLayout={handleLayout} {...rest}>
      {children}
    </View>
  );
};
