import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";

import { PRODUCT_DEAL_ACTIONS_UI } from "@/shared/config";
import { useDealRequestTimePickerStyles } from "@/shared/theme/dealRequestStyles";

import {
  buildDealRequestDayOptions,
  clampDealRequestTimeToFuture,
  DEAL_REQUEST_HOURS,
  DEAL_REQUEST_MINUTES,
  formatTwoDigits,
  startOfLocalDay,
  type DealRequestTimeParts,
} from "../lib/dealRequestTime";

type ChipProps = {
  label: string;
  active: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const Chip = ({
  label,
  active,
  disabled = false,
  accessibilityLabel,
  onPress,
  onLayout,
}: ChipProps) => {
  const styles = useDealRequestTimePickerStyles();
  return (
    <Pressable
      style={[
        styles.chip,
        active && styles.chipActive,
        disabled && !active && styles.chipDisabled,
      ]}
      disabled={disabled}
      onPress={onPress}
      onLayout={onLayout}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active, disabled }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
};

/**
 * Ряд прокручивается к выбранному чипу: иначе «15» или «Пн 2 ноя» остаются за
 * краем, и непонятно, что выбрано.
 */
const useScrollToSelectedChip = (selectedKey: number) => {
  const scrollRef = useRef<ScrollView>(null);
  const chipOffsets = useRef(new Map<number, number>());
  const viewportWidth = useRef(0);

  const scrollToKey = useCallback((key: number, animated: boolean) => {
    const x = chipOffsets.current.get(key);
    if (x == null) {
      return;
    }
    scrollRef.current?.scrollTo({
      x: Math.max(0, x - viewportWidth.current / 3),
      animated,
    });
  }, []);

  useEffect(() => {
    scrollToKey(selectedKey, true);
  }, [selectedKey, scrollToKey]);

  return {
    scrollRef,
    onViewportLayout: (event: LayoutChangeEvent) => {
      viewportWidth.current = event.nativeEvent.layout.width;
      scrollToKey(selectedKey, false);
    },
    onChipLayout: (key: number) => (event: LayoutChangeEvent) => {
      chipOffsets.current.set(key, event.nativeEvent.layout.x);
      if (key === selectedKey) {
        scrollToKey(key, false);
      }
    },
  };
};

type DealRequestTimePickerProps = {
  value: DealRequestTimeParts;
  onChange: (next: DealRequestTimeParts) => void;
  dateLabel?: string;
  timeLabel?: string;
};

/**
 * Дата и время без нативного календаря: дни чипами на две недели, часы и
 * минуты с шагом 15, как `step={900}` у поля времени на сайте. Прошедшие
 * сегодня часы и минуты недоступны.
 */
export const DealRequestTimePicker = ({
  value,
  onChange,
  dateLabel = PRODUCT_DEAL_ACTIONS_UI.FIELD_DATE,
  timeLabel = PRODUCT_DEAL_ACTIONS_UI.FIELD_CLOCK,
}: DealRequestTimePickerProps) => {
  const styles = useDealRequestTimePickerStyles();
  const now = new Date();
  const todayValue = startOfLocalDay(now).getTime();
  const selectedDayValue = value.dayValue;
  const dayRow = useScrollToSelectedChip(value.dayValue);
  const hourRow = useScrollToSelectedChip(value.hour);

  const days = useMemo(
    () =>
      buildDealRequestDayOptions(
        new Date(),
        {
          today: PRODUCT_DEAL_ACTIONS_UI.DAY_TODAY,
          tomorrow: PRODUCT_DEAL_ACTIONS_UI.DAY_TOMORROW,
        },
        new Date(selectedDayValue),
      ),
    [selectedDayValue],
  );

  const isToday = value.dayValue === todayValue;
  const isHourPast = (hour: number) => isToday && hour < now.getHours();
  const isMinutePast = (minute: number) =>
    isToday &&
    (value.hour < now.getHours() ||
      (value.hour === now.getHours() && minute <= now.getMinutes()));

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{dateLabel}</Text>
      <ScrollView
        ref={dayRow.scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.row}
        contentContainerStyle={styles.rowContent}
        keyboardShouldPersistTaps="handled"
        onLayout={dayRow.onViewportLayout}
      >
        {days.map((day) => (
          <Chip
            key={day.value}
            label={day.label}
            active={day.value === value.dayValue}
            onLayout={dayRow.onChipLayout(day.value)}
            onPress={() =>
              onChange(clampDealRequestTimeToFuture({ ...value, dayValue: day.value }))
            }
          />
        ))}
      </ScrollView>

      <Text style={styles.label}>{timeLabel}</Text>
      <ScrollView
        ref={hourRow.scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.row}
        contentContainerStyle={styles.rowContent}
        keyboardShouldPersistTaps="handled"
        onLayout={hourRow.onViewportLayout}
      >
        {DEAL_REQUEST_HOURS.map((hour) => (
          <Chip
            key={hour}
            label={formatTwoDigits(hour)}
            active={hour === value.hour}
            disabled={isHourPast(hour)}
            accessibilityLabel={PRODUCT_DEAL_ACTIONS_UI.FIELD_HOUR_ARIA(
              formatTwoDigits(hour),
            )}
            onLayout={hourRow.onChipLayout(hour)}
            onPress={() => onChange(clampDealRequestTimeToFuture({ ...value, hour }))}
          />
        ))}
      </ScrollView>
      <View style={styles.minuteRow}>
        {DEAL_REQUEST_MINUTES.map((minute) => (
          <Chip
            key={minute}
            label={`:${formatTwoDigits(minute)}`}
            active={minute === value.minute}
            disabled={isMinutePast(minute)}
            accessibilityLabel={PRODUCT_DEAL_ACTIONS_UI.FIELD_MINUTE_ARIA(
              formatTwoDigits(minute),
            )}
            onPress={() => onChange({ ...value, minute })}
          />
        ))}
      </View>
    </View>
  );
};
