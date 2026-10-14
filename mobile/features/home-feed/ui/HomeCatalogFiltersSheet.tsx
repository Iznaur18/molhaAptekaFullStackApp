import {
  buildCatalogPricePresets,
  CATALOG_FILTERS_BENEFIT_FLAGS,
  CATALOG_FILTERS_MORE_FLAGS,
  CATALOG_FILTERS_SELLER_FLAGS,
  CATALOG_FILTERS_SHEET_SORTS,
  createEmptyCatalogFiltersDraft,
  isCatalogFiltersDraftEmpty,
  isCatalogPricePresetSelected,
  toggleCatalogFiltersDelivery,
  toggleCatalogFiltersRating,
  toggleCatalogPricePreset,
  type CatalogFiltersDraft,
  type CatalogFiltersFlagKey,
} from "@izibuy/shared-lib";
import { useRouter } from "expo-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { CatalogListFilters } from "@/entities/product/model/catalogListFilters";
import { useCatalogProductFacetsQuery } from "@/entities/product/model/useCatalogProductFacetsQuery";
import { VIEWER_REGION_PICKER_SHEET_ANIMATION } from "@/entities/region/lib/viewerRegionPickerSheetAnimation";
import { useViewerRegionPickerSheetAnimation } from "@/entities/region/model/useViewerRegionPickerSheetAnimation";
import { buildHomeCatalogFiltersFacetsParams } from "@/features/home-feed/lib/buildHomeCatalogFiltersFacetsParams";
import {
  homeCatalogFeedFiltersFromDraft,
  homeCatalogFeedFiltersToDraft,
  type HomeCatalogFeedFiltersState,
} from "@/features/home-feed/model/homeCatalogFeedFilters";
import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import { pluralizeRu } from "@/shared/lib/pluralizeRu";
import {
  formatIntegerGroupRu,
  formatRubPriceInput,
  parseRubPriceInput,
} from "@/shared/lib/rubPriceInput";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useRegisterBlockingOverlay } from "@/shared/lib/useBlockingOverlayOccupancy";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";
import { SquircleView } from "@/shared/ui/SquircleView";

/** Паритет web `CatalogFiltersSheet.css` (он сам повторяет окно региона). */
const SHEET_MAX_HEIGHT_PX = VIEWER_REGION_PICKER_SHEET_ANIMATION.maxHeightPx;
const SHEET_DESKTOP_BREAKPOINT_PX = 641;
const SHEET_DESKTOP_MAX_WIDTH_PX = 416;
const SHEET_TOP_RADIUS = 32;
const SHEET_INLINE_PADDING = 16;
/** Пауза после последнего нажатия, прежде чем пересчитать товары. */
const CATALOG_FILTERS_COUNT_DEBOUNCE_MS = 300;

const OPTION_UI = HOME_PAGE_UI.CATALOG_FILTERS_SHEET_OPTION;

const DELIVERY_OPTIONS = [
  { value: "seller", label: OPTION_UI.deliverySeller },
  { value: "courier", label: OPTION_UI.deliveryCourier },
  { value: "carrier", label: OPTION_UI.deliveryCarrier },
] as const;

const useHomeCatalogFiltersSheetStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetShell: {
    width: "100%",
    zIndex: 1,
  },
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
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerAction: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  reset: {
    color: theme.colors.action,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    gap: 20,
    paddingHorizontal: SHEET_INLINE_PADDING,
    paddingTop: 4,
    paddingBottom: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  rulesLink: {
    alignSelf: "flex-start",
    fontSize: 13,
    color: theme.colors.textMuted,
    textDecorationLine: "underline",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
  },
  chipSelected: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 17,
    color: theme.colors.text,
  },
  chipLabelSelected: {
    color: theme.colors.onContrast,
  },
  chipCount: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 17,
    color: theme.colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
  priceRow: {
    flexDirection: "row",
    gap: 8,
  },
  priceField: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
  },
  pricePrefix: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  priceInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  pricePlaceholder: {
    color: theme.colors.textPlaceholder,
  },
  footer: {
    flexShrink: 0,
    paddingHorizontal: SHEET_INLINE_PADDING,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  applyCounting: {
    opacity: 0.8,
  },
}));

