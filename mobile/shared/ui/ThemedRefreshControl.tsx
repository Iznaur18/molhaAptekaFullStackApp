import { RefreshControl, type RefreshControlProps } from "react-native";

import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type ThemedRefreshControlProps = Omit<RefreshControlProps, "tintColor" | "colors">;

export const ThemedRefreshControl = (props: ThemedRefreshControlProps) => {
  const theme = useAppTheme();
  const tint = theme.colors.action;

  return <RefreshControl tintColor={tint} colors={[tint]} {...props} />;
};
