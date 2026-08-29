import { useState } from "react";
import {
  Pressable,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from "react-native";

import { getUserProfileThumbSrc } from "@/entities/user/lib/getUserProfileThumbSrc";
import type { UserProfileThumbItem } from "@/entities/user/model/userProfileThumbTypes";
import { isReactNativeWeb } from "@/shared/lib/isReactNativeWeb";
import {
  PROFILE_CARD_SQUIRCLE_RADIUS,
  resolveUserProfileThumbColumns,
  USER_PROFILE_THUMB_ROW_SIZE,
  USER_PROFILE_THUMB_SQUIRCLE_RADIUS,
  USER_PROFILE_THUMB_TRACK_HEIGHT,
  useUserProfileThumbListStyles,
} from "@/shared/theme/profileChromeStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { HorizontalOverflowRow } from "@/shared/ui/HorizontalOverflowRow";
import { SquircleView } from "@/shared/ui/SquircleView";

const chunkProfileThumbItems = <TItem,>(items: TItem[], rowSize: number): TItem[][] => {
  const rows: TItem[][] = [];

  for (let index = 0; index < items.length; index += rowSize) {
    rows.push(items.slice(index, index + rowSize));
  }

  return rows;
};

type ThumbPressableProps = {
  item: UserProfileThumbItem;
  thumbSrc: string | null;
  isUnavailable: boolean;
  isCurrent?: boolean;
  onPress: () => void;
  onImageError: () => void;
};

const UserProfileThumbPressable = ({
  item,
  thumbSrc,
  isUnavailable,
  isCurrent = false,
  onPress,
  onImageError,
}: ThumbPressableProps) => {
  const styles = useUserProfileThumbListStyles();
  const isDisabled = isUnavailable || isCurrent;
  const thumbContent = (
    <SquircleView
      radius={USER_PROFILE_THUMB_SQUIRCLE_RADIUS}
      style={[styles.thumbClip, isCurrent && styles.thumbClipCurrent]}
    >
      {thumbSrc ? (
        <View style={styles.thumbImageHost}>
          <CachedProductImage
            uri={thumbSrc}
            style={styles.thumbImage}
            contentFit="cover"
            priority="low"
            onError={onImageError}
          />
        </View>
      ) : (
        <View style={styles.thumbPlaceholder} />
      )}
    </SquircleView>
  );

  if (isReactNativeWeb()) {
    return (
      <TouchableOpacity
        style={[styles.thumbButton, isUnavailable && styles.thumbButtonUnavailable]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={item.productName}
        accessibilityState={{ selected: isCurrent, disabled: isDisabled }}
      >
        {thumbContent}
      </TouchableOpacity>
    );
  }

  return (
    <Pressable
      style={[styles.thumbButton, isUnavailable && styles.thumbButtonUnavailable]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={item.productName}
      accessibilityState={{ selected: isCurrent, disabled: isDisabled }}
    >
      {thumbContent}
    </Pressable>
  );
};

type UserProfileThumbGridProps = {
  items: UserProfileThumbItem[];
  columnsPerRow: number;
  unavailableHint?: string;
  onItemPress: (item: UserProfileThumbItem) => void;
};

export const UserProfileThumbGrid = ({
  items,
  columnsPerRow,
  unavailableHint = "",
  onItemPress,
}: UserProfileThumbGridProps) => {
  const styles = useUserProfileThumbListStyles();
  const [failedThumbIds, setFailedThumbIds] = useState<Set<string>>(() => new Set());

  const markThumbFailed = (productId: string) => {
    setFailedThumbIds((prev) => {
      if (prev.has(productId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  };

  if (items.length === 0) {
    return null;
  }

  const rows = chunkProfileThumbItems(items, columnsPerRow);

  return (
    <>
      <View style={styles.grid}>
        {rows.map((rowItems, rowIndex) => {
          const isPartialRow = rowItems.length < columnsPerRow;

          return (
            <View
              key={`thumb-row-${rowIndex}`}
              style={[styles.gridRow, isPartialRow && styles.gridRowPartial]}
            >
              {rowItems.map((item) => {
                const isUnavailable = !item.viewable || item.product == null;
                const thumbSrc = failedThumbIds.has(item.productId)
                  ? null
                  : getUserProfileThumbSrc(item.product);

                return (
                  <UserProfileThumbPressable
                    key={item.productId}
                    item={item}
                    thumbSrc={thumbSrc}
                    isUnavailable={isUnavailable}
                    onPress={() => onItemPress(item)}
                    onImageError={() => markThumbFailed(item.productId)}
                  />
                );
              })}
            </View>
          );
        })}
      </View>
      {unavailableHint ? (
        <Text style={styles.hint} accessibilityRole="alert">
          {unavailableHint}
        </Text>
      ) : null}
    </>
  );
};

type UserProfileThumbScrollRowProps = {
  items: UserProfileThumbItem[];
  currentProductId?: string;
  unavailableHint?: string;
  onItemPress: (item: UserProfileThumbItem) => void;
};

export const UserProfileThumbScrollRow = ({
  items,
  currentProductId = "",
  unavailableHint = "",
  onItemPress,
}: UserProfileThumbScrollRowProps) => {
  const styles = useUserProfileThumbListStyles();
  const [failedThumbIds, setFailedThumbIds] = useState<Set<string>>(() => new Set());

  const markThumbFailed = (productId: string) => {
    setFailedThumbIds((prev) => {
      if (prev.has(productId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  };

  if (items.length === 0) {
    return null;
  }

  const thumbItems = items.map((item) => {
    const isUnavailable = !item.viewable || item.product == null;
    const isCurrent = currentProductId.length > 0 && String(item.productId) === currentProductId;
    const thumbSrc = failedThumbIds.has(item.productId)
      ? null
      : getUserProfileThumbSrc(item.product);

    return (
      <UserProfileThumbPressable
        key={item.productId}
        item={item}
        thumbSrc={thumbSrc}
        isUnavailable={isUnavailable}
        isCurrent={isCurrent}
        onPress={() => onItemPress(item)}
        onImageError={() => markThumbFailed(item.productId)}
      />
    );
  });

  return (
    <>
      <HorizontalOverflowRow
        height={USER_PROFILE_THUMB_TRACK_HEIGHT}
        trackStyle={styles.scrollRowContent}
      >
        {thumbItems}
      </HorizontalOverflowRow>
      {unavailableHint ? (
        <Text style={styles.hint} accessibilityRole="alert">
          {unavailableHint}
        </Text>
      ) : null}
    </>
  );
};

export type UserProfileThumbSectionLayout = "grid" | "horizontal" | "profile-scroll";

type UserProfileThumbSectionProps = {
  heading: string;
  phase: "loading" | "error" | "success";
  items: UserProfileThumbItem[];
  loadingText: string;
  emptyText: string;
  errorText?: string;
  unavailableText: string;
  onItemPress: (item: UserProfileThumbItem) => void;
  onHeadingPress?: () => void;
  viewAllLabel?: string;
  onViewAllPress?: () => void;
  layout?: UserProfileThumbSectionLayout;
  currentProductId?: string;
};

export const UserProfileThumbSection = ({
  heading,
  phase,
  items,
  loadingText,
  emptyText,
  errorText = "",
  unavailableText,
  onItemPress,
  onHeadingPress,
  viewAllLabel,
  onViewAllPress,
  layout = "grid",
  currentProductId = "",
}: UserProfileThumbSectionProps) => {
  const styles = useUserProfileThumbListStyles();
  const [unavailableHint, setUnavailableHint] = useState("");
  const [columnsPerRow, setColumnsPerRow] = useState(USER_PROFILE_THUMB_ROW_SIZE);
  const isHorizontalChrome = layout === "horizontal";
  const useScrollRow = layout === "horizontal" || layout === "profile-scroll";

  const showViewAll = typeof onViewAllPress === "function" && phase === "success" && items.length > 0;

  const handleItemPress = (item: UserProfileThumbItem) => {
    if (item.viewable && item.product != null) {
      setUnavailableHint("");
      onItemPress(item);
      return;
    }
    setUnavailableHint(unavailableText);
  };

  const handleBodyLayout = (event: LayoutChangeEvent) => {
    if (useScrollRow) {
      return;
    }
    const nextColumns = resolveUserProfileThumbColumns(event.nativeEvent.layout.width);
    setColumnsPerRow((prev) => (prev === nextColumns ? prev : nextColumns));
  };

  const cardContent = (
    <>
      <View style={[styles.header, isHorizontalChrome && styles.headerHorizontal]}>
        {showViewAll && onHeadingPress ? (
          <Pressable
            style={styles.headerTitlePressable}
            onPress={onHeadingPress}
            accessibilityRole="button"
          >
            <Text style={[styles.headerTitle, isHorizontalChrome && styles.headerTitleHorizontal]}>
              {heading}
            </Text>
          </Pressable>
        ) : (
          <Text style={[styles.headerTitle, isHorizontalChrome && styles.headerTitleHorizontal]}>
            {heading}
          </Text>
        )}
        {showViewAll && viewAllLabel && onViewAllPress ? (
          <Pressable onPress={onViewAllPress} accessibilityRole="button">
            <Text style={styles.headerAction}>{viewAllLabel}</Text>
          </Pressable>
        ) : null}
      </View>

      <View
        style={[
          styles.body,
          isHorizontalChrome && styles.bodyHorizontal,
          layout === "profile-scroll" && styles.bodyProfileScrollRow,
        ]}
        onLayout={handleBodyLayout}
      >
        {phase === "loading" ? <Text style={styles.state}>{loadingText}</Text> : null}
        {phase === "error" && items.length === 0 && errorText ? (
          <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
            {errorText}
          </Text>
        ) : null}
        {phase === "success" && items.length === 0 ? (
          <Text style={styles.state}>{emptyText}</Text>
        ) : null}

        {useScrollRow ? (
          <UserProfileThumbScrollRow
            items={items}
            currentProductId={currentProductId}
            unavailableHint={unavailableHint}
            onItemPress={handleItemPress}
          />
        ) : (
          <UserProfileThumbGrid
            items={items}
            columnsPerRow={columnsPerRow}
            unavailableHint={unavailableHint}
            onItemPress={handleItemPress}
          />
        )}

        {phase === "error" && items.length > 0 && errorText ? (
          <Text
            style={[
              styles.state,
              styles.stateError,
              isHorizontalChrome && styles.stateErrorHorizontal,
            ]}
            accessibilityRole="alert"
          >
            {errorText}
          </Text>
        ) : null}
      </View>
    </>
  );

  if (isHorizontalChrome) {
    return (
      <View style={[styles.root, styles.rootHorizontal, styles.rootHorizontalRadius]}>
        {cardContent}
      </View>
    );
  }

  return (
    <SquircleView radius={PROFILE_CARD_SQUIRCLE_RADIUS} style={styles.root}>
      {cardContent}
    </SquircleView>
  );
};