type HomeCatalogFiltersSheetStyles = ReturnType<
  typeof useHomeCatalogFiltersSheetStyles
>;

const resolveSheetMaxWidth = (windowWidth: number): number =>
  windowWidth >= SHEET_DESKTOP_BREAKPOINT_PX
    ? Math.min(SHEET_DESKTOP_MAX_WIDTH_PX, windowWidth)
    : windowWidth;

const resolveSheetHeight = (windowHeight: number): number =>
  Math.min(
    Math.round(windowHeight * VIEWER_REGION_PICKER_SHEET_ANIMATION.maxHeightRatio),
    SHEET_MAX_HEIGHT_PX,
  );

type HomeCatalogFiltersSheetProps = {
  open: boolean;
  /** Применённые фильтры ленты — из них черновик при открытии. */
  appliedFilters: HomeCatalogFeedFiltersState;
  /** Запрос ленты целиком: поиск, категория и регион для счётчиков. */
  catalogFilters: CatalogListFilters;
  onClose: () => void;
  onApply: (next: HomeCatalogFeedFiltersState) => void;
};

/**
 * Окно фильтров каталога (паритет web `CatalogFiltersSheet`): черновик внутри
 * окна, лента меняется только по «Показать N товаров».
 */
export function HomeCatalogFiltersSheet({
  open,
  appliedFilters,
  catalogFilters,
  onClose,
  onApply,
}: HomeCatalogFiltersSheetProps) {
  const styles = useHomeCatalogFiltersSheetStyles();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const sheetHeight = resolveSheetHeight(windowHeight);
  const sheetMaxWidth = resolveSheetMaxWidth(windowWidth);
  const { modalVisible, backdropAnimatedStyle, sheetAnimatedStyle, useCssTransition } =
    useViewerRegionPickerSheetAnimation(open, sheetHeight);
  useRegisterBlockingOverlay(modalVisible);

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
        <BackdropContainer
          style={[styles.backdrop, backdropAnimatedStyle]}
          pointerEvents="box-none"
        >
          <ModalSheetGradientBackdrop />
          <Pressable
            style={styles.backdropPressable}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_CLOSE}
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
            accessibilityViewIsModal
            accessibilityLabel={HOME_PAGE_UI.CATALOG_FILTERS_SECTION_LABEL}
          >
            {/* Черновик живёт, пока окно смонтировано: закрыли без «Показать» — пропал. */}
            <HomeCatalogFiltersSheetContent
              styles={styles}
              bottomInset={insets.bottom}
              appliedFilters={appliedFilters}
              catalogFilters={catalogFilters}
              onClose={onClose}
              onApply={onApply}
            />
          </SquircleView>
        </SheetContainer>
      </View>
    </Modal>
  );
}

type HomeCatalogFiltersSheetContentProps = Omit<
  HomeCatalogFiltersSheetProps,
  "open"
> & {
  styles: HomeCatalogFiltersSheetStyles;
  bottomInset: number;
};

