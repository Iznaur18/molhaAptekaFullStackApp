import { Image } from "expo-image";
import { useCallback, useMemo, useRef, useState } from "react";
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
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CREATE_USER_STORY_MODAL_LAYOUT as L } from "@/entities/user-story/lib/createUserStoryModalLayout";
import { useCreateUserStoryModalAnimation } from "@/entities/user-story/model/useCreateUserStoryModalAnimation";
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
  CREATE_STORY_SUBMIT_FOOTER_HEIGHT_PX,
  useCreateStoryModalStyles,
} from "@/shared/theme/modalChromeStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";

type CreateUserStoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onPublished?: () => void;
};

export const CreateUserStoryModal = ({
  visible,
  onClose,
  onPublished,
}: CreateUserStoryModalProps) => {
  const styles = useCreateStoryModalStyles();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = useMemo(() => windowHeight * L.heightRatio, [windowHeight]);
  const bodyScrollMaxHeight = useMemo(
    () => sheetHeight - CREATE_STORY_SUBMIT_FOOTER_HEIGHT_PX - insets.bottom,
    [sheetHeight, insets.bottom],
  );
  const isWide = windowWidth >= L.wideBreakpoint;
  const theme = useAppTheme();
  const { createMutation } = useUserStoryMutations();
  const uploadImageMutation = useUploadImageMutation();
  const uploadVideoMutation = useUploadVideoMutation();
  const dismissGuardUntilRef = useRef(0);

  const [captionText, setCaptionText] = useState("");
  const [mediaType, setMediaType] = useState<UserStoryMediaType | null>(null);
  const [imageFile, setImageFile] = useState<UploadImageFilePayload | null>(null);
  const [videoFile, setVideoFile] = useState<UploadVideoFilePayload | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = useCallback(() => {
    setCaptionText("");
    setMediaType(null);
    setImageFile(null);
    setVideoFile(null);
    setErrorMessage("");
  }, []);

  const { modalVisible, backdropAnimatedStyle, sheetAnimatedStyle, useCssTransition } =
    useCreateUserStoryModalAnimation(visible, sheetHeight, resetForm);

  useRegisterBlockingOverlay(modalVisible);

  const isBusy =
    createMutation.isPending || uploadImageMutation.isPending || uploadVideoMutation.isPending;

  const previewUri = imageFile?.uri ?? videoFile?.uri ?? null;

  const armDismissGuard = useCallback(() => {
    dismissGuardUntilRef.current = Date.now() + L.dismissGuardMs;
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

  const BackdropContainer = useCssTransition ? View : Animated.View;
  const SheetContainer = useCssTransition ? View : Animated.View;

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.root} accessibilityViewIsModal>
        <BackdropContainer style={[styles.backdrop, backdropAnimatedStyle]} pointerEvents="box-none">
          <ModalSheetGradientBackdrop />
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={handleDismiss}
            disabled={isBusy}
            accessibilityLabel={USER_STORY_UI.CLOSE}
          />
        </BackdropContainer>

        <SheetContainer
          style={[
            styles.card,
            isWide ? styles.cardWide : null,
            { height: sheetHeight, maxHeight: sheetHeight },
            sheetAnimatedStyle,
          ]}
          accessibilityRole="none"
        >
          <ScrollView
            style={[styles.bodyScroll, { maxHeight: bodyScrollMaxHeight }]}
            contentContainerStyle={styles.bodyScrollContent}
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
              style={[styles.preview, isBusy && styles.pickDisabled]}
              onPress={handlePreviewPress}
              disabled={isBusy}
              accessibilityRole="button"
              accessibilityLabel={USER_STORY_UI.ERROR_MEDIA_REQUIRED}
            >
              {previewUri && mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
                <ProductPreviewVideo uri={previewUri} />
              ) : null}
              {previewUri && mediaType === USER_STORY_MEDIA_TYPE_IMAGE ? (
                <>
                  <Image
                    source={{ uri: previewUri }}
                    style={[styles.previewMedia, styles.previewBlur]}
                    contentFit="cover"
                    blurRadius={28}
                  />
                  <Image
                    source={{ uri: previewUri }}
                    style={styles.previewMedia}
                    contentFit="contain"
                  />
                </>
              ) : null}
              {!previewUri ? (
                <Text style={styles.placeholder}>{USER_STORY_UI.ERROR_MEDIA_REQUIRED}</Text>
              ) : null}
            </Pressable>

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

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
                scrollEnabled
              />
            </View>

            <View style={styles.submitSpacer} />
          </ScrollView>

          <View
            style={[
              styles.submitFooter,
              { paddingBottom: Math.max(L.footerPaddingBottomMin, insets.bottom) },
            ]}
          >
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
        </SheetContainer>
      </View>
    </Modal>
  );
};
