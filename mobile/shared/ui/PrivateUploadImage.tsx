import { createElement, useMemo } from "react";
import { Image as ExpoImage } from "expo-image";
import {
  Platform,
  StyleSheet,
  type ImageStyle,
  type StyleProp,
} from "react-native";

type PrivateUploadImageProps = {
  uri: string;
  style: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  onError?: () => void;
};

/**
 * Web: native <img> — expo-image/RN Image часто рисуют data: пустым квадратом.
 */
export const PrivateUploadImage = ({
  uri,
  style,
  accessibilityLabel,
  onError,
}: PrivateUploadImageProps) => {
  const flatStyle = useMemo(() => StyleSheet.flatten(style) ?? {}, [style]);

  if (Platform.OS === "web") {
    return createElement("img", {
      src: uri,
      alt: accessibilityLabel ?? "",
      onError,
      style: {
        display: "block",
        width: flatStyle.width ?? "100%",
        maxWidth: flatStyle.maxWidth ?? 288,
        height: flatStyle.height ?? 224,
        objectFit: "contain",
        borderRadius: flatStyle.borderRadius ?? 8,
        borderWidth: flatStyle.borderWidth,
        borderColor: flatStyle.borderColor,
        borderStyle: flatStyle.borderWidth ? "solid" : undefined,
        backgroundColor: flatStyle.backgroundColor,
      },
    });
  }

  return (
    <ExpoImage
      source={{ uri }}
      style={style}
      contentFit="contain"
      accessibilityLabel={accessibilityLabel}
      onError={onError}
    />
  );
};
