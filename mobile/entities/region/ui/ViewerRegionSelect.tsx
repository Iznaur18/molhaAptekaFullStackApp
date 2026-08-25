import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Pressable } from "react-native";

import { RuRegionPickerSheet } from "./RuRegionPickerSheet";
import { REGION_UI } from "@/shared/config";
import {
  HOME_CATALOG_HEADER_CIRCLE_BUTTON_BORDER_WIDTH,
  HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
} from "@/shared/lib/homeCatalogHeaderLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

type ViewerRegionSelectProps = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

const HEADER_CIRCLE_ICON_SIZE = 22;

const useViewerRegionSelectStyles = createThemedStyles((theme) => ({
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
  buttonActive: {
    opacity: 1,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
}));

/** MapPin CTA в шапке каталога (паритет web ViewerRegionSelect). */
export function ViewerRegionSelect({
  value,
  onChange,
  disabled = false,
}: ViewerRegionSelectProps) {
  const theme = useAppTheme();
  const styles = useViewerRegionSelectStyles();
  const [open, setOpen] = useState(false);

  const openSheet = () => {
    if (disabled) return;
    setOpen(true);
  };

  return (
    <>
      <Pressable
        style={[
          styles.button,
          open && styles.buttonActive,
          disabled && styles.buttonDisabled,
        ]}
        disabled={disabled}
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityLabel={REGION_UI.VIEWER_ARIA}
        accessibilityState={{ expanded: open, disabled }}
      >
        <MaterialIcons
          name="location-on"
          size={HEADER_CIRCLE_ICON_SIZE}
          color={theme.colors.onContrast}
        />
      </Pressable>
      <RuRegionPickerSheet
        open={open}
        value={value}
        onClose={() => setOpen(false)}
        onSelect={(code) => {
          onChange(code);
          setOpen(false);
        }}
      />
    </>
  );
}
