import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useCreateRaffleMutation } from "@/entities/raffle/model/useCreateRaffleMutation";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { VideoUrlUploadField } from "@/features/image-upload/ui/VideoUrlUploadField";
import { CREATE_RAFFLE_PAGE_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

const PRIZE_MEDIA_IMAGE = "image" as const;
const PRIZE_MEDIA_VIDEO = "video" as const;

export const CreateRafflePage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const isAuthorized = useIsAuthorized();
  const { isUserDataConfirmed } = useUserAccess();
  const createMutation = useCreateRaffleMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prizeMediaType, setPrizeMediaType] = useState<"image" | "video">(PRIZE_MEDIA_IMAGE);
  const [prizeImageUrl, setPrizeImageUrl] = useState("");
  const [prizeVideoUrl, setPrizeVideoUrl] = useState("");
  const [targetSales, setTargetSales] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {CREATE_RAFFLE_PAGE_UI.LOGIN_HINT}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>{CREATE_RAFFLE_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (!isUserDataConfirmed) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {CREATE_RAFFLE_PAGE_UI.CONFIRMED_DATA_REQUIRED}
        </Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const sales = Number(targetSales);
    if (!title.trim()) {
      setErrorMessage(CREATE_RAFFLE_PAGE_UI.ERROR_TITLE);
      return;
    }
    if (!Number.isFinite(sales) || sales < 1) {
      setErrorMessage(CREATE_RAFFLE_PAGE_UI.ERROR_TARGET);
      return;
    }
    if (!instagramUrl.trim()) {
      setErrorMessage(CREATE_RAFFLE_PAGE_UI.ERROR_INSTAGRAM);
      return;
    }

    const isVideo = prizeMediaType === PRIZE_MEDIA_VIDEO;
    if (isVideo && !prizeVideoUrl.trim()) {
      setErrorMessage(CREATE_RAFFLE_PAGE_UI.ERROR_PRIZE_VIDEO);
      return;
    }
    if (!isVideo && !prizeImageUrl.trim()) {
      setErrorMessage(CREATE_RAFFLE_PAGE_UI.ERROR_PRIZE_IMAGE);
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        prizeMediaType,
        prizeImageUrl: resolveUploadedMediaUrl(prizeImageUrl.trim()),
        prizeVideoUrl: resolveUploadedMediaUrl(prizeVideoUrl.trim()),
        prizeImageFocus: { x: 0.5, y: 0.5 },
        targetSales: sales,
        instagramUrl: instagramUrl.trim(),
      });
      setSuccessMessage(CREATE_RAFFLE_PAGE_UI.SUCCESS);
      setTitle("");
      setDescription("");
      setPrizeImageUrl("");
      setPrizeVideoUrl("");
      setTargetSales("");
      setInstagramUrl("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : CREATE_RAFFLE_PAGE_UI.SUBMIT_FALLBACK,
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
        {CREATE_RAFFLE_PAGE_UI.HINT}
      </Text>

      <Text style={styles.label}>{CREATE_RAFFLE_PAGE_UI.LABEL_TITLE}</Text>
      <TextInput
        style={styles.input}
        value={title}
        maxLength={120}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>{CREATE_RAFFLE_PAGE_UI.LABEL_DESCRIPTION}</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={description}
        maxLength={4000}
        multiline
        onChangeText={setDescription}
      />

      <Text style={styles.label}>{CREATE_RAFFLE_PAGE_UI.LABEL_PRIZE_MEDIA}</Text>
      <View style={styles.mediaTypeRow}>
        <Pressable
          style={[
            styles.mediaChip,
            prizeMediaType === PRIZE_MEDIA_IMAGE && styles.mediaChipActive,
          ]}
          onPress={() => setPrizeMediaType(PRIZE_MEDIA_IMAGE)}
        >
          <Text
            style={[
              styles.mediaChipText,
              prizeMediaType === PRIZE_MEDIA_IMAGE && styles.mediaChipTextActive,
            ]}
          >
            {CREATE_RAFFLE_PAGE_UI.LABEL_PRIZE_MEDIA_TYPE_IMAGE}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.mediaChip,
            prizeMediaType === PRIZE_MEDIA_VIDEO && styles.mediaChipActive,
          ]}
          onPress={() => setPrizeMediaType(PRIZE_MEDIA_VIDEO)}
        >
          <Text
            style={[
              styles.mediaChipText,
              prizeMediaType === PRIZE_MEDIA_VIDEO && styles.mediaChipTextActive,
            ]}
          >
            {CREATE_RAFFLE_PAGE_UI.LABEL_PRIZE_MEDIA_TYPE_VIDEO}
          </Text>
        </Pressable>
      </View>

      {prizeMediaType === PRIZE_MEDIA_IMAGE ? (
        <ImageUrlUploadField
          label={CREATE_RAFFLE_PAGE_UI.LABEL_PRIZE_IMAGE}
          value={prizeImageUrl}
          onChange={setPrizeImageUrl}
          disabled={createMutation.isPending}
        />
      ) : (
        <VideoUrlUploadField
          label={CREATE_RAFFLE_PAGE_UI.LABEL_PRIZE_VIDEO}
          value={prizeVideoUrl}
          onChange={setPrizeVideoUrl}
          disabled={createMutation.isPending}
        />
      )}

      <Text style={styles.label}>{CREATE_RAFFLE_PAGE_UI.LABEL_TARGET}</Text>
      <TextInput
        style={styles.input}
        value={targetSales}
        keyboardType="number-pad"
        onChangeText={setTargetSales}
      />

      <Text style={styles.label}>{CREATE_RAFFLE_PAGE_UI.LABEL_INSTAGRAM}</Text>
      <TextInput
        style={styles.input}
        value={instagramUrl}
        autoCapitalize="none"
        onChangeText={setInstagramUrl}
      />

      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Pressable
        style={[styles.submit, createMutation.isPending && styles.submitDisabled]}
        onPress={() => {
          void handleSubmit();
        }}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{CREATE_RAFFLE_PAGE_UI.SUBMIT}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 10,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  mediaTypeRow: {
    flexDirection: "row",
    gap: 8,
  },
  mediaChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  mediaChipActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  mediaChipText: {
    fontSize: 13,
    color: "#333",
  },
  mediaChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  submit: {
    marginTop: 8,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  success: {
    color: "#2e7d32",
    fontSize: 14,
  },
  error: {
    color: "#c62828",
    fontSize: 14,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
