import SlidersHorizontal from "lucide-react-native/icons/sliders-horizontal";
import { Pressable } from "react-native";

import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import {
  HOME_CATALOG_HEADER_CIRCLE_BUTTON_BORDER_WIDTH,
  HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
} from "@/shared/lib/homeCatalogHeaderLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const HEADER_CIRCLE_ICON_SIZE = 20;

const useHomeCatalogFiltersButtonStyles = createThemedStyles((theme) => ({
  button: {
    width: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    height: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE / 2,
    borderWidth: HOME_CATALOG_HEADER_CIRCLE_BUTTON_BORDER_WIDTH,
    borderColor: "transparent",
    backgroundColor: theme.colors.action,
    shadowColor: theme.colors.action,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
}));

type HomeCatalogFiltersButtonProps = {
  /** Окно открыто — для экранного диктора. */
  expanded: boolean;
  /** В ленте выбраны фильтры окна. */
  active: boolean;
  onPress: () => void;
};

/** Ползунки в шапке каталога (паритет web: кнопка рядом с меню, окно снизу). */
export function HomeCatalogFiltersButton({
  expanded,
  active,
  onPress,
}: HomeCatalogFiltersButtonProps) {
  const theme = useAppTheme();
  const styles = useHomeCatalogFiltersButtonStyles();

  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        active
          ? HOME_PAGE_UI.CATALOG_FILTER_BUTTON_ARIA_ACTIVE
          : HOME_PAGE_UI.CATALOG_FILTER_BUTTON_ARIA
      }
      accessibilityState={{ expanded }}
    >
      <SlidersHorizontal
        size={HEADER_CIRCLE_ICON_SIZE}
        color={theme.colors.onContrast}
        strokeWidth={2.25}
      />
    </Pressable>
  );
}
