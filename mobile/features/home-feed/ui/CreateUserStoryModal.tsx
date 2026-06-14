import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useUserStoryMutations } from "@/entities/user-story/model/useUserStoryMutations";
import {
  USER_STORY_CAPTION_MAX_CHARS,
  USER_STORY_MEDIA_TYPE_IMAGE,
  USER_STORY_MEDIA_TYPE_VIDEO,
  type UserStoryMediaType,
} from "@/entities/user-story/model/constants";
import type { UploadImageFilePayload } from "@/entities/upload/api/uploadImage";
import type { UploadVideoFilePayload } from "@/entities/upload/api/uploadVideo";
import { useUploadImageMutation } from "@/entities/upload/model/useUploadImageMutation";
import { useUploadVideoMutation } from "@/entities/upload/model/useUploadVideoMutation";
import { pickGalleryImageAsset } from "@/features/image-upload/lib/pickGalleryImageAsset";
import { pickVideoAsset } from "@/features/image-upload/lib/pickVideoAsset";
import { USER_STORY_UI } from "@/shared/config";
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
  const { createMutation } = useUserStoryMutations();
  const uploadImageMutation = useUploadImageMutation();
  const uploadVideoMutation = useUploadVideoMutation();

  const [captionText, setCaptionText] = useState("");
  const [mediaType, setMediaType] = useState<UserStoryMediaType | null>(null);
  const [imageFile, setImageFile] = useState<UploadImageFilePayload | null>(null);
  const [videoFile, setVideoFile] = useState<UploadVideoFilePayload | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible, resetForm]);

  const handleClose = () => {
    if (isBusy) {
      return;
    }
    resetForm();
    onClose();
  };

  const handlePickPhoto = async () => {
    setErrorMessage("");
    try {
      const asset = await pickGalleryImageAsset();
      if (!asset) {
        return;
      }
      setImageFile(asset);
      setVideoFile(null);
      setMediaType(USER_STORY_MEDIA_TYPE_IMAGE);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : USER_STORY_UI.ERROR_IMAGE);
    }
  };

  const handlePickVideo = async () => {
    setErrorMessage("");
    try {
      const asset = await pickVideoAsset();
      if (!asset) {
        return;
      }
      setVideoFile(asset);
      setImageFile(null);
      setMediaType(USER_STORY_MEDIA_TYPE_VIDEO);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : USER_STORY_UI.ERROR_GENERIC);
    }
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
          ? await uploadVideoMutation.mutateAsync(videoFile!)
          : await uploadImageMutation.mutateAsync(imageFile!);

      await createMutation.mutateAsync({
        mediaType,
        mediaUrl,
        captionText: caption,
      });

      resetForm();
      onPublished?.();
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : USER_STORY_UI.ERROR_GENERIC);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{USER_STORY_UI.CREATE_TITLE}</Text>
            <Pressable onPress={handleClose} disabled={isBusy} hitSlop={8}>
              <Text style={styles.close}>{USER_STORY_UI.CLOSE}</Text>
            </Pressable>
          </View>

          <View style={styles.preview}>
            {previewUri && mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
              <ProductPreviewVideo uri={previewUri} />
            ) : null}
            {previewUri && mediaType === USER_STORY_MEDIA_TYPE_IMAGE ? (
              <Image source={{ uri: previewUri }} style={styles.previewMedia} contentFit="cover" />
            ) : null}
            {!previewUri ? (
              <Text style={styles.placeholder}>{USER_STORY_UI.ERROR_MEDIA_REQUIRED}</Text>
            ) : null}
          </View>

          <View style={styles.pickers}>
            <Pressable
              style={[styles.pickButton, isBusy && styles.pickDisabled]}
              onPress={handlePickPhoto}
              disabled={isBusy}
            >
              <Text style={styles.pickText}>{USER_STORY_UI.PICK_PHOTO}</Text>
            </Pressable>
            <Pressable
              style={[styles.pickButton, isBusy && styles.pickDisabled]}
              onPress={handlePickVideo}
              disabled={isBusy}
            >
              <Text style={styles.pickText}>{USER_STORY_UI.PICK_VIDEO}</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>{USER_STORY_UI.CAPTION_LABEL}</Text>
          <TextInput
            style={styles.caption}
            value={captionText}
            onChangeText={setCaptionText}
            placeholder={USER_STORY_UI.CAPTION_PLACEHOLDER}
            maxLength={USER_STORY_CAPTION_MAX_CHARS}
            multiline
            numberOfLines={2}
            editable={!isBusy}
          />

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          <Pressable
            style={[styles.submit, isBusy && styles.submitDisabled]}
            onPress={handlePublish}
            disabled={isBusy}
          >
            {isBusy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>{USER_STORY_UI.PUBLISH}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  close: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  preview: {
    height: 280,
    borderRadius: 12,
    backgroundColor: "#111",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  previewMedia: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  pickers: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  pickButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  pickDisabled: {
    opacity: 0.5,
  },
  pickText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  label: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  caption: {
    marginTop: 8,
    minHeight: 64,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#111",
    textAlignVertical: "top",
  },
  error: {
    marginTop: 10,
    fontSize: 13,
    color: "#c62828",
  },
  submit: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
