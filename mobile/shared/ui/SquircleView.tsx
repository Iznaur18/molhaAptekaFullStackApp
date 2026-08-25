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

/** Web CSS `corner-shape: squircle` — паритет client `@supports (corner-shape: squircle)`. */
const WEB_SQUIRCLE_CORNER_STYLE =
  Platform.OS === "web"
    ? ({
        // RNW прокидывает неизвестные ключи в DOM style.
        cornerShape: "squircle",
      } as ViewStyle)
    : null;

const IOS_CONTINUOUS_CURVE_STYLE =
  Platform.OS === "ios" ? ({ borderCurve: "continuous" } as const) : null;

const resolveCornerRadii = (
  radius: number | undefined,
  cornerRadii: SquircleCornerRadii | undefined,
): SquircleCornerRadii => {
  // Web + corner-shape: базовый radius как в CSS. Native: +12% под визуальный squircle.
  const resolveRadius =
    Platform.OS === "web"
      ? (value: number) => value
      : resolveSquircleRadius;

  if (cornerRadii) {
    return {
      topLeft: resolveRadius(cornerRadii.topLeft),
      topRight: resolveRadius(cornerRadii.topRight),
      bottomLeft: resolveRadius(cornerRadii.bottomLeft),
      bottomRight: resolveRadius(cornerRadii.bottomRight),
    };
  }

  const uniformRadius = resolveRadius(radius ?? 0);
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
  ...IOS_CONTINUOUS_CURVE_STYLE,
  ...WEB_SQUIRCLE_CORNER_STYLE,
});

const buildClipStyle = (corners: SquircleCornerRadii): ViewStyle => ({
  borderTopLeftRadius: corners.topLeft,
  borderTopRightRadius: corners.topRight,
  borderBottomLeftRadius: corners.bottomLeft,
  borderBottomRightRadius: corners.bottomRight,
  overflow: "hidden",
  ...IOS_CONTINUOUS_CURVE_STYLE,
  ...WEB_SQUIRCLE_CORNER_STYLE,
});

/**
 * Скруглённый контейнер. На всех платформах — borderRadius + overflow.
 * Web: `corner-shape: squircle`. iOS: `borderCurve: continuous`.
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