function HomeCatalogFiltersSheetContent({
  styles,
  bottomInset,
  appliedFilters,
  catalogFilters,
  onClose,
  onApply,
}: HomeCatalogFiltersSheetContentProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<CatalogFiltersDraft>(() =>
    homeCatalogFeedFiltersToDraft(appliedFilters),
  );
  const countedDraft = useDebouncedValue(draft, CATALOG_FILTERS_COUNT_DEBOUNCE_MS);
  const facetsParams = useMemo(
    () => buildHomeCatalogFiltersFacetsParams(catalogFilters, countedDraft),
    [catalogFilters, countedDraft],
  );
  const facetsQuery = useCatalogProductFacetsQuery({
    params: facetsParams,
    enabled: true,
  });
  const facets = facetsQuery.data ?? null;
  const options = facets?.options ?? null;
  const isCounting = draft !== countedDraft || facetsQuery.isFetching;
  const pricePresets = useMemo(
    () => buildCatalogPricePresets(facets?.price ?? null),
    [facets?.price],
  );

  const toggleFlag = (key: CatalogFiltersFlagKey) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePriceChange = (key: "priceMin" | "priceMax", raw: string) => {
    setDraft((prev) => ({
      ...prev,
      [key]: parseRubPriceInput(formatRubPriceInput(raw)),
    }));
  };

  const handleApply = () => {
    onApply(homeCatalogFeedFiltersFromDraft(draft, appliedFilters));
    onClose();
  };

  const handleOpenRankingRules = () => {
    onClose();
    router.push("/legal/ranking");
  };

  const renderFlag = (key: CatalogFiltersFlagKey) => (
    <CatalogFilterChip
      key={key}
      styles={styles}
      label={OPTION_UI[key]}
      count={options?.[key]}
      selected={draft[key] === true}
      onPress={() => toggleFlag(key)}
    />
  );

  const total = facets?.total ?? null;
  const isNothingFound = total === 0 && !isCounting;
  const applyLabel =
    total == null
      ? HOME_PAGE_UI.CATALOG_FILTERS_SHEET_SHOW_PENDING
      : isNothingFound
        ? HOME_PAGE_UI.CATALOG_FILTERS_SHEET_NOTHING_FOUND
        : `${HOME_PAGE_UI.CATALOG_FILTERS_SHEET_SHOW} ${formatIntegerGroupRu(total)} ${pluralizeRu(
            total,
            HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRODUCT_FORMS,
          )}`;

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {HOME_PAGE_UI.CATALOG_FILTERS_SECTION_LABEL}
        </Text>
        <View style={styles.headerActions}>
          {isCatalogFiltersDraftEmpty(draft) ? null : (
            <Pressable
              onPress={() => setDraft(createEmptyCatalogFiltersDraft())}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={[styles.headerAction, styles.reset]}>
                {HOME_PAGE_UI.CATALOG_FILTERS_SHEET_RESET}
              </Text>
            </Pressable>
          )}
          <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
            <Text style={styles.headerAction}>
              {HOME_PAGE_UI.CATALOG_FILTERS_SHEET_CLOSE}
            </Text>
          </Pressable>
        </View>
      </View>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CatalogFiltersSection
          styles={styles}
          title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_SORT}
          after={
            <Pressable
              onPress={handleOpenRankingRules}
              accessibilityRole="link"
              hitSlop={6}
            >
              <Text style={styles.rulesLink}>
                {HOME_PAGE_UI.CATALOG_FILTERS_SHEET_RANKING_RULES}
              </Text>
            </Pressable>
          }
        >
          {CATALOG_FILTERS_SHEET_SORTS.map((sort) => (
            <CatalogFilterChip
              key={sort}
              styles={styles}
              label={OPTION_UI[sort]}
              selected={draft.sort === sort}
              onPress={() =>
                setDraft((prev) => (prev.sort === sort ? prev : { ...prev, sort }))
              }
            />
          ))}
        </CatalogFiltersSection>

        <CatalogFiltersSection
          styles={styles}
          title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRICE}
          before={
            <View style={styles.priceRow}>
              <CatalogPriceField
                styles={styles}
                prefix={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRICE_FROM}
                accessibilityLabel={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRICE_FROM_ARIA}
                placeholder={
                  facets?.price
                    ? formatIntegerGroupRu(Math.floor(facets.price.min))
                    : ""
                }
                value={draft.priceMin}
                onChange={(raw) => handlePriceChange("priceMin", raw)}
              />
              <CatalogPriceField
                styles={styles}
                prefix={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRICE_TO}
                accessibilityLabel={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRICE_TO_ARIA}
                placeholder={
                  facets?.price ? formatIntegerGroupRu(Math.ceil(facets.price.max)) : ""
                }
                value={draft.priceMax}
                onChange={(raw) => handlePriceChange("priceMax", raw)}
              />
            </View>
          }
        >
          {pricePresets.map((value) => (
            <CatalogFilterChip
              key={value}
              styles={styles}
              label={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_PRICE_UP_TO(
                formatIntegerGroupRu(value),
              )}
              selected={isCatalogPricePresetSelected(draft, value)}
              onPress={() => setDraft((prev) => toggleCatalogPricePreset(prev, value))}
            />
          ))}
        </CatalogFiltersSection>

        <CatalogFiltersSection
          styles={styles}
          title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_DELIVERY}
        >
          {DELIVERY_OPTIONS.map(({ value, label }) => (
            <CatalogFilterChip
              key={value}
              styles={styles}
              label={label}
              count={options?.delivery[value]}
              selected={draft.delivery.includes(value)}
              onPress={() =>
                setDraft((prev) => ({
                  ...prev,
                  delivery: toggleCatalogFiltersDelivery(prev.delivery, value),
                }))
              }
            />
          ))}
          {renderFlag("pickupOnly")}
          {/* null в фасетах — гость или нет адреса: «Рядом» недоступно. */}
          {options?.near != null || draft.near ? renderFlag("near") : null}
        </CatalogFiltersSection>

        <CatalogFiltersSection
          styles={styles}
          title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_RATING}
        >
          <CatalogFilterChip
            styles={styles}
            label={OPTION_UI.ratingMin4}
            count={options?.ratingMin4}
            selected={draft.ratingMin != null}
            onPress={() => setDraft(toggleCatalogFiltersRating)}
          />
          {renderFlag("withReviews")}
        </CatalogFiltersSection>

        <CatalogFiltersSection
          styles={styles}
          title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_BENEFIT}
        >
          {CATALOG_FILTERS_BENEFIT_FLAGS.map(renderFlag)}
        </CatalogFiltersSection>

        <CatalogFiltersSection
          styles={styles}
          title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_SELLER}
        >
          {CATALOG_FILTERS_SELLER_FLAGS.map(renderFlag)}
          {options?.followingOnly != null || draft.followingOnly
            ? renderFlag("followingOnly")
            : null}
        </CatalogFiltersSection>

        <CatalogFiltersSection
          styles={styles}
          title={HOME_PAGE_UI.CATALOG_FILTERS_SHEET_MORE}
        >
          {CATALOG_FILTERS_MORE_FLAGS.map(renderFlag)}
        </CatalogFiltersSection>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(16, bottomInset) }]}>
        <AppButton
          label={applyLabel}
          disabled={isNothingFound}
          style={isCounting && total != null ? styles.applyCounting : undefined}
          accessibilityState={{ busy: isCounting, disabled: isNothingFound }}
          onPress={handleApply}
        />
      </View>
    </>
  );
}

