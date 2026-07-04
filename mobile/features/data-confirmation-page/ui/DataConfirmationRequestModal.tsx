import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useUploadImageMutation } from "@/entities/upload/model/useUploadImageMutation";
import type { UploadImageFilePayload } from "@/entities/upload/api/uploadImage";
import {
  emptyPassportForm,
  type PassportSnapshot,
} from "@/entities/user-data-confirmation/lib/emptyPassportForm";
import { validatePassportForm } from "@/entities/user-data-confirmation/lib/validatePassportForm";
import {
  USER_DATA_CONFIRMATION_STATUS_PENDING,
  USER_DATA_CONFIRMATION_STATUS_REJECTED,
} from "@/entities/user-data-confirmation/model/constants";
import { useMyDataConfirmationStatusQuery } from "@/entities/user-data-confirmation/model/useMyDataConfirmationStatusQuery";
import { useSubmitDataConfirmationRequestMutation } from "@/entities/user-data-confirmation/model/useSubmitDataConfirmationRequestMutation";
import { pickGalleryImageAsset } from "@/features/image-upload/lib/pickGalleryImageAsset";
import {
  DATA_CONFIRMATION_MODAL_UI,
  IMAGE_UPLOAD_UI,
  USER_DATA_CONFIRMATION_PROFILE_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCancelButtonStyles } from "@/shared/theme/cancelButtonChromeStyles";
import {
  useBottomSheetFormStyles,
  useFormFieldStyles,
} from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenLoadingState } from "@/shared/ui/ScreenStates";

const keepDigitsOnly = (value: string): string => value.replace(/\D/g, "");

type DataConfirmationRequestModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
};

