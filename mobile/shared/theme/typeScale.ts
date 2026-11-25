import type { IzTheme } from "@izibuy/design-tokens";
import type { TextStyle } from "react-native";

/**
 * Семантические роли текста (= web `--iz-font-*` через `theme.typography`).
 * Новые стили — через эти роли / `theme.typography.*`, не raw px.
 */
export type TypeScaleRole =
  | "2xs"
  | "xs"
  | "sm"
  | "base"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl";

const FONT_KEY = {
  "2xs": "font2xs",
  xs: "fontXs",
  sm: "fontSm",
  base: "fontBase",
  md: "fontMd",
  lg: "fontLg",
  xl: "fontXl",
  "2xl": "font2xl",
  "3xl": "font3xl",
  "4xl": "font4xl",
  "5xl": "font5xl",
  "6xl": "font6xl",
  "7xl": "font7xl",
} as const satisfies Record<TypeScaleRole, keyof IzTheme["typography"]>;

const LEADING_KEY = {
  "2xs": "leading2xs",
  xs: "leadingXs",
  sm: "leadingSm",
  base: "leadingBase",
  md: "leadingBase",
  lg: "leadingLg",
  xl: "leadingLg",
  "2xl": "leadingXl",
  "3xl": "leadingXl",
  "4xl": "leadingXl",
  "5xl": "leadingXl",
  "6xl": "leadingXl",
  "7xl": "leadingXl",
} as const satisfies Record<TypeScaleRole, keyof IzTheme["typography"]>;

export const resolveTypeScale = (
  theme: IzTheme,
  role: TypeScaleRole,
): Pick<TextStyle, "fontSize" | "lineHeight"> => ({
  fontSize: theme.typography[FONT_KEY[role]] as number,
  lineHeight: theme.typography[LEADING_KEY[role]] as number,
});
