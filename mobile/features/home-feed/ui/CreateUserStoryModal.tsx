import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { computeCreateStoryPreviewSize } from "@/entities/user-story/lib/computeUserStoryFrameSize";
import { useUserStoryMutations } from "@/entities/user-story/model/useUserStoryMutations";
import {
  USER_STORY_CAPTION_MAX_CHARS,
  USER_STORY_MEDIA_TYPE_IMAGE,
  USER_STORY_MEDIA_TYPE_VIDEO,
  type UserStoryMediaType,
} from "@/entities/user-story/model/constants";
import type { UploadImageFilePayload } from "@/entities/upload/api/uploadImage";
import type { UploadVideoFilePayload } from "@/entities/upload/api/uploadVideo";
import { STORY_UPLOAD_VIDEO_MAX_BYTES } from "@/entities/upload/model/videoConstants";
import { useUploadImageMutation } from "@/entities/upload/model/useUploadImageMutation";
import { useUploadVideoMutation } from "@/entities/upload/model/useUploadVideoMutation";
import { pickGalleryImageAsset } from "@/features/image-upload/lib/pickGalleryImageAsset";
import { pickVideoAsset } from "@/features/image-upload/lib/pickVideoAsset";
import { USER_STORY_UI } from "@/shared/config";
import { useRegisterBlockingOverlay } from "@/shared/lib/useBlockingOverlayOccupancy";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import {
  CREATE_STORY_MODAL_ANIMATION,
  CREATE_STORY_SUBMIT_FOOTER_HEIGHT_PX,
  useCreateStoryModalStyles,
} from "@/shared/theme/modalChromeStyles";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";

type CreateUserStoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onPublished?: () => void;
};

const { enterMs, exitMs, sheetSlideDistance, maxHeightRatio } = CREATE_STORY_MODAL_ANIMATION;
const DISMISS_GUARD_MS = 600;

