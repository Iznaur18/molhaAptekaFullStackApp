import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { CHECKOUT_FORM_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCdekPickupPointPickerStyles } from "@/shared/theme/formChromeStyles";

/** Сколько пунктов показываем сразу; остальные находятся поиском по адресу. */
export const CARRIER_POINTS_VISIBLE_LIMIT = 20;

export type CarrierPickupPoint = {
  id: string;
  /** Адрес пункта — по нему же идёт поиск. */
  title: string;
  /** Часы работы или как найти — видно у выбранного пункта. */
  details?: string;
};

type CarrierPickupPointListProps = {
  label: string;
  points: readonly CarrierPickupPoint[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

/**
 * Список пунктов выдачи службы доставки — общий для СДЭК и Яндекса.
 *
 * В большом городе пунктов сотни: на сайте это выпадающий список, здесь —
 * поиск по адресу и первые совпадения, иначе шторка превращается в простыню.
 */
export const CarrierPickupPointList = ({
  label,
  points,
  selectedId,
  onSelect,
  disabled = false,
}: CarrierPickupPointListProps) => {
  const styles = useCdekPickupPointPickerStyles();
  const theme = useAppTheme();
  const [query, setQuery] = useState("");

  const selectedPoint = points.find((point) => point.id === selectedId) ?? null;
  const matchedPoints = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? points.filter((point) => point.title.toLowerCase().includes(needle))
      : points;
  }, [points, query]);
  const visiblePoints = useMemo(() => {
    const head = matchedPoints.slice(0, CARRIER_POINTS_VISIBLE_LIMIT);
    // Выбранный пункт остаётся на виду, даже если поиск его уже не находит.
    return selectedPoint && !head.includes(selectedPoint)
      ? [selectedPoint, ...head]
      : head;
  }, [matchedPoints, selectedPoint]);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {points.length > CARRIER_POINTS_VISIBLE_LIMIT ? (
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={CHECKOUT_FORM_UI.CDEK_POINT_SEARCH_PLACEHOLDER}
          placeholderTextColor={theme.colors.textMuted}
          editable={!disabled}
        />
      ) : null}
      <View style={styles.options} accessibilityRole="radiogroup">
        {visiblePoints.map((point) => {
          const active = point.id === selectedId;
          return (
            <Pressable
              key={point.id}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => onSelect(point.id)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ checked: active, disabled }}
            >
              <Text style={styles.optionTitle}>{point.title}</Text>
              {active && point.details ? (
                <Text style={styles.optionMeta}>{point.details}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {matchedPoints.length > visiblePoints.length ? (
        <Text style={styles.hint}>
          {CHECKOUT_FORM_UI.CDEK_POINTS_MORE(
            visiblePoints.length,
            matchedPoints.length,
          )}
        </Text>
      ) : null}
      {matchedPoints.length === 0 ? (
        <Text style={styles.hint}>{CHECKOUT_FORM_UI.CDEK_POINTS_NOT_MATCHED}</Text>
      ) : null}
      {!selectedPoint && matchedPoints.length > 0 ? (
        <Text style={styles.hint}>{CHECKOUT_FORM_UI.CDEK_POINT_PLACEHOLDER}</Text>
      ) : null}
    </View>
  );
};
