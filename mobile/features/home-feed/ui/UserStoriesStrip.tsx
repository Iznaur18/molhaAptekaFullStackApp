import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";

import type { UserStoryRing } from "@/entities/user-story/api/userStoryApi";
import { CreateUserStoryModal } from "@/features/home-feed/ui/CreateUserStoryModal";
import { StoryAddButton, StoryRingItem } from "@/features/home-feed/ui/UserStoryStripItems";
import { UserStoryViewerModal } from "@/features/home-feed/ui/UserStoryViewerModal";
import { USER_STORY_STRIP_LAYOUT } from "@/entities/user-story/lib/userStoryStripLayout";
import { HOME_FEED_UI } from "@/shared/config";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import { useUserStoriesStripStyles } from "@/shared/theme/catalogProductStyles";
import {
  AccountRequirementModal,
  useAccountRequirementModal,
} from "@/shared/ui/AccountRequirementModal";
import { SquircleView } from "@/shared/ui/SquircleView";

const STORIES_WINDOW_SIZE = 5;

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
  const router = useRouter();
  const styles = useUserStoriesStripStyles();
  const storyGate = useAccountRequirementModal();
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

  const handleAddPress = useCallback(() => {
    if (!isAuthorized) {
      router.push("/(auth)/login");
      return;
    }
    if (!canPublish) {
      storyGate.require("premium", "опубликовать сторис");
      return;
    }
    setIsCreateOpen(true);
  }, [canPublish, isAuthorized, router, storyGate]);

  const handleOpenRing = useCallback((author: UserStoryRing["author"]) => {
    setViewerAuthor(author);
  }, []);

  const renderStoryRing = useCallback(
    ({ item }: { item: UserStoryRing }) => (
      <StoryRingItem ring={item} onOpen={handleOpenRing} />
    ),
    [handleOpenRing],
  );

  const listHeader = useMemo(
    () => <StoryAddButton onPress={handleAddPress} />,
    [handleAddPress],
  );

  if (!showStrip && sortedRings.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.root} accessibilityLabel={HOME_FEED_UI.STORIES_SECTION_ARIA}>
        <SquircleView
          radius={USER_STORY_STRIP_LAYOUT.scrollBorderRadius}
          style={styles.scrollWrapper}
        >
          <Text style={styles.title}>{HOME_FEED_UI.STORIES_SECTION_TITLE}</Text>
          <FlatList
            horizontal
            {...nestedHorizontalScrollProps}
            data={sortedRings}
            keyExtractor={(item) => String(item.author._id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            ListHeaderComponent={listHeader}
            windowSize={STORIES_WINDOW_SIZE}
            maxToRenderPerBatch={6}
            initialNumToRender={8}
            removeClippedSubviews
            renderItem={renderStoryRing}
          />
        </SquircleView>
      </View>

      {viewerAuthor != null ? (
        <UserStoryViewerModal
          authorId={viewerAuthor._id ?? null}
          authorName={viewerAuthor.userName?.trim() || viewerAuthor._id || ""}
          authorAvatarUrl={viewerAuthor.userAvatarUrl ?? null}
          visible
          isAuthorized={isAuthorized}
          currentUserId={currentUserId}
          onClose={() => setViewerAuthor(null)}
          onStoryDeleted={onPublished}
        />
      ) : null}

      {isCreateOpen ? (
        <CreateUserStoryModal
          visible
          onClose={() => setIsCreateOpen(false)}
          onPublished={onPublished}
        />
      ) : null}

      <AccountRequirementModal {...storyGate.modalProps} />
    </>
  );
};
