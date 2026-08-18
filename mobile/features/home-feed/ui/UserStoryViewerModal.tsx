import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { markUserStoryViewed } from "@/entities/user-story/api/userStoryApi";
import { computeUserStoryFrameSize } from "@/entities/user-story/lib/computeUserStoryFrameSize";
import { resolveUserStoryMediaUrl } from "@/entities/user-story/lib/resolveUserStoryMediaUrl";
import {
  USER_STORY_IMAGE_VIEW_DURATION_MS,
  USER_STORY_MEDIA_TYPE_IMAGE,
  USER_STORY_MEDIA_TYPE_VIDEO,
} from "@/entities/user-story/model/constants";
import { useUserStoryMutations } from "@/entities/user-story/model/useUserStoryMutations";
import { useUserStoriesByAuthorQuery } from "@/entities/user-story/model/useUserStoriesByAuthorQuery";
import { ReportUserStoryModal } from "@/features/home-feed/ui/ReportUserStoryModal";
import { USER_STORY_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useStoryViewerModalStyles } from "@/shared/theme/modalChromeStyles";
import { useRegisterBlockingOverlay } from "@/shared/lib/useBlockingOverlayOccupancy";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";

type UserStoryViewerModalProps = {
  authorId: string | null;
  authorName: string;
  authorAvatarUrl?: string | null;
  visible: boolean;
  isAuthorized: boolean;
  currentUserId: string | null;
  onClose: () => void;
  onStoryDeleted?: () => void;
};

