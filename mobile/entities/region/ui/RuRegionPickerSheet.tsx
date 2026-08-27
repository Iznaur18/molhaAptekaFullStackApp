import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { filterRuRegionsByQuery } from "@/entities/region/lib/filterRuRegionsByQuery";
import { useViewerRegionPickerSheetAnimation } from "@/entities/region/model/useViewerRegionPickerSheetAnimation";
import { VIEWER_REGION_PICKER_SHEET_ANIMATION } from "@/entities/region/lib/viewerRegionPickerSheetAnimation";
import { REGION_UI } from "@/shared/config";
import { useRegisterBlockingOverlay } from "@/shared/lib/useBlockingOverlayOccupancy";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

/** Паритет web `--viewer-region-sheet-height: min(92svh, 36rem)`. */
const SHEET_MAX_HEIGHT_PX = VIEWER_REGION_PICKER_SHEET_ANIMATION.maxHeightPx;
/** Паритет web `@media (min-width: 641px) max-width: min(26rem, 100%)`. */
const SHEET_DESKTOP_BREAKPOINT_PX = 641;
const SHEET_DESKTOP_MAX_WIDTH_PX = 416;
/** Паритет web `--viewer-region-radius: 2rem`. */
const SHEET_TOP_RADIUS = 32;
const SHEET_INLINE_PADDING = 16;
/** Web `color-mix(ink 55%, transparent)`. */
const SHEET_BACKDROP_SCRIM = "rgba(0, 0, 0, 0.55)";

type RuRegionPickerSheetProps = {
  open: boolean;
  value: string;
  onClose: () => void;
  onSelect: (code: string) => void;
};

type RegionListItem = {
  code: string;
  name: string;
};

const useRuRegionPickerSheetStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SHEET_BACKDROP_SCRIM,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetShell: {
    width: "100%",
    // Выше absoluteFill backdrop — иначе scrim перехватывает тапы по списку.
    zIndex: 1,
  },
  /** Outer SquircleView (shadow) должен иметь bounded height — иначе flex:1 внутри = 0. */
  sheetFill: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  sheetShadow: {
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexShrink: 0,
    paddingHorizontal: SHEET_INLINE_PADDING,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  close: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  searchWrap: {
    flexShrink: 0,
    paddingHorizontal: SHEET_INLINE_PADDING,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  option: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: SHEET_INLINE_PADDING,
  },
  optionSelected: {
    backgroundColor: theme.colors.actionSurface,
  },
  optionLabel: {
    fontSize: 15,
    lineHeight: 20,
    color: theme.colors.text,
  },
  optionLabelSelected: {
    fontWeight: "600",
  },
  empty: {
    paddingVertical: 24,
    paddingHorizontal: SHEET_INLINE_PADDING,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  fieldPlaceholder: {
    color: theme.colors.textMuted,
  },
}));

const resolveSheetMaxWidth = (windowWidth: number): number => {
  if (windowWidth >= SHEET_DESKTOP_BREAKPOINT_PX) {
    return Math.min(SHEET_DESKTOP_MAX_WIDTH_PX, windowWidth);
  }
  return windowWidth;
};

const resolveSheetHeight = (windowHeight: number): number =>
  Math.min(
    Math.round(windowHeight * VIEWER_REGION_PICKER_SHEET_ANIMATION.maxHeightRatio),
    SHEET_MAX_HEIGHT_PX,
  );

export function RuRegionPickerSheet({
  open,
  value,
  onClose,
  onSelect,
}: RuRegionPickerSheetProps) {
  const styles = useRuRegionPickerSheetStyles();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const sheetHeight = resolveSheetHeight(windowHeight);
  const sheetMaxWidth = resolveSheetMaxWidth(windowWidth);
  const { modalVisible, backdropAnimatedStyle, sheetAnimatedStyle, useCssTransition } =
    useViewerRegionPickerSheetAnimation(open, sheetHeight);
  useRegisterBlockingOverlay(modalVisible);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  const filtered = useMemo(
    () => filterRuRegionsByQuery(query, undefined, value),
    [query, value],
  );

  const listContentStyle = useMemo(
    () => [styles.listContent, { paddingBottom: Math.max(24, insets.bottom) }],
    [insets.bottom, styles.listContent],
  );

  const renderOption = ({ item }: { item: RegionListItem }) => {
    const selected = item.code === value;
    return (
      <Pressable
        style={[styles.option, selected && styles.optionSelected]}
        onPress={() => onSelect(item.code)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
          {item.name}
        </Text>
      </Pressable>
    );
  };

  if (!modalVisible) {
    return null;
  }

  const BackdropContainer = useCssTransition ? View : Animated.View;
  const SheetContainer = useCssTransition ? View : Animated.View;

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BackdropContainer style={[styles.backdrop, backdropAnimatedStyle]} pointerEvents="box-none">
          <Pressable
            style={styles.backdropPressable}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={REGION_UI.SHEET_CLOSE}
          />
        </BackdropContainer>

        <SheetContainer
          style={[
            styles.sheetShell,
            { maxWidth: sheetMaxWidth, height: sheetHeight },
            sheetAnimatedStyle,
          ]}
          pointerEvents="box-none"
        >
          <SquircleView
            cornerRadii={{
              topLeft: SHEET_TOP_RADIUS,
              topRight: SHEET_TOP_RADIUS,
              bottomLeft: 0,
              bottomRight: 0,
            }}
            style={styles.sheet}
            outerStyle={styles.sheetFill}
            shadowStyle={styles.sheetShadow}
            // RN не знает роль "dialog" — модальность отдаём через флаг.
            accessibilityViewIsModal
            accessibilityLabel={REGION_UI.SHEET_TITLE}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{REGION_UI.SHEET_TITLE}</Text>
              <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
                <Text style={styles.close}>{REGION_UI.SHEET_CLOSE}</Text>
              </Pressable>
            </View>
            <View style={styles.searchWrap}>
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder={REGION_UI.SEARCH_PLACEHOLDER}
                placeholderTextColor={styles.fieldPlaceholder.color}
                autoCorrect={false}
                autoCapitalize="none"
                accessibilityLabel={REGION_UI.SEARCH_PLACEHOLDER}
              />
            </View>
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              contentContainerStyle={listContentStyle}
              renderItem={renderOption}
              ListEmptyComponent={<Text style={styles.empty}>{REGION_UI.SEARCH_EMPTY}</Text>}
            />
          </SquircleView>
        </SheetContainer>
      </View>
    </Modal>
  );
}
