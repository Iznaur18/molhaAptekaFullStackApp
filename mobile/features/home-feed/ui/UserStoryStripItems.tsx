import { Image } from "expo-image";
import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import type { UserStoryRing } from "@/entities/user-story/api/userStoryApi";
import { resolveUserStoryAvatarUrl } from "@/entities/user-story/lib/resolveUserStoryAvatarUrl";
import { USER_STORY_UI } from "@/shared/config";
import { useUserStoriesStripStyles } from "@/shared/theme/catalogProductStyles";

type StoryRingItemProps = {
  ring: UserStoryRing;
  onOpen: (author: UserStoryRing["author"]) => void;
};

const StoryRingItem = memo(({ ring, onOpen }: StoryRingItemProps) => {
  const styles = useUserStoriesStripStyles();
  const authorId = String(ring.author._id);
  const authorName = ring.author.userName?.trim() || authorId;
  const avatarUrl = resolveUserStoryAvatarUrl(ring.author);
  const ringStyle =
    ring.isOwn || ring.isViewed ? [styles.ring, styles.ringViewed] : styles.ring;

  const handlePress = useCallback(() => {
    onOpen(ring.author);
  }, [onOpen, ring.author]);

  return (
    <Pressable style={styles.item} onPress={handlePress}>
      <View style={ringStyle}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>{authorName.slice(0, 1).toUpperCase()}</Text>
          </View>
        )}
        {ring.activeCount != null && ring.activeCount > 1 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{ring.activeCount}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {authorName}
      </Text>
    </Pressable>
  );
});

StoryRingItem.displayName = "StoryRingItem";

type StoryAddButtonProps = {
  onPress: () => void;
};

const StoryAddButton = memo(({ onPress }: StoryAddButtonProps) => {
  const styles = useUserStoriesStripStyles();

  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.ringAdd}>
        <Text style={styles.plus}>+</Text>
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {USER_STORY_UI.ADD_LABEL}
      </Text>
    </Pressable>
  );
});

StoryAddButton.displayName = "StoryAddButton";

export { StoryAddButton, StoryRingItem };
