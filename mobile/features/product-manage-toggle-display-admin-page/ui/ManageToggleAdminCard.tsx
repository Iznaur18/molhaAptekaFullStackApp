import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useProductManageToggleDisplayMutations } from "@/entities/product-manage-toggle-display/model/useProductManageToggleDisplayMutations";
import { ProductManageToggleRow } from "@/entities/product/ui/ProductManageToggleRow";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type ManageToggleAdminCardProps = {
  toggleKey: string;
  variant: "default" | "auction" | "installment" | "raffle";
  title: string;
  description: string;
  imageUrl: string | null;
};

const ManageToggleAdminCard = ({
  toggleKey,
  variant,
  title,
  description,
  imageUrl,
}: ManageToggleAdminCardProps) => {
  const theme = useAppTheme();
  const { patchToggleMutation } = useProductManageToggleDisplayMutations();
  const [draftImageUrl, setDraftImageUrl] = useState(imageUrl ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);
  const isSaving = patchToggleMutation.isPending;

  useEffect(() => {
    setDraftImageUrl(imageUrl ?? "");
    setErrorMessage("");
    setSavedNotice(false);
  }, [imageUrl, toggleKey]);

  const handleSave = async () => {
    const trimmed = draftImageUrl.trim();
    const hadImage = Boolean(imageUrl && imageUrl.trim());

    try {
      setErrorMessage("");
      setSavedNotice(false);
      const { display } = await patchToggleMutation.mutateAsync({
        toggleKey,
        body: {
          imageUrl: trimmed || null,
          resetImageUrl: trimmed === "" && hadImage,
        },
      });
      setDraftImageUrl(display.imageUrl ?? "");
      setSavedNotice(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.SAVE_ERROR,
      );
    }
  };

  const handleReset = async () => {
    if (!imageUrl) {
      setDraftImageUrl("");
      return;
    }

    try {
      setErrorMessage("");
      setSavedNotice(false);
      await patchToggleMutation.mutateAsync({
        toggleKey,
        body: { resetImageUrl: true },
      });
      setDraftImageUrl("");
      setSavedNotice(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.SAVE_ERROR,
      );
    }
  };

  return (
    <View
      style={{
        gap: 12,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
    >
      <View pointerEvents="none">
        <ProductManageToggleRow
          title={title}
          description={description}
          checked
          variant={variant === "installment" ? "default" : variant}
          disabled
        />
      </View>
      <ImageUrlUploadField
        label={PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.LABEL_IMAGE}
        value={draftImageUrl}
        disabled={isSaving}
        onChange={setDraftImageUrl}
      />
      {errorMessage ? (
        <Text style={{ color: theme.colors.danger, fontSize: 13 }}>{errorMessage}</Text>
      ) : null}
      {savedNotice ? (
        <Text style={{ color: theme.colors.success, fontSize: 13 }}>
          {PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.SAVED}
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: theme.colors.actionSurface,
            opacity: isSaving ? 0.65 : 1,
          }}
          onPress={() => void handleSave()}
        >
          <Text style={{ fontWeight: "700", color: theme.colors.text }}>
            {isSaving
              ? PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.SAVING
              : PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.SAVE}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isSaving || (!imageUrl && !draftImageUrl.trim())}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: theme.colors.surfaceMuted,
            opacity: isSaving ? 0.65 : 1,
          }}
          onPress={() => void handleReset()}
        >
          <Text style={{ fontWeight: "600", color: theme.colors.textMuted }}>
            {PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_UI.RESET_IMAGE}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export { ManageToggleAdminCard };
