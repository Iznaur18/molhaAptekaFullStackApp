import { useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { getUserProfileThumbSrc } from "@/entities/user/lib/getUserProfileThumbSrc";
import type { UserProfileThumbItem } from "@/entities/user/model/userProfileThumbTypes";
import { useUserProfileThumbListStyles } from "@/shared/theme/profileChromeStyles";

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

  return (
    <>
      <View style={styles.grid}>
        {items.map((item) => {
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
              {thumbSrc ? (
                <Image
                  source={{ uri: thumbSrc }}
                  style={styles.thumb}
                  onError={() => markThumbFailed(item.productId)}
                />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]} />
              )}
            </Pressable>
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

  return (
    <View style={styles.root}>
      <View style={styles.headingRow}>
        {showViewAll && onHeadingPress ? (
          <Pressable onPress={onHeadingPress} accessibilityRole="button">
            <Text style={[styles.heading, styles.headingAction]}>{heading}</Text>
          </Pressable>
        ) : (
          <Text style={styles.heading}>{heading}</Text>
        )}
        {showViewAll && viewAllLabel && onViewAllPress ? (
          <Pressable onPress={onViewAllPress} accessibilityRole="button">
            <Text style={styles.viewAll}>{viewAllLabel}</Text>
          </Pressable>
        ) : null}
      </View>

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

      {!isExpanded && canExpand && showMoreLabel && onShowMore ? (
        <Pressable
          style={[styles.moreButton, isLoadingMore && styles.moreButtonDisabled]}
          onPress={onShowMore}
          disabled={isLoadingMore}
        >
          <Text style={styles.moreButtonText}>
            {isLoadingMore && loadingMoreLabel ? loadingMoreLabel : showMoreLabel}
          </Text>
        </Pressable>
      ) : null}

      {isExpanded && canExpand && showLessLabel && onShowLess ? (
        <Pressable style={styles.moreButton} onPress={onShowLess}>
          <Text style={styles.moreButtonText}>{showLessLabel}</Text>
        </Pressable>
      ) : null}

      {phase === "error" && items.length > 0 && errorText ? (
        <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
          {errorText}
        </Text>
      ) : null}
    </View>
  );
};
