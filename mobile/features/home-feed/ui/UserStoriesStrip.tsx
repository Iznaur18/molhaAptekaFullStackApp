import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";

import type { UserStoryRing } from "@/entities/user-story/api/userStoryApi";
import {
  USER_STORY_STRIP_LAYOUT,
  USER_STORY_STRIP_TRACK_HEIGHT,
} from "@/entities/user-story/lib/userStoryStripLayout";
import { CreateUserStoryModal } from "@/features/home-feed/ui/CreateUserStoryModal";
import {
  StoryAddButton,
  StoryRingItem,
} from "@/features/home-feed/ui/UserStoryStripItems";
import { UserStoryViewerModal } from "@/features/home-feed/ui/UserStoryViewerModal";
import { HOME_FEED_UI } from "@/shared/config";
import { useUserStoriesStripStyles } from "@/shared/theme/catalogProductStyles";
import {
  AccountRequirementModal,
  useAccountRequirementModal,
} from "@/shared/ui/AccountRequirementModal";
import { HorizontalOverflowRow } from "@/shared/ui/HorizontalOverflowRow";
import { SquircleView } from "@/shared/ui/SquircleView";

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
  const [viewerAuthor, setViewerAuthor] = useState<UserStoryRing["author"] | null>(
    null,
  );

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

  if (!showStrip && sortedRings.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.root} accessibilityLabel={HOME_FEED_UI.STORIES_SECTION_ARIA}>
        <Text style={styles.title}>{HOME_FEED_UI.STORIES_SECTION_TITLE}</Text>
        <SquircleView
          radius={USER_STORY_STRIP_LAYOUT.scrollBorderRadius}
          style={styles.scrollWrapper}
        >
          <HorizontalOverflowRow
            height={USER_STORY_STRIP_TRACK_HEIGHT}
            trackStyle={styles.scroll}
          >
            <StoryAddButton onPress={handleAddPress} />
            {sortedRings.map((ring) => (
              <StoryRingItem
                key={String(ring.author._id)}
                ring={ring}
                onOpen={handleOpenRing}
              />
            ))}
          </HorizontalOverflowRow>
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

      <CreateUserStoryModal
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPublished={onPublished}
      />

      <AccountRequirementModal {...storyGate.modalProps} />
    </>
  );
};
