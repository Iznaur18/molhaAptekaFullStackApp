import { Text, type StyleProp, type TextProps, type TextStyle } from "react-native";

import { FIXED_FONT_PROPS } from "@/shared/lib/fixedTypography";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { resolveTypeScale, type TypeScaleRole } from "@/shared/theme/typeScale";

type AppTextProps = TextProps & {
  /** false — разрешить системное масштабирование шрифта */
  fixedFontSize?: boolean;
  /**
   * Шкала `@izibuy/design-tokens` / web `--iz-font-*`.
   * Без variant — только fixedFont props (как раньше).
   */
  variant?: TypeScaleRole;
  style?: StyleProp<TextStyle>;
};

export const AppText = ({
  fixedFontSize = true,
  allowFontScaling,
  variant,
  style,
  ...props
}: AppTextProps) => {
  const theme = useAppTheme();
  const typeStyle = variant ? resolveTypeScale(theme, variant) : null;

  return (
    <Text
      {...props}
      allowFontScaling={
        allowFontScaling ?? (fixedFontSize ? FIXED_FONT_PROPS.allowFontScaling : true)
      }
      style={[typeStyle, style]}
    />
  );
};
