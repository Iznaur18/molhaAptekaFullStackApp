import { StyleSheet, Text, View } from "react-native";
import { resolveProductManageTogglePalette, resolveUploadedImageUrlForBrowser } from "@izibuy/shared-lib";

import {
  resolveProductManageToggleRowVisualStyles,
  type ProductManageToggleRowVariant,
} from "@/entities/product/lib/resolveProductManageToggleRowVisualStyles";
import { useProductManageToggleRowStyles } from "@/shared/theme/modalChromeStyles";

type ProductManageToggleRowProps = {
  title: string;
  description: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onPress?: () => void;
  disabled?: boolean;
  pending?: boolean;
  pendingLabel?: string;
  variant?: ProductManageToggleRowVariant;
  ariaLabel?: string;
  titleStatus?: string;
  imageUrl?: string | null;
};

const toCssStyle = (style: Record<string, unknown> | undefined) => {
  if (!style) {
    return undefined;
  }

  const flat = StyleSheet.flatten(style) as Record<string, unknown>;
  const css: Record<string, string | number> = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    margin: 0,
    font: "inherit",
    textAlign: "left",
    transition: "opacity 0.15s ease, filter 0.15s ease",
    overflow: "hidden",
  };

  if (typeof flat.minHeight === "number") {
    css.minHeight = flat.minHeight;
  }

  if (typeof flat.paddingVertical === "number" && typeof flat.paddingHorizontal === "number") {
    css.padding = `${flat.paddingVertical}px ${flat.paddingHorizontal}px`;
  } else if (
    typeof flat.paddingVertical === "number" &&
    typeof flat.paddingLeft === "number" &&
    typeof flat.paddingRight === "number"
  ) {
    css.padding = `${flat.paddingVertical}px ${flat.paddingRight}px ${flat.paddingVertical}px ${flat.paddingLeft}px`;
  }

  if (typeof flat.borderWidth === "number") {
    css.borderWidth = flat.borderWidth;
    css.borderStyle = "solid";
  }

  if (typeof flat.borderColor === "string") {
    css.borderColor = flat.borderColor;
  }

  if (typeof flat.borderRadius === "number") {
    css.borderRadius = flat.borderRadius;
  }

  if (typeof flat.backgroundColor === "string") {
    css.backgroundColor = flat.backgroundColor;
  }

  if (typeof flat.opacity === "number") {
    css.opacity = flat.opacity;
  }

  return css;
};

export const ProductManageToggleRow = ({
  title,
  description,
  checked = false,
  onCheckedChange,
  onPress,
  disabled = false,
  pending = false,
  pendingLabel = "",
  variant = "default",
  ariaLabel,
  titleStatus = "",
  imageUrl = null,
}: ProductManageToggleRowProps) => {
  const styles = useProductManageToggleRowStyles();
  const palette = resolveProductManageTogglePalette(variant, checked);
  const resolvedImageUrl =
    imageUrl != null && String(imageUrl).trim()
      ? resolveUploadedImageUrlForBrowser(String(imageUrl).trim())
      : "";

  if (pending) {
    return (
      <View style={[styles.row, styles.rowPending]} accessibilityLiveRegion="polite">
        <Text style={styles.pendingLabel}>{pendingLabel}</Text>
      </View>
    );
  }

  const handleClick = () => {
    if (disabled) {
      return;
    }
    if (onPress) {
      onPress();
      return;
    }
    onCheckedChange?.(!checked);
  };

  const visualStyles = resolveProductManageToggleRowVisualStyles(styles, variant);
  const buttonStyle = toCssStyle(
    StyleSheet.flatten([
      styles.row,
      ...visualStyles,
      palette ? { backgroundColor: palette.background } : null,
      disabled ? styles.rowDisabled : null,
    ]) as Record<string, unknown>,
  );

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel ?? (titleStatus ? `${title} ${titleStatus}` : title)}
      onClick={handleClick}
      style={{
        ...buttonStyle,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
        }}
      >
        <span style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              lineHeight: "19px",
              color: palette?.title ?? "inherit",
            }}
          >
            {title}
            {titleStatus ? (
              <span style={{ fontWeight: 600, opacity: 0.82 }}>{` ${titleStatus}`}</span>
            ) : null}
          </span>
          <span
            style={{
              fontSize: 12,
              lineHeight: "17px",
              color: palette?.description ?? "inherit",
              opacity: palette ? 1 : 0.72,
            }}
          >
            {description}
          </span>
        </span>
        {resolvedImageUrl ? (
          <span
            aria-hidden="true"
            style={{
              flex: "0 0 auto",
              width: 88,
              height: 56,
            }}
          >
            <img
              src={resolvedImageUrl}
              alt=""
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "right center",
              }}
            />
          </span>
        ) : null}
      </span>
    </button>
  );
};
