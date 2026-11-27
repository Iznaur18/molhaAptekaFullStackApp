import { useState } from "react";
import { Image, Text, View } from "react-native";

import { uploadImage } from "@/entities/upload/api/uploadImage";
import { pickGalleryImageAsset } from "@/features/image-upload/lib/pickGalleryImageAsset";
import { COURIER_UI } from "@/shared/config";
import { useServicesProfilePageStyles } from "@/shared/theme/servicesProfilePageStyles";
import { AppButton } from "@/shared/ui/AppButton";

const COURIER_DOCUMENT_PURPOSE = "courier-document";

type CourierDocumentFieldProps = {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (url: string) => void;
  onError: (message: string) => void;
};

export const CourierDocumentField = ({
  label,
  value,
  disabled = false,
  onChange,
  onError,
}: CourierDocumentFieldProps) => {
  const styles = useServicesProfilePageStyles();
  const [previewUri, setPreviewUri] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const hasFile = Boolean(value);

  const handlePick = async () => {
    onError("");
    setIsUploading(true);
    try {
      const file = await pickGalleryImageAsset();
      if (!file) return;
      const url = await uploadImage(file, COURIER_DOCUMENT_PURPOSE);
      onChange(url);
      setPreviewUri(file.uri);
    } catch (error) {
      onError(error instanceof Error ? error.message : COURIER_UI.ERROR_GENERIC);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.docBox}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={styles.docPreview} />
      ) : hasFile ? (
        <Text style={styles.ok}>{COURIER_UI.PHOTO_READY}</Text>
      ) : null}
      <AppButton
        label={
          isUploading
            ? COURIER_UI.PHOTO_UPLOADING
            : hasFile
              ? COURIER_UI.PHOTO_REPLACE
              : COURIER_UI.PHOTO_PICK
        }
        variant="secondary"
        disabled={disabled || isUploading}
        onPress={() => void handlePick()}
      />
    </View>
  );
};
