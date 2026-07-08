import MaskedView from "@react-native-masked-view/masked-view";
import { useCallback, useState } from "react";
import {
  Platform,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import { getSquircleSvgPath } from "@/shared/lib/squircle/getSquircleSvgPath";
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

const buildIosSquircleStyle = (corners: SquircleCornerRadii): ViewStyle => ({
  borderTopLeftRadius: corners.topLeft,
  borderTopRightRadius: corners.topRight,
  borderBottomLeftRadius: corners.bottomLeft,
  borderBottomRightRadius: corners.bottomRight,
  borderCurve: "continuous",
  overflow: "hidden",
  position: "relative",
});

const buildFallbackRadiusStyle = (corners: SquircleCornerRadii): ViewStyle => ({
  borderTopLeftRadius: corners.topLeft,
  borderTopRightRadius: corners.topRight,
  borderBottomLeftRadius: corners.bottomLeft,
  borderBottomRightRadius: corners.bottomRight,
  overflow: "hidden",
  position: "relative",
});

type SquircleMaskProps = {
  width: number;
  height: number;
  corners: SquircleCornerRadii;
};

const SquircleMask = ({ width, height, corners }: SquircleMaskProps) => {
  const path = getSquircleSvgPath({
    width,
    height,
    topLeftCornerRadius: corners.topLeft,
    topRightCornerRadius: corners.topRight,
    bottomLeftCornerRadius: corners.bottomLeft,
    bottomRightCornerRadius: corners.bottomRight,
  });

  return (
    <Svg width={width} height={height}>
      <Path d={path} fill="#000000" />
    </Svg>
  );
};

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
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      if (width > 0 && height > 0) {
        setLayout({ width, height });
      }
      onLayout?.(event);
    },
    [onLayout],
  );

  const wrapperStyle: StyleProp<ViewStyle> = [
    outerStyle,
    shadowStyle ? buildOuterRadiusStyle(corners) : null,
    shadowStyle,
  ];

  const clipStyle = Platform.OS === "ios" ? buildIosSquircleStyle(corners) : buildFallbackRadiusStyle(corners);

  if (Platform.OS === "web") {
    if (!shadowStyle) {
      return (
        <View style={[clipStyle, style, outerStyle]} {...rest}>
          {children}
        </View>
      );
    }

    return (
      <View style={wrapperStyle}>
        <View style={[clipStyle, style]} {...rest}>
          {children}
        </View>
      </View>
    );
  }

  if (Platform.OS === "ios") {
    if (!shadowStyle) {
      return (
        <View style={[clipStyle, style, outerStyle]} {...rest}>
          {children}
        </View>
      );
    }

    return (
      <View style={wrapperStyle}>
        <View style={[clipStyle, style]} {...rest}>
          {children}
        </View>
      </View>
    );
  }

  const hasLayout = layout.width > 0 && layout.height > 0;

  return (
    <View style={wrapperStyle} onLayout={handleLayout} {...rest}>
      {hasLayout ? (
        <MaskedView
          style={[{ width: layout.width, height: layout.height }, style]}
          maskElement={
            <View
              style={{
                width: layout.width,
                height: layout.height,
                backgroundColor: "#000000",
              }}
            >
              <SquircleMask width={layout.width} height={layout.height} corners={corners} />
            </View>
          }
        >
          <View style={{ width: layout.width, height: layout.height }}>{children}</View>
        </MaskedView>
      ) : (
        <View style={style}>{children}</View>
      )}
    </View>
  );
};
