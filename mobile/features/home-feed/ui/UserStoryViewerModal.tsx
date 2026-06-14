import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

import { markUserStoryViewed } from "@/entities/user-story/api/userStoryApi";
import {
  USER_STORY_MEDIA_TYPE_VIDEO,
} from "@/entities/user-story/model/constants";
import { useUserStoryMutations } from "@/entities/user-story/model/useUserStoryMutations";
import { useUserStoriesByAuthorQuery } from "@/entities/user-story/model/useUserStoriesByAuthorQuery";
import { ReportUserStoryModal } from "@/features/home-feed/ui/ReportUserStoryModal";
import { USER_STORY_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useStoryViewerModalStyles } from "@/shared/theme/modalChromeStyles";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";

type UserStoryViewerModalProps = {
  authorId: string | null;
  authorName: string;
  visible: boolean;
  isAuthorized: boolean;
  currentUserId: string | null;
  onClose: () => void;
  onStoryDeleted?: () => void;
};

export const UserStoryViewerModal = ({
  authorId,
  authorName,
  visible,
  isAuthorized,
  currentUserId,
  onClose,
  onStoryDeleted,
}: UserStoryViewerModalProps) => {
  const styles = useStoryViewerModalStyles();
  const theme = useAppTheme();
  const { deleteMutation } = useUserStoryMutations();
  const storiesQuery = useUserStoriesByAuthorQuery(visible ? authorId : null, visible);
  const stories = storiesQuery.data ?? [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const authorKey = authorId ?? "";
  const isOwn =
    currentUserId != null && authorKey.length > 0 && authorKey === String(currentUserId);
  const activeStory = stories[activeIndex] ?? null;
  const canReport = isAuthorized && !isOwn && activeStory != null && !storiesQuery.isPending;
  const isDeleting = deleteMutation.isPending;

  useEffect(() => {
    if (!visible) {
      setActiveIndex(0);
      setIsReportOpen(false);
      setActionError("");
    }
  }, [visible, authorId]);

  useEffect(() => {
    const story = stories[activeIndex];
    if (!story?._id || !isAuthorized) {
      return;
    }
    void markUserStoryViewed(story._id);
  }, [activeIndex, stories, isAuthorized]);

  const handlePrev = () => {
    setActiveIndex((index) => Math.max(0, index - 1));
  };

  const handleNext = () => {
    setActiveIndex((index) => Math.min(stories.length - 1, index + 1));
  };

  const handleDelete = async () => {
    if (!activeStory) {
      return;
    }

    setActionError("");
    try {
      await deleteMutation.mutateAsync(activeStory._id);
      if (stories.length <= 1) {
        onStoryDeleted?.();
        onClose();
        return;
      }
      setActiveIndex((index) => Math.min(index, stories.length - 2));
      onStoryDeleted?.();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : USER_STORY_UI.ERROR_GENERIC);
    }
  };

  const captionText = String(activeStory?.captionText ?? "").trim();

  return (
    <>
      <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>{USER_STORY_UI.CLOSE}</Text>
          </Pressable>

          <Text style={styles.author}>{authorName}</Text>

          {storiesQuery.isPending ? (
            <ActivityIndicator color={theme.colors.onContrast} size="large" />
          ) : null}

          {activeStory ? (
            <View style={styles.mediaWrap}>
              {activeStory.mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
                <ProductPreviewVideo uri={activeStory.mediaUrl} />
              ) : (
                <Image
                  source={{ uri: activeStory.mediaUrl }}
                  style={styles.media}
                  contentFit="contain"
                />
              )}
            </View>
          ) : null}

          {captionText ? <Text style={styles.caption}>{captionText}</Text> : null}

          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

          {isOwn || canReport ? (
            <View style={styles.footer}>
              {isOwn ? (
                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDelete}
                  disabled={isDeleting}
                >
                  <Text style={styles.actionText}>
                    {isDeleting ? USER_STORY_UI.DELETING : USER_STORY_UI.DELETE}
                  </Text>
                </Pressable>
              ) : null}
              {canReport ? (
                <Pressable
                  style={styles.actionButton}
                  onPress={() => setIsReportOpen(true)}
                  disabled={isReportOpen}
                >
                  <Text style={styles.actionText}>{USER_STORY_UI.REPORT}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {stories.length > 1 ? (
            <View style={styles.navRow}>
              <Pressable
                style={[styles.navButton, activeIndex === 0 && styles.navDisabled]}
                onPress={handlePrev}
                disabled={activeIndex === 0 || isReportOpen}
              >
                <Text style={styles.navText}>{USER_STORY_UI.PREV_STORY}</Text>
              </Pressable>
              <Text style={styles.counter}>
                {activeIndex + 1} / {stories.length}
              </Text>
              <Pressable
                style={[
                  styles.navButton,
                  activeIndex >= stories.length - 1 && styles.navDisabled,
                ]}
                onPress={handleNext}
                disabled={activeIndex >= stories.length - 1 || isReportOpen}
              >
                <Text style={styles.navText}>{USER_STORY_UI.NEXT_STORY}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>

      {activeStory ? (
        <ReportUserStoryModal
          visible={isReportOpen}
          storyId={activeStory._id}
          onClose={() => setIsReportOpen(false)}
        />
      ) : null}
    </>
  );
};
