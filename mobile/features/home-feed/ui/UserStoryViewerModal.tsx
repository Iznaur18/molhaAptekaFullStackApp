import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
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
            <ActivityIndicator color="#fff" size="large" />
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    padding: 16,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  author: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  mediaWrap: {
    width: "100%",
    height: "62%",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  caption: {
    color: "#fff",
    fontSize: 15,
    marginTop: 12,
    lineHeight: 22,
  },
  error: {
    color: "#ff8a80",
    fontSize: 13,
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  deleteButton: {
    backgroundColor: "rgba(198,40,40,0.35)",
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  navButton: {
    padding: 10,
  },
  navDisabled: {
    opacity: 0.4,
  },
  navText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  counter: {
    color: "#ccc",
    fontSize: 14,
  },
});
