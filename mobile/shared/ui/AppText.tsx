import { Text, type TextProps } from "react-native";

import { FIXED_FONT_PROPS } from "@/shared/lib/fixedTypography";

type AppTextProps = TextProps & {
  /** false — разрешить системное масштабирование шрифта */
  fixedFontSize?: boolean;
};

export const AppText = ({
  fixedFontSize = true,
  allowFontScaling,
  ...props
}: AppTextProps) => (
  <Text
    {...props}
    allowFontScaling={
      allowFontScaling ?? (fixedFontSize ? FIXED_FONT_PROPS.allowFontScaling : true)
    }
  />
);