export const CreateUserStoryModal = ({
  visible,
  onClose,
  onPublished,
}: CreateUserStoryModalProps) => {
  const styles = useCreateStoryModalStyles();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const previewSize = useMemo(
    () => computeCreateStoryPreviewSize(windowWidth, windowHeight),
    [windowWidth, windowHeight],
  );
  const cardMaxHeight = useMemo(
    () => windowHeight * maxHeightRatio,
    [windowHeight],
  );
  const bodyScrollMaxHeight = useMemo(
    () => cardMaxHeight - CREATE_STORY_SUBMIT_FOOTER_HEIGHT_PX,
    [cardMaxHeight],
  );
  const theme = useAppTheme();
  const { createMutation } = useUserStoryMutations();
  const uploadImageMutation = useUploadImageMutation();
  const uploadVideoMutation = useUploadVideoMutation();
  const dismissGuardUntilRef = useRef(0);

  const [modalVisible, setModalVisible] = useState(visible);
  useRegisterBlockingOverlay(modalVisible);
  const [captionText, setCaptionText] = useState("");
  const [mediaType, setMediaType] = useState<UserStoryMediaType | null>(null);
  const [imageFile, setImageFile] = useState<UploadImageFilePayload | null>(null);
  const [videoFile, setVideoFile] = useState<UploadVideoFilePayload | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue<number>(sheetSlideDistance);

  const isBusy =
    createMutation.isPending || uploadImageMutation.isPending || uploadVideoMutation.isPending;

  const previewUri = imageFile?.uri ?? videoFile?.uri ?? null;

  const resetForm = useCallback(() => {
    setCaptionText("");
    setMediaType(null);
    setImageFile(null);
    setVideoFile(null);
    setErrorMessage("");
  }, []);

  const finishClose = useCallback(() => {
    setModalVisible(false);
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      backdropOpacity.value = 0;
      sheetTranslateY.value = sheetSlideDistance;
      backdropOpacity.value = withTiming(1, {
        duration: enterMs,
        easing: Easing.out(Easing.cubic),
      });
      sheetTranslateY.value = withTiming(0, {
        duration: enterMs,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (!modalVisible) {
      return;
    }

    backdropOpacity.value = withTiming(0, {
      duration: exitMs,
      easing: Easing.in(Easing.cubic),
    });
    sheetTranslateY.value = withTiming(
      sheetSlideDistance,
      {
        duration: exitMs,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(finishClose)();
        }
      },
    );
  }, [backdropOpacity, finishClose, modalVisible, sheetTranslateY, visible]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const armDismissGuard = useCallback(() => {
    dismissGuardUntilRef.current = Date.now() + DISMISS_GUARD_MS;
  }, []);

  const handleClose = () => {
    if (isBusy) {
      return;
    }
    onClose();
  };

  const handleDismiss = () => {
    if (Date.now() < dismissGuardUntilRef.current) {
      return;
    }
    handleClose();
  };

  const handlePickPhoto = async () => {
    setErrorMessage("");
    armDismissGuard();
    try {
      const asset = await pickGalleryImageAsset();
      armDismissGuard();
      if (!asset) {
        return;
      }
      setImageFile(asset);
      setVideoFile(null);
      setMediaType(USER_STORY_MEDIA_TYPE_IMAGE);
    } catch (error) {
      armDismissGuard();
      setErrorMessage(error instanceof Error ? error.message : USER_STORY_UI.ERROR_IMAGE);
    }
  };

  const handlePickVideo = async () => {
    setErrorMessage("");
    armDismissGuard();
    try {
      const asset = await pickVideoAsset({ maxBytes: STORY_UPLOAD_VIDEO_MAX_BYTES });
      armDismissGuard();
      if (!asset) {
        return;
      }
      setVideoFile(asset);
      setImageFile(null);
      setMediaType(USER_STORY_MEDIA_TYPE_VIDEO);
    } catch (error) {
      armDismissGuard();
      setErrorMessage(error instanceof Error ? error.message : USER_STORY_UI.ERROR_GENERIC);
    }
  };

  const handlePreviewPress = () => {
    if (isBusy) {
      return;
    }
    Alert.alert(USER_STORY_UI.ERROR_MEDIA_REQUIRED, undefined, [
      {
        text: USER_STORY_UI.PICK_PHOTO,
        onPress: () => {
          void handlePickPhoto();
        },
      },
      {
        text: USER_STORY_UI.PICK_VIDEO,
        onPress: () => {
          void handlePickVideo();
        },
      },
      { text: "Отмена", style: "cancel" },
    ]);
  };

  const handlePublish = async () => {
    const caption = captionText.trim();
    if (caption.length > USER_STORY_CAPTION_MAX_CHARS) {
      setErrorMessage(USER_STORY_UI.ERROR_CAPTION);
      return;
    }

    if (!mediaType || (!imageFile && !videoFile)) {
      setErrorMessage(USER_STORY_UI.ERROR_MEDIA_REQUIRED);
      return;
    }

    setErrorMessage("");
    try {
      const mediaUrl =
        mediaType === USER_STORY_MEDIA_TYPE_VIDEO
          ? await uploadVideoMutation.mutateAsync({ ...videoFile!, purpose: "story" })
          : await uploadImageMutation.mutateAsync(imageFile!);

      await createMutation.mutateAsync({
        mediaType,
        mediaUrl,
        captionText: caption,
      });

      onPublished?.();
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : USER_STORY_UI.ERROR_GENERIC);
    }
  };

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={handleClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} pointerEvents="box-none">
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={handleDismiss}
            disabled={isBusy}
            accessibilityLabel={USER_STORY_UI.CLOSE}
          />
        </Animated.View>

        <Animated.View
          style={[styles.card, { maxHeight: cardMaxHeight }, sheetAnimatedStyle]}
        >
          <ScrollView
            style={[styles.bodyScroll, { maxHeight: bodyScrollMaxHeight }]}
            contentContainerStyle={styles.bodyScrollContent}
            scrollEnabled={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            automaticallyAdjustKeyboardInsets={false}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{USER_STORY_UI.CREATE_TITLE}</Text>
              <Pressable onPress={handleClose} disabled={isBusy} hitSlop={8}>
                <Text style={styles.close}>{USER_STORY_UI.CLOSE}</Text>
              </Pressable>
            </View>

            <Pressable
              style={[
                styles.preview,
                previewSize.width > 0 && previewSize.height > 0
                  ? { width: previewSize.width, height: previewSize.height }
                  : null,
                isBusy && styles.pickDisabled,
              ]}
              onPress={handlePreviewPress}
              disabled={isBusy}
              accessibilityRole="button"
              accessibilityLabel={USER_STORY_UI.ERROR_MEDIA_REQUIRED}
            >
              {previewUri && mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
                <ProductPreviewVideo uri={previewUri} />
              ) : null}
              {previewUri && mediaType === USER_STORY_MEDIA_TYPE_IMAGE ? (
                <Image source={{ uri: previewUri }} style={styles.previewMedia} contentFit="cover" />
              ) : null}
              {!previewUri ? (
                <Text style={styles.placeholder}>{USER_STORY_UI.ERROR_MEDIA_REQUIRED}</Text>
              ) : null}
            </Pressable>

            <View style={styles.captionBlock}>
              <Text style={styles.label}>{USER_STORY_UI.CAPTION_LABEL}</Text>
              <TextInput
                style={styles.caption}
                value={captionText}
                onChangeText={setCaptionText}
                placeholder={USER_STORY_UI.CAPTION_PLACEHOLDER}
                maxLength={USER_STORY_CAPTION_MAX_CHARS}
                multiline
                numberOfLines={6}
                editable={!isBusy}
                autoFocus={false}
                scrollEnabled={true}
              />

              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            </View>

            <View style={styles.submitSpacer} />
          </ScrollView>

          <View style={styles.submitFooter}>
            <Pressable
              style={[styles.submit, isBusy && styles.submitDisabled]}
              onPress={() => {
                void handlePublish();
              }}
              disabled={isBusy}
            >
              {isBusy ? (
                <ActivityIndicator color={theme.colors.onContrast} />
              ) : (
                <Text style={styles.submitText}>{USER_STORY_UI.PUBLISH}</Text>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
