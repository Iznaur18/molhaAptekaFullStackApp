import { useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { getUserProfileThumbSrc } from "@/entities/user/lib/getUserProfileThumbSrc";
import type { UserProfileThumbItem } from "@/entities/user/model/userProfileThumbTypes";
import {
  PROFILE_CARD_SQUIRCLE_RADIUS,
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

type UserProfileThumbGridProps = {
  items: UserProfileThumbItem[];
  unavailableHint?: string;
  onItemPress: (item: UserProfileThumbItem) => void;
};

export const UserProfileThumbGrid = ({
  items,
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

  const rows = chunkProfileThumbItems(items, USER_PROFILE_THUMB_ROW_SIZE);

  return (
    <>
      <View style={styles.grid}>
        {rows.map((rowItems, rowIndex) => {
          const isPartialRow = rowItems.length < USER_PROFILE_THUMB_ROW_SIZE;

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
                  <Pressable
                    key={item.productId}
                    style={[styles.thumbButton, isUnavailable && styles.thumbButtonUnavailable]}
                    onPress={() => onItemPress(item)}
                    accessibilityRole="button"
                    accessibilityLabel={item.productName}
                  >
                    <SquircleView radius={USER_PROFILE_THUMB_SQUIRCLE_RADIUS} style={styles.thumbClip}>
                      {thumbSrc ? (
                        <Image
                          source={{ uri: thumbSrc }}
                          style={styles.thumbImage}
                          onError={() => markThumbFailed(item.productId)}
                        />
                      ) : (
                        <View style={styles.thumbPlaceholder} />
                      )}
                    </SquircleView>
                  </Pressable>
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
  canExpand?: boolean;
  isExpanded?: boolean;
  isLoadingMore?: boolean;
  onShowMore?: () => void;
  onShowLess?: () => void;
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
  canExpand = false,
  isExpanded = false,
  isLoadingMore = false,
  onShowMore,
  onShowLess,
}: UserProfileThumbSectionProps) => {
  const styles = useUserProfileThumbListStyles();
  const [unavailableHint, setUnavailableHint] = useState("");

  const showViewAll = typeof onViewAllPress === "function" && phase === "success" && items.length > 0;

  const handleItemPress = (item: UserProfileThumbItem) => {
    if (item.viewable && item.product != null) {
      setUnavailableHint("");
      onItemPress(item);
      return;
    }
    setUnavailableHint(unavailableText);
  };

  const visibleItems = useMemo(
    () => (isExpanded ? items : items.slice(0, 5)),
    [isExpanded, items],
  );

  const showMoreFooter =
    !isExpanded && canExpand && Boolean(showMoreLabel) && typeof onShowMore === "function";
  const showLessFooter =
    isExpanded && canExpand && Boolean(showLessLabel) && typeof onShowLess === "function";

  return (
    <SquircleView radius={PROFILE_CARD_SQUIRCLE_RADIUS} style={styles.root}>
      <View style={styles.header}>
        {showViewAll && onHeadingPress ? (
          <Pressable
            style={styles.headerTitlePressable}
            onPress={onHeadingPress}
            accessibilityRole="button"
          >
            <Text style={styles.headerTitle}>{heading}</Text>
          </Pressable>
        ) : (
          <Text style={styles.headerTitle}>{heading}</Text>
        )}
        {showViewAll && viewAllLabel && onViewAllPress ? (
          <Pressable onPress={onViewAllPress} accessibilityRole="button">
            <Text style={styles.headerAction}>{viewAllLabel}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        {phase === "loading" ? <Text style={styles.state}>{loadingText}</Text> : null}
        {phase === "error" && items.length === 0 && errorText ? (
          <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
            {errorText}
          </Text>
        ) : null}
        {phase === "success" && items.length === 0 ? (
          <Text style={styles.state}>{emptyText}</Text>
        ) : null}

        <UserProfileThumbGrid
          items={visibleItems}
          unavailableHint={unavailableHint}
          onItemPress={handleItemPress}
        />

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
    </SquircleView>
  );
};
