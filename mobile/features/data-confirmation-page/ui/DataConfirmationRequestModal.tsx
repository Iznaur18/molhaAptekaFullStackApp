import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
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
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {DATA_CONFIRMATION_MODAL_UI.TITLE}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={[styles.close, { color: theme.colors.link }]}>
                {DATA_CONFIRMATION_MODAL_UI.CANCEL}
              </Text>
            </Pressable>
          </View>

          {phase === "loading" ? (
            <ScreenLoadingState message={USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.LOADING} />
          ) : null}

          {phase === "ready" && isUserDataConfirmed ? (
            <Text style={styles.statusOk}>{DATA_CONFIRMATION_MODAL_UI.STATUS_CONFIRMED}</Text>
          ) : null}

          {phase === "ready" && requestStatus === USER_DATA_CONFIRMATION_STATUS_PENDING ? (
            <Text style={styles.statusPending}>{DATA_CONFIRMATION_MODAL_UI.STATUS_PENDING}</Text>
          ) : null}

          {phase === "ready" && requestStatus === USER_DATA_CONFIRMATION_STATUS_REJECTED ? (
            <View style={styles.rejectBlock}>
              <Text style={styles.statusRejected}>
                {DATA_CONFIRMATION_MODAL_UI.STATUS_REJECTED_TITLE}
              </Text>
              {staffNote ? (
                <Text style={[styles.staffNote, { color: theme.colors.textMuted }]}>
                  {staffNote}
                </Text>
              ) : null}
            </View>
          ) : null}

          {phase === "ready" && canSubmit ? (
            <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
              <Text style={[styles.intro, { color: theme.colors.textMuted }]}>
                {DATA_CONFIRMATION_MODAL_UI.INTRO}
              </Text>

              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_LAST_NAME}
                value={form.lastName}
                onChangeText={(value) => updateField("lastName", value)}
                themeText={theme.colors.text}
                themeBorder={theme.colors.border}
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_FIRST_NAME}
                value={form.firstName}
                onChangeText={(value) => updateField("firstName", value)}
                themeText={theme.colors.text}
                themeBorder={theme.colors.border}
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_MIDDLE_NAME}
                value={form.middleName}
                onChangeText={(value) => updateField("middleName", value)}
                themeText={theme.colors.text}
                themeBorder={theme.colors.border}
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_BIRTH_DATE}
                value={form.birthDate}
                onChangeText={(value) => updateField("birthDate", value)}
                placeholder="ГГГГ-ММ-ДД"
                themeText={theme.colors.text}
                themeBorder={theme.colors.border}
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_SERIES}
                value={form.series}
                onChangeText={(value) => updateField("series", keepDigitsOnly(value).slice(0, 4))}
                keyboardType="number-pad"
                themeText={theme.colors.text}
                themeBorder={theme.colors.border}
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_NUMBER}
                value={form.number}
                onChangeText={(value) => updateField("number", keepDigitsOnly(value).slice(0, 6))}
                keyboardType="number-pad"
                themeText={theme.colors.text}
                themeBorder={theme.colors.border}
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_ISSUED_BY}
                value={form.issuedBy}
                onChangeText={(value) => updateField("issuedBy", value)}
                multiline
                themeText={theme.colors.text}
                themeBorder={theme.colors.border}
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_ISSUED_AT}
                value={form.issuedAt}
                onChangeText={(value) => updateField("issuedAt", value)}
                placeholder="ГГГГ-ММ-ДД"
                themeText={theme.colors.text}
                themeBorder={theme.colors.border}
              />
              <FormField
                label={DATA_CONFIRMATION_MODAL_UI.LABEL_DEPARTMENT_CODE}
                value={form.departmentCode}
                onChangeText={(value) => updateField("departmentCode", value)}
                placeholder={DATA_CONFIRMATION_MODAL_UI.PLACEHOLDER_DEPARTMENT_CODE}
                themeText={theme.colors.text}
                themeBorder={theme.colors.border}
              />

              <View style={styles.selfieSection}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
                  {DATA_CONFIRMATION_MODAL_UI.LABEL_PASSPORT_SELFIE}
                </Text>
                <Text style={[styles.selfieHint, { color: theme.colors.textMuted }]}>
                  {DATA_CONFIRMATION_MODAL_UI.HINT_PASSPORT_SELFIE}
                </Text>
                <Pressable
                  style={[styles.uploadButton, { backgroundColor: theme.colors.nearBlack }]}
                  onPress={() => void handlePickSelfie()}
                  disabled={isSubmitting}
                >
                  <Text style={styles.uploadButtonText}>{IMAGE_UPLOAD_UI.UPLOAD_BUTTON}</Text>
                </Pressable>
                {selfieFile ? (
                  <Text style={[styles.fileName, { color: theme.colors.textMuted }]}>
                    {selfieFile.name}
                  </Text>
                ) : null}
                {selfieFile ? (
                  <Image source={{ uri: selfieFile.uri }} style={styles.preview} />
                ) : null}
              </View>

              {displayError ? <Text style={styles.error}>{displayError}</Text> : null}

              <Pressable
                style={[styles.submitButton, { backgroundColor: theme.colors.nearBlack }]}
                onPress={() => void handleSubmit()}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting
                    ? DATA_CONFIRMATION_MODAL_UI.SUBMIT_LOADING
                    : DATA_CONFIRMATION_MODAL_UI.SUBMIT}
                </Text>
              </Pressable>
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
  themeText: string;
  themeBorder: string;
};

const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  themeText,
  themeBorder,
}: FormFieldProps) => (
  <View style={styles.field}>
    <Text style={[styles.fieldLabel, { color: themeText }]}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        { color: themeText, borderColor: themeBorder },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      multiline={multiline}
      autoCorrect={false}
    />
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "92%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  close: {
    fontSize: 15,
    fontWeight: "600",
  },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  form: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  selfieSection: {
    gap: 8,
    marginTop: 4,
  },
  selfieHint: {
    fontSize: 13,
  },
  uploadButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  fileName: {
    fontSize: 13,
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    backgroundColor: "#f4f4f4",
  },
  error: {
    color: "#c62828",
    fontSize: 14,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusOk: {
    paddingHorizontal: 16,
    color: "#2e7d32",
    fontSize: 15,
    fontWeight: "600",
  },
  statusPending: {
    paddingHorizontal: 16,
    color: "#f57c00",
    fontSize: 15,
    fontWeight: "600",
  },
  rejectBlock: {
    paddingHorizontal: 16,
    gap: 6,
  },
  statusRejected: {
    color: "#c62828",
    fontSize: 15,
    fontWeight: "600",
  },
  staffNote: {
    fontSize: 14,
    lineHeight: 20,
  },
});
