import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { UserStoryRing } from "@/entities/user-story/api/userStoryApi";
import { CreateUserStoryModal } from "@/features/home-feed/ui/CreateUserStoryModal";
import { UserStoryViewerModal } from "@/features/home-feed/ui/UserStoryViewerModal";
import { HOME_FEED_UI, USER_STORY_UI } from "@/shared/config";
import { useUserStoriesStripStyles } from "@/shared/theme/catalogProductStyles";

type UserStoriesStripProps = {
  rings: UserStoryRing[];
  showStrip: boolean;
  canPublish: boolean;
  isAuthorized: boolean;
  currentUserId: string | null;
  onPublished?: () => void;
};

export const UserStoriesStrip = ({
  rings,
  showStrip,
  canPublish,
  isAuthorized,
  currentUserId,
  onPublished,
}: UserStoriesStripProps) => {
  const styles = useUserStoriesStripStyles();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewerAuthor, setViewerAuthor] = useState<UserStoryRing["author"] | null>(null);

  const sortedRings = useMemo(
    () =>
      [...rings].sort((left, right) => {
        if (left.isViewed !== right.isViewed) {
          return left.isViewed ? 1 : -1;
        }
        const leftTime = new Date(left.latestPublishedAt ?? 0).getTime();
        const rightTime = new Date(right.latestPublishedAt ?? 0).getTime();
        return rightTime - leftTime;
      }),
    [rings],
  );

  if (!showStrip && !canPublish) {
    return null;
  }

  return (
    <>
      <View accessibilityLabel={HOME_FEED_UI.STORIES_SECTION_ARIA}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {canPublish ? (
            <Pressable style={styles.item} onPress={() => setIsCreateOpen(true)}>
              <View style={styles.ringAdd}>
                <Text style={styles.plus}>+</Text>
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {USER_STORY_UI.ADD_LABEL}
              </Text>
            </Pressable>
          ) : null}

          {sortedRings.map((ring) => {
            const authorId = String(ring.author._id);
            const authorName = ring.author.userName?.trim() || authorId;
            const avatarUrl = ring.author.userAvatarUrl ?? null;
            const ringStyle = ring.isOwn || ring.isViewed ? styles.ringViewed : styles.ring;

            return (
              <Pressable
                key={authorId}
                style={styles.item}
                onPress={() => setViewerAuthor(ring.author)}
              >
                <View style={ringStyle}>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
                  ) : (
                    <Text style={styles.avatarFallback}>{authorName.slice(0, 1).toUpperCase()}</Text>
                  )}
                </View>
                <Text style={styles.label} numberOfLines={1}>
                  {authorName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <UserStoryViewerModal
        authorId={viewerAuthor?._id ?? null}
        authorName={viewerAuthor?.userName?.trim() || viewerAuthor?._id || ""}
        visible={viewerAuthor != null}
        isAuthorized={isAuthorized}
        currentUserId={currentUserId}
        onClose={() => setViewerAuthor(null)}
        onStoryDeleted={onPublished}
      />

      <CreateUserStoryModal
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPublished={onPublished}
      />
    </>
  );
};
