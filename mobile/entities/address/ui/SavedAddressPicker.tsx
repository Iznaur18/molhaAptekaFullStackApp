import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CHECKOUT_SAVED_ADDRESS_CUSTOM_ID } from "@/entities/address/lib/deliveryAddressFromSaved";
import { USER_SAVED_ADDRESSES_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

export type SavedAddressPickerItem = {
  id: string;
  label?: string;
  line: string;
  flat?: string;
  isDefault?: boolean;
};

type SavedAddressPickerProps = {
  addresses: SavedAddressPickerItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  /** Ниже этого числа адресов список не показываем. */
  minCount?: number;
  sectionLabel: string;
  /** В режиме мультиселекта не показывается — там нет «другого адреса». */
  otherLabel?: string;
  /**
   * Мультиселект: чекбоксы вместо радио, пункта «указать другой» нет.
   * Так веб выбирает точки самовывоза при создании товара.
   */
  multiSelect?: boolean;
  selectedIds?: readonly string[];
  onToggle?: (id: string) => void;
  /** Адрес без координат выбрать нельзя — точке нужны lat/lon. */
  isOptionDisabled?: (id: string) => boolean;
  optionHint?: (id: string) => string | null;
  layout?: "list" | "carousel";
};

/**
 * Радиогруппа сохранённых адресов + пункт «указать другой».
 * Порт `client/src/entities/address/ui/SavedAddressPicker.jsx` (+ его CSS).
 */
export const SavedAddressPicker = ({
  addresses,
  selectedId,
  onSelect,
  disabled = false,
  minCount = 1,
  sectionLabel,
  otherLabel,
  multiSelect = false,
  selectedIds = [],
  onToggle,
  isOptionDisabled,
  optionHint,
  layout = "list",
}: SavedAddressPickerProps) => {
  const theme = useAppTheme();
  const isCarousel = layout === "carousel";

  if (!Array.isArray(addresses) || addresses.length < minCount) {
    return null;
  }

  const optionStyle = (active: boolean) => [
    styles.option,
    isCarousel && styles.optionCarousel,
    isCarousel
      ? {
          borderColor: active ? theme.colors.action : theme.colors.actionSoft,
          backgroundColor: active ? theme.colors.surface : theme.colors.actionSoft,
        }
      : {
          borderColor: active ? theme.colors.action : theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
    active && !isCarousel && { borderWidth: 2 },
    active && isCarousel && styles.optionCarouselActive,
    disabled && styles.optionDisabled,
  ];

  const labelColor = (active: boolean) =>
    isCarousel ? (active ? theme.colors.text : theme.colors.action) : theme.colors.text;

  const renderOption = (
    key: string,
    active: boolean,
    optionDisabled: boolean,
    onPress: () => void,
    content: ReactNode,
    accessibilityLabel?: string,
  ) => (
    <Pressable
      key={key}
      accessibilityRole={multiSelect ? "checkbox" : "radio"}
      accessibilityState={{ checked: active, disabled: optionDisabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={optionDisabled}
      onPress={onPress}
      style={[optionStyle(active), optionDisabled && styles.optionDisabled]}
    >
      {content}
    </Pressable>
  );

  const addressOptions = addresses.map((item) => {
    const active = multiSelect ? selectedIds.includes(item.id) : selectedId === item.id;
    const optionDisabled = disabled || isOptionDisabled?.(item.id) === true;
    const hint = optionHint?.(item.id) ?? null;
    const textColor = labelColor(active);

    return renderOption(
      item.id,
      active,
      optionDisabled,
      () => (multiSelect ? onToggle?.(item.id) : onSelect(item.id)),
      <>
        {item.label ? (
          <Text style={[styles.optionLabel, isCarousel && styles.optionLabelCarousel, { color: textColor }]}>
            {item.label}
          </Text>
        ) : null}
        <Text
          style={[styles.optionLine, isCarousel && styles.optionLineCarousel, { color: textColor }]}
          numberOfLines={isCarousel ? 4 : undefined}
        >
          {USER_SAVED_ADDRESSES_UI.FORMAT_LINE(item.line, item.flat ?? "")}
        </Text>
        {item.isDefault ? (
          <Text
            style={[
              styles.optionBadge,
              {
                color: active || !isCarousel ? theme.colors.textSecondary : theme.colors.action,
              },
            ]}
          >
            {USER_SAVED_ADDRESSES_UI.LABEL_DEFAULT}
          </Text>
        ) : null}
        {hint ? (
          <Text style={[styles.optionBadge, { color: theme.colors.textMuted }]}>{hint}</Text>
        ) : null}
      </>,
      item.label ?? USER_SAVED_ADDRESSES_UI.FORMAT_LINE(item.line, item.flat ?? ""),
    );
  });

  const otherOption =
    multiSelect || !otherLabel ? null : renderOption(
      CHECKOUT_SAVED_ADDRESS_CUSTOM_ID,
      selectedId === CHECKOUT_SAVED_ADDRESS_CUSTOM_ID,
      disabled,
      () => onSelect(CHECKOUT_SAVED_ADDRESS_CUSTOM_ID),
      (
        <Text
          style={[
            styles.optionLine,
            isCarousel && styles.optionLineCarousel,
            { color: labelColor(selectedId === CHECKOUT_SAVED_ADDRESS_CUSTOM_ID) },
          ]}
          numberOfLines={isCarousel ? 4 : undefined}
        >
          {otherLabel}
        </Text>
      ),
      otherLabel,
    );

  const listContent = (
    <>
      {addressOptions}
      {otherOption}
    </>
  );

  return (
    <View style={[styles.root, isCarousel && styles.rootCarousel]}>
      {!isCarousel ? (
        <Text style={[styles.label, { color: theme.colors.text }]}>{sectionLabel}</Text>
      ) : null}
      {isCarousel ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listCarousel}
          accessibilityRole={multiSelect ? "list" : "radiogroup"}
        >
          {listContent}
        </ScrollView>
      ) : (
        <View style={styles.list} accessibilityRole={multiSelect ? "list" : "radiogroup"}>
          {listContent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  rootCarousel: {
    gap: 0,
  },
  label: {
    fontSize: 15.2,
    fontWeight: "700",
  },
  list: {
    gap: 8,
  },
  listCarousel: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 4,
  },
  option: {
    gap: 4,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 10,
  },
  optionCarousel: {
    width: 168,
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCarouselActive: {
    borderWidth: 2,
  },
  optionDisabled: {
    opacity: 0.55,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  optionLabelCarousel: {
    textAlign: "center",
  },
  optionLine: {
    fontSize: 14,
    lineHeight: 19.6,
  },
  optionLineCarousel: {
    fontSize: 13,
    lineHeight: 17,
    textAlign: "center",
  },
  optionBadge: {
    fontSize: 12,
    textAlign: "center",
  },
});