function CatalogFiltersSection({
  styles,
  title,
  before = null,
  after = null,
  children,
}: {
  styles: HomeCatalogFiltersSheetStyles;
  title: string;
  before?: ReactNode;
  after?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {before}
      <View style={styles.chips}>{children}</View>
      {after}
    </View>
  );
}

/**
 * Вариант фильтра. Рядом — сколько товаров останется, если его включить;
 * с нулём вариант неактивен (выбранный можно снять всегда).
 */
function CatalogFilterChip({
  styles,
  label,
  count,
  selected,
  onPress,
}: {
  styles: HomeCatalogFiltersSheetStyles;
  label: string;
  count?: number | null;
  selected: boolean;
  onPress: () => void;
}) {
  const hasCount = typeof count === "number";
  const disabled = hasCount && count === 0 && !selected;
  return (
    <Pressable
      style={[
        styles.chip,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
      ]}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
        {label}
      </Text>
      {hasCount && !selected ? (
        <Text style={styles.chipCount}>{formatIntegerGroupRu(count)}</Text>
      ) : null}
    </Pressable>
  );
}

function CatalogPriceField({
  styles,
  prefix,
  accessibilityLabel,
  placeholder,
  value,
  onChange,
}: {
  styles: HomeCatalogFiltersSheetStyles;
  prefix: string;
  accessibilityLabel: string;
  placeholder: string;
  value: number | null;
  onChange: (raw: string) => void;
}) {
  return (
    <View style={styles.priceField}>
      <Text style={styles.pricePrefix}>{prefix}</Text>
      <TextInput
        style={styles.priceInput}
        value={value == null ? "" : formatIntegerGroupRu(value)}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={styles.pricePlaceholder.color}
        keyboardType="number-pad"
        inputMode="numeric"
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}