export const DataConfirmationRequestModal = ({
  visible,
  onClose,
  onSubmitted,
}: DataConfirmationRequestModalProps) => {
  const theme = useAppTheme();
  const sheetStyles = useBottomSheetFormStyles();
  const cancelStyles = useCancelButtonStyles();
  const fieldStyles = useFormFieldStyles();
  const submitMutation = useSubmitDataConfirmationRequestMutation();
  const uploadMutation = useUploadImageMutation();
  const statusQuery = useMyDataConfirmationStatusQuery(visible);

  const [form, setForm] = useState<PassportSnapshot>(emptyPassportForm);
  const [selfieFile, setSelfieFile] = useState<UploadImageFilePayload | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const isSubmitting = submitMutation.isPending || uploadMutation.isPending;

  const status = statusQuery.data;
  const phase = statusQuery.isPending ? "loading" : statusQuery.isError ? "error" : "ready";
  const fetchError = formatApiErrorMessage(
    statusQuery.error,
    USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.FETCH_FALLBACK,
  );
  const isUserDataConfirmed = status?.isUserDataConfirmed === true;
  const requestStatus = status?.request?.status ?? null;
  const staffNote =
    requestStatus === USER_DATA_CONFIRMATION_STATUS_REJECTED
      ? String(status?.request?.staffNote ?? "").trim()
      : "";

  useEffect(() => {
    if (!visible) {
      return;
    }
    setErrorMessage("");
    setSelfieFile(null);
    setForm(emptyPassportForm());
  }, [visible, statusQuery.dataUpdatedAt]);

  const canSubmit =
    !isUserDataConfirmed && requestStatus !== USER_DATA_CONFIRMATION_STATUS_PENDING;
  const displayError = errorMessage || (phase === "error" ? fetchError : "");

  const updateField = <K extends keyof PassportSnapshot>(key: K, value: PassportSnapshot[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePickSelfie = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setErrorMessage("");
      const asset = await pickGalleryImageAsset();
      if (asset) {
        setSelfieFile(asset);
      }
    } catch (error) {
      setErrorMessage(formatApiErrorMessage(error, IMAGE_UPLOAD_UI.ERROR_GENERIC));
      setSelfieFile(null);
    }
  };

  const handleSubmit = async () => {
    const validationError = validatePassportForm(form);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    if (!selfieFile) {
      setErrorMessage(DATA_CONFIRMATION_MODAL_UI.ERROR_PASSPORT_SELFIE_REQUIRED);
      return;
    }

    try {
      setErrorMessage("");
      const passportSelfiePhotoUrl = await uploadMutation.mutateAsync(selfieFile);
      await submitMutation.mutateAsync({
        passport: {
          ...form,
          lastName: form.lastName.trim(),
          firstName: form.firstName.trim(),
          middleName: form.middleName.trim(),
          series: form.series.trim(),
          number: form.number.trim(),
          issuedBy: form.issuedBy.trim(),
          departmentCode: form.departmentCode.trim(),
        },
        passportSelfiePhotoUrl,
      });
      onSubmitted?.();
      onClose();
    } catch (error) {
      setErrorMessage(
        formatApiErrorMessage(error, DATA_CONFIRMATION_MODAL_UI.ERROR_PASSPORT_SELFIE_UPLOAD),
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={sheetStyles.backdrop}>
        <View style={sheetStyles.sheet}>
          <View style={sheetStyles.header}>
            <Text style={sheetStyles.title}>{DATA_CONFIRMATION_MODAL_UI.TITLE}</Text>
            <Pressable
              style={cancelStyles.cancelButtonCompact}
              onPress={onClose}
              hitSlop={8}
            >
              <Text style={cancelStyles.cancelButtonTextCompact}>
                {DATA_CONFIRMATION_MODAL_UI.CANCEL}
              </Text>
            </Pressable>
          </View>

          {phase === "loading" ? (
            <ScreenLoadingState message={USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.LOADING} />
          ) : null}

          {phase === "ready" && isUserDataConfirmed ? (
            <Text style={[fieldStyles.statusOk, sheetStyles.statusPadding]}>
              {DATA_CONFIRMATION_MODAL_UI.STATUS_CONFIRMED}
            </Text>
          ) : null}

          {phase === "ready" && requestStatus === USER_DATA_CONFIRMATION_STATUS_PENDING ? (
            <Text style={[fieldStyles.statusPending, sheetStyles.statusPadding]}>
              {DATA_CONFIRMATION_MODAL_UI.STATUS_PENDING}
            </Text>
          ) : null}

          {phase === "ready" && requestStatus === USER_DATA_CONFIRMATION_STATUS_REJECTED ? (
            <View style={sheetStyles.rejectBlock}>
              <Text style={fieldStyles.statusRejected}>
                {DATA_CONFIRMATION_MODAL_UI.STATUS_REJECTED_TITLE}
              </Text>
              {staffNote ? <Text style={sheetStyles.staffNote}>{staffNote}</Text> : null}
            </View>
          ) : null}

          {phase === "ready" && canSubmit ? (
            <ScrollView contentContainerStyle={sheetStyles.form} keyboardShouldPersistTaps="handled">
              <Text style={sheetStyles.intro}>{DATA_CONFIRMATION_MODAL_UI.INTRO}</Text>

              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_LAST_NAME}
                value={form.lastName}
                onChangeText={(value) => updateField("lastName", value)}
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_FIRST_NAME}
                value={form.firstName}
                onChangeText={(value) => updateField("firstName", value)}
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_MIDDLE_NAME}
                value={form.middleName}
                onChangeText={(value) => updateField("middleName", value)}
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_BIRTH_DATE}
                value={form.birthDate}
                onChangeText={(value) => updateField("birthDate", value)}
                placeholder="ГГГГ-ММ-ДД"
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_SERIES}
                value={form.series}
                onChangeText={(value) => updateField("series", keepDigitsOnly(value).slice(0, 4))}
                keyboardType="number-pad"
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_NUMBER}
                value={form.number}
                onChangeText={(value) => updateField("number", keepDigitsOnly(value).slice(0, 6))}
                keyboardType="number-pad"
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_ISSUED_BY}
                value={form.issuedBy}
                onChangeText={(value) => updateField("issuedBy", value)}
                multiline
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_ISSUED_AT}
                value={form.issuedAt}
                onChangeText={(value) => updateField("issuedAt", value)}
                placeholder="ГГГГ-ММ-ДД"
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_DEPARTMENT_CODE}
                value={form.departmentCode}
                onChangeText={(value) => updateField("departmentCode", value)}
                placeholder={DATA_CONFIRMATION_MODAL_UI.PLACEHOLDER_DEPARTMENT_CODE}
              />

              <View style={sheetStyles.selfieSection}>
                <Text style={fieldStyles.fieldLabel}>
                  {DATA_CONFIRMATION_MODAL_UI.LABEL_PASSPORT_SELFIE}
                </Text>
                <Text style={sheetStyles.selfieHint}>
                  {DATA_CONFIRMATION_MODAL_UI.HINT_PASSPORT_SELFIE}
                </Text>
                <AppButton
                  label={IMAGE_UPLOAD_UI.UPLOAD_BUTTON}
                  variant="contrast"
                  onPress={() => void handlePickSelfie()}
                  disabled={isSubmitting}
                />
                {selfieFile ? <Text style={sheetStyles.fileName}>{selfieFile.name}</Text> : null}
                {selfieFile ? (
                  <Image source={{ uri: selfieFile.uri }} style={sheetStyles.preview} />
                ) : null}
              </View>

              {displayError ? <Text style={fieldStyles.error}>{displayError}</Text> : null}

              <AppButton
                label={
                  isSubmitting
                    ? DATA_CONFIRMATION_MODAL_UI.SUBMIT_LOADING
                    : DATA_CONFIRMATION_MODAL_UI.SUBMIT
                }
                variant="contrast"
                onPress={() => void handleSubmit()}
                disabled={isSubmitting}
              />
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
  multiline?: boolean;
};

const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}: FormFieldProps) => {
  const theme = useAppTheme();
  const fieldStyles = useFormFieldStyles();

  return (
    <View style={fieldStyles.field}>
      <Text style={fieldStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          fieldStyles.input,
          fieldStyles.inputCompact,
          multiline && fieldStyles.inputMultiline,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCorrect={false}
      />
    </View>
  );
};