export const UserStoryViewerModal = ({
  authorId,
  authorName,
  authorAvatarUrl = null,
  visible,
  isAuthorized,
  currentUserId,
  onClose,
  onStoryDeleted,
}: UserStoryViewerModalProps) => {
  const router = useRouter();
  const styles = useStoryViewerModalStyles();
  useRegisterBlockingOverlay(visible);
  const theme = useAppTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const frameSize = computeUserStoryFrameSize(windowWidth, windowHeight);
  const { deleteMutation } = useUserStoryMutations();
  const storiesQuery = useUserStoriesByAuthorQuery(visible ? authorId : null, visible);
  const stories = storiesQuery.data ?? [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [hasMediaError, setHasMediaError] = useState(false);
  const [underlayImageUrl, setUnderlayImageUrl] = useState<string | null>(null);

  const authorKey = authorId ?? "";
  const isOwn =
    currentUserId != null && authorKey.length > 0 && authorKey === String(currentUserId);
  const activeStory = stories[activeIndex] ?? null;
  const canReport = isAuthorized && !isOwn && activeStory != null && !storiesQuery.isPending;
  const isDeleting = deleteMutation.isPending;
  const hasMultiple = stories.length > 1;
  const showFooter = isOwn || canReport;
  const avatarUrl = authorAvatarUrl ? resolveUploadedMediaUrl(authorAvatarUrl) : null;

  useEffect(() => {
    if (!visible) {
      setActiveIndex(0);
      setIsReportOpen(false);
      setActionError("");
      setUnderlayImageUrl(null);
    }
  }, [visible, authorId]);

  useEffect(() => {
    if (!visible || Platform.OS !== "web" || typeof document === "undefined") {
      return undefined;
    }

    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;
    const prevHtmlOverflow = html.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [visible]);

  useEffect(() => {
    setIsMediaLoading(true);
    setHasMediaError(false);
  }, [activeStory?._id]);

  useEffect(() => {
    if (isMediaLoading || hasMediaError || !activeStory) {
      return;
    }
    if (activeStory.mediaType !== USER_STORY_MEDIA_TYPE_IMAGE) {
      setUnderlayImageUrl(null);
      return;
    }
    const url = resolveUserStoryMediaUrl(activeStory.mediaUrl);
    const timerId = setTimeout(() => {
      setUnderlayImageUrl(url);
    }, 340);
    return () => clearTimeout(timerId);
  }, [activeStory, hasMediaError, isMediaLoading]);

  useEffect(() => {
    const story = stories[activeIndex];
    if (!story?._id || !isAuthorized) {
      return;
    }
    void markUserStoryViewed(story._id);
  }, [activeIndex, stories, isAuthorized]);

  const advanceStoryOrClose = useCallback(() => {
    if (activeIndex < stories.length - 1) {
      setActiveIndex((index) => index + 1);
      return;
    }
    onClose();
  }, [activeIndex, onClose, stories.length]);

  useEffect(() => {
    if (
      !visible ||
      !activeStory ||
      isReportOpen ||
      activeStory.mediaType === USER_STORY_MEDIA_TYPE_VIDEO ||
      isMediaLoading ||
      hasMediaError
    ) {
      return;
    }

    const timerId = setTimeout(advanceStoryOrClose, USER_STORY_IMAGE_VIEW_DURATION_MS);
    return () => clearTimeout(timerId);
  }, [
    activeStory,
    advanceStoryOrClose,
    hasMediaError,
    isMediaLoading,
    isReportOpen,
    visible,
  ]);

  const handlePrev = () => {
    setActiveIndex((index) => Math.max(0, index - 1));
  };

  const handleNext = () => {
    setActiveIndex((index) => Math.min(stories.length - 1, index + 1));
  };

  const handleOpenProfile = () => {
    if (!authorKey) {
      return;
    }
    onClose();
    router.push(`/seller/${authorKey}`);
  };

  const handleDelete = async () => {
    if (!activeStory) {
      return;
    }

    setActionError("");
    try {
      await deleteMutation.mutateAsync(activeStory._id);
      onStoryDeleted?.();
      onClose();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : USER_STORY_UI.ERROR_GENERIC);
    }
  };

  const captionText = String(activeStory?.captionText ?? "").trim();
  const resolvedMediaUrl = activeStory
    ? resolveUserStoryMediaUrl(activeStory.mediaUrl)
    : "";
  const displayError = storiesQuery.isError ? USER_STORY_UI.ERROR_GENERIC : "";
  const showUnderlay =
    Boolean(underlayImageUrl) &&
    underlayImageUrl !== resolvedMediaUrl &&
    activeStory?.mediaType === USER_STORY_MEDIA_TYPE_IMAGE;
  const keepPreviousFrame = showUnderlay && isMediaLoading;

  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <StatusBar style="light" />
        <View style={styles.viewer} accessibilityViewIsModal>
          {!(activeStory && !storiesQuery.isPending) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={USER_STORY_UI.CLOSE}
              onPress={onClose}
              style={[styles.closeButton, styles.closeButtonViewer]}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          ) : null}

          {storiesQuery.isPending ? (
            <View style={styles.state}>
              <ActivityIndicator color={theme.colors.onContrast} size="large" />
              <Text style={styles.stateText}>{USER_STORY_UI.LOADING}</Text>
            </View>
          ) : null}

          {displayError && !storiesQuery.isPending ? (
            <View style={styles.state}>
              <Text style={[styles.stateText, styles.stateError]}>{displayError}</Text>
            </View>
          ) : null}

          {!storiesQuery.isPending && stories.length === 0 && !displayError ? (
            <View style={styles.state}>
              <Text style={styles.stateText}>{USER_STORY_UI.ERROR_GENERIC}</Text>
            </View>
          ) : null}

          {activeStory && !storiesQuery.isPending ? (
            <View style={styles.stage}>
              <View style={[styles.frame, frameSize]}>
                {hasMultiple ? (
                  <>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={USER_STORY_UI.PREV_STORY}
                      disabled={isReportOpen || activeIndex <= 0}
                      onPress={handlePrev}
                      style={[
                        styles.edgePrev,
                        (isReportOpen || activeIndex <= 0) && styles.edgeDisabled,
                      ]}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={USER_STORY_UI.NEXT_STORY}
                      disabled={isReportOpen || activeIndex >= stories.length - 1}
                      onPress={handleNext}
                      style={[
                        styles.edgeNext,
                        (isReportOpen || activeIndex >= stories.length - 1) && styles.edgeDisabled,
                      ]}
                    />
                  </>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={USER_STORY_UI.CLOSE}
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>×</Text>
                </Pressable>

                <View style={styles.header}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleOpenProfile}
                    style={styles.authorButton}
                  >
                    {avatarUrl ? (
                      <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarFallbackText}>
                          {authorName.slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.authorName} numberOfLines={1}>
                      {authorName}
                    </Text>
                  </Pressable>
                </View>

                {isMediaLoading && !keepPreviousFrame ? (
                  <View style={styles.mediaState}>
                    <ActivityIndicator color={theme.colors.onContrast} size="small" />
                    <Text style={styles.mediaStateText}>{USER_STORY_UI.MEDIA_LOADING}</Text>
                  </View>
                ) : null}

                {hasMediaError ? (
                  <View style={styles.mediaState}>
                    <Text style={styles.mediaStateText}>{USER_STORY_UI.MEDIA_LOAD_ERROR}</Text>
                  </View>
                ) : null}

                <View style={styles.mediaLayer} pointerEvents="none">
                  {showUnderlay && underlayImageUrl ? (
                    <Image
                      source={{ uri: underlayImageUrl }}
                      style={[styles.media, styles.mediaUnderlay]}
                      contentFit="contain"
                    />
                  ) : null}
                  {activeStory.mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
                    <ProductPreviewVideo
                      uri={resolvedMediaUrl}
                      loop={false}
                      onPlaybackFailed={() => {
                        setHasMediaError(true);
                        setIsMediaLoading(false);
                      }}
                      onReady={() => setIsMediaLoading(false)}
                      onEnded={advanceStoryOrClose}
                    />
                  ) : (
                    <Image
                      source={{ uri: resolvedMediaUrl }}
                      style={[
                        styles.media,
                        styles.mediaActive,
                        isMediaLoading && styles.mediaHidden,
                      ]}
                      contentFit="contain"
                      transition={340}
                      onLoad={() => setIsMediaLoading(false)}
                      onError={() => {
                        setHasMediaError(true);
                        setIsMediaLoading(false);
                      }}
                    />
                  )}
                </View>

                {actionError ? (
                  <Text style={[styles.caption, styles.stateError]}>{actionError}</Text>
                ) : null}

                {captionText ? (
                  <Text
                    style={[styles.caption, !showFooter && styles.captionNoFooter]}
                    numberOfLines={6}
                  >
                    {captionText}
                  </Text>
                ) : null}

                {showFooter ? (
                  <View style={styles.footer} pointerEvents="box-none">
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
              </View>
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
