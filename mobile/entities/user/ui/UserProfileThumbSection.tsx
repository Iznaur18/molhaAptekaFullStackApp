import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";

import { getUserProfileThumbSrc } from "@/entities/user/lib/getUserProfileThumbSrc";
import type { UserProfileThumbItem } from "@/entities/user/model/userProfileThumbTypes";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import {
  PROFILE_CARD_SQUIRCLE_RADIUS,
  resolveUserProfileThumbColumns,
  USER_PROFILE_THUMB_ROW_SIZE,
  USER_PROFILE_THUMB_SQUIRCLE_RADIUS,
  useUserProfileThumbListStyles,
} from "@/shared/theme/profileChromeStyles";
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
  onPress: () => void;
  onImageError: () => void;
};

const UserProfileThumbPressable = ({
  item,
  thumbSrc,
  isUnavailable,
  onPress,
  onImageError,
}: ThumbPressableProps) => {
  const styles = useUserProfileThumbListStyles();

  return (
    <Pressable
      style={[styles.thumbButton, isUnavailable && styles.thumbButtonUnavailable]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.productName}
    >
      <SquircleView radius={USER_PROFILE_THUMB_SQUIRCLE_RADIUS} style={styles.thumbClip}>
        {thumbSrc ? (
          <Image source={{ uri: thumbSrc }} style={styles.thumbImage} onError={onImageError} />
        ) : (
          <View style={styles.thumbPlaceholder} />
        )}
      </SquircleView>
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
  unavailableHint?: string;
  onItemPress: (item: UserProfileThumbItem) => void;
};

export const UserProfileThumbScrollRow = ({
  items,
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

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollRow}
        contentContainerStyle={styles.scrollRowContent}
        {...nestedHorizontalScrollProps}
        keyboardShouldPersistTaps="handled"
      >
        {items.map((item) => {
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
      </ScrollView>
      {unavailableHint ? (
        <Text style={styles.hint} accessibilityRole="alert">
          {unavailableHint}
        </Text>
      ) : null}
    </>
  );
};

export type UserProfileThumbSectionLayout = "grid" | "horizontal";

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
  showMoreLabel?: string;
  showLessLabel?: string;
  loadingMoreLabel?: string;
  totalCount?: number;
  isExpanded?: boolean;
  isLoadingMore?: boolean;
  onShowMore?: () => void;
  onShowLess?: () => void;
  layout?: UserProfileThumbSectionLayout;
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
  showMoreLabel,
  showLessLabel,
  loadingMoreLabel,
  totalCount,
  isExpanded = false,
  isLoadingMore = false,
  onShowMore,
  onShowLess,
  layout = "grid",
}: UserProfileThumbSectionProps) => {
  const styles = useUserProfileThumbListStyles();
  const [unavailableHint, setUnavailableHint] = useState("");
  const [columnsPerRow, setColumnsPerRow] = useState(USER_PROFILE_THUMB_ROW_SIZE);
  const isHorizontal = layout === "horizontal";

  const showViewAll = typeof onViewAllPress === "function" && phase === "success" && items.length > 0;
  const shouldCollapse = !isHorizontal && typeof onShowMore === "function";
  const effectiveTotal = totalCount ?? items.length;
  const canToggleExpand = shouldCollapse && effectiveTotal > columnsPerRow;

  const handleItemPress = (item: UserProfileThumbItem) => {
    if (item.viewable && item.product != null) {
      setUnavailableHint("");
      onItemPress(item);
      return;
    }
    setUnavailableHint(unavailableText);
  };

  const handleBodyLayout = (event: LayoutChangeEvent) => {
    if (isHorizontal) {
      return;
    }
    const nextColumns = resolveUserProfileThumbColumns(event.nativeEvent.layout.width);
    setColumnsPerRow((prev) => (prev === nextColumns ? prev : nextColumns));
  };

  const visibleItems = useMemo(
    () => (!shouldCollapse || isExpanded ? items : items.slice(0, columnsPerRow)),
    [columnsPerRow, isExpanded, items, shouldCollapse],
  );

  const showMoreFooter =
    canToggleExpand && !isExpanded && Boolean(showMoreLabel) && typeof onShowMore === "function";
  const showLessFooter =
    canToggleExpand && isExpanded && Boolean(showLessLabel) && typeof onShowLess === "function";
  const cardContent = (
    <>
      <View style={[styles.header, isHorizontal && styles.headerHorizontal]}>
        {showViewAll && onHeadingPress ? (
          <Pressable
            style={styles.headerTitlePressable}
            onPress={onHeadingPress}
            accessibilityRole="button"
          >
            <Text style={[styles.headerTitle, isHorizontal && styles.headerTitleHorizontal]}>
              {heading}
            </Text>
          </Pressable>
        ) : (
          <Text style={[styles.headerTitle, isHorizontal && styles.headerTitleHorizontal]}>
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
        style={[styles.body, isHorizontal && styles.bodyHorizontal]}
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

        {isHorizontal ? (
          <UserProfileThumbScrollRow
            items={items}
            unavailableHint={unavailableHint}
            onItemPress={handleItemPress}
          />
        ) : (
          <UserProfileThumbGrid
            items={visibleItems}
            columnsPerRow={columnsPerRow}
            unavailableHint={unavailableHint}
            onItemPress={handleItemPress}
          />
        )}

        {phase === "error" && items.length > 0 && errorText ? (
          <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
            {errorText}
          </Text>
        ) : null}
      </View>

      {showMoreFooter ? (
        <Pressable
          style={[styles.footerAction, isLoadingMore && styles.footerActionDisabled]}
          onPress={onShowMore}
          disabled={isLoadingMore}
          accessibilityRole="button"
        >
          <Text style={styles.footerActionText}>
            {isLoadingMore && loadingMoreLabel ? loadingMoreLabel : showMoreLabel}
          </Text>
        </Pressable>
      ) : null}

      {showLessFooter ? (
        <Pressable style={styles.footerAction} onPress={onShowLess} accessibilityRole="button">
          <Text style={styles.footerActionText}>{showLessLabel}</Text>
        </Pressable>
      ) : null}
    </>
  );

  if (isHorizontal) {
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
