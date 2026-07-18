import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import {
  maskPassportDateInput,
  parsePassportDateInputToIso,
} from "@/entities/user-data-confirmation/lib/passportDateInputMask";
import { maskPassportDepartmentCodeInput } from "@/entities/user-data-confirmation/lib/passportDepartmentCodeInputMask";
import { validatePassportForm } from "@/entities/user-data-confirmation/lib/validatePassportForm";
import {
  PASSPORT_FORM_STEP_COUNT,
  PASSPORT_FORM_STEP_IDENTITY,
  PASSPORT_FORM_STEP_PASSPORT,
  PASSPORT_FORM_STEP_SELFIE,
  validatePassportFormStep,
} from "@/entities/user-data-confirmation/lib/validatePassportFormStep";
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
import { useDataConfirmationRequestModalStyles } from "@/shared/theme/dataConfirmationPageStyles";
import { useFormFieldStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenLoadingState } from "@/shared/ui/ScreenStates";

const keepDigitsOnly = (value: string): string => value.replace(/\D/g, "");

const STEP_TITLES = [
  DATA_CONFIRMATION_MODAL_UI.STEP_IDENTITY,
  DATA_CONFIRMATION_MODAL_UI.STEP_PASSPORT,
  DATA_CONFIRMATION_MODAL_UI.STEP_SELFIE,
] as const;

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
  const styles = useDataConfirmationRequestModalStyles();
  const cancelStyles = useCancelButtonStyles();
  const fieldStyles = useFormFieldStyles();
  const submitMutation = useSubmitDataConfirmationRequestMutation();
  const uploadMutation = useUploadImageMutation();
  const statusQuery = useMyDataConfirmationStatusQuery(visible);

  const [form, setForm] = useState<PassportSnapshot>(emptyPassportForm);
  const [selfieFile, setSelfieFile] = useState<UploadImageFilePayload | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(PASSPORT_FORM_STEP_IDENTITY);

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
    setStep(PASSPORT_FORM_STEP_IDENTITY);
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

  const handleNextStep = () => {
    const stepError = validatePassportFormStep(form, step);
    if (stepError) {
      setErrorMessage(stepError);
      return;
    }
    setErrorMessage("");
    setStep((prev) => Math.min(prev + 1, PASSPORT_FORM_STEP_SELFIE));
  };

  const handleBackStep = () => {
    setErrorMessage("");
    setStep((prev) => Math.max(prev - 1, PASSPORT_FORM_STEP_IDENTITY));
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

    const birthDateIso = parsePassportDateInputToIso(form.birthDate);
    const issuedAtIso = parsePassportDateInputToIso(form.issuedAt);
    if (!birthDateIso || !issuedAtIso) {
      setErrorMessage("Проверьте даты: ДД.ММ.ГГГГ");
      return;
    }

    try {
      setErrorMessage("");
      const passportSelfiePhotoUrl = await uploadMutation.mutateAsync({
        file: selfieFile,
        purpose: "passport-selfie",
      });
      await submitMutation.mutateAsync({
        passport: {
          ...form,
          lastName: form.lastName.trim(),
          firstName: form.firstName.trim(),
          middleName: form.middleName.trim(),
          birthDate: birthDateIso,
          series: form.series.trim(),
          number: form.number.trim(),
          issuedBy: form.issuedBy.trim(),
          issuedAt: issuedAtIso,
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
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={DATA_CONFIRMATION_MODAL_UI.CANCEL}
        />
        <KeyboardAvoidingView
          style={styles.keyboardHost}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        >
          <View style={styles.card} accessibilityRole="dialog">
            <View style={styles.header}>
              <Text style={styles.title}>{DATA_CONFIRMATION_MODAL_UI.TITLE}</Text>
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
              <Text style={[fieldStyles.statusOk, styles.statusPadding]}>
                {DATA_CONFIRMATION_MODAL_UI.STATUS_CONFIRMED}
              </Text>
            ) : null}

            {phase === "ready" && requestStatus === USER_DATA_CONFIRMATION_STATUS_PENDING ? (
              <Text style={[fieldStyles.statusPending, styles.statusPadding]}>
                {DATA_CONFIRMATION_MODAL_UI.STATUS_PENDING}
              </Text>
            ) : null}

            {phase === "ready" && requestStatus === USER_DATA_CONFIRMATION_STATUS_REJECTED ? (
              <View style={styles.rejectBlock}>
                <Text style={fieldStyles.statusRejected}>
                  {DATA_CONFIRMATION_MODAL_UI.STATUS_REJECTED_TITLE}
                </Text>
                {staffNote ? <Text style={styles.staffNote}>{staffNote}</Text> : null}
              </View>
            ) : null}

            {phase === "ready" && canSubmit ? (
              <ScrollView
                contentContainerStyle={styles.form}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
                <Text style={styles.intro}>{DATA_CONFIRMATION_MODAL_UI.INTRO}</Text>

                <View style={styles.stepMeta}>
                  <Text style={styles.stepProgress}>
                    {DATA_CONFIRMATION_MODAL_UI.STEP_PROGRESS(
                      step + 1,
                      PASSPORT_FORM_STEP_COUNT,
                    )}
                  </Text>
                  <Text style={styles.stepTitle}>{STEP_TITLES[step]}</Text>
                </View>

                {step === PASSPORT_FORM_STEP_IDENTITY ? (
                  <>
                    <PassportFormField
                      label={DATA_CONFIRMATION_MODAL_UI.LABEL_LAST_NAME}
                      value={form.lastName}
                      onChangeText={(value) => updateField("lastName", value)}
                    />
                    <PassportFormField
                      label={DATA_CONFIRMATION_MODAL_UI.LABEL_FIRST_NAME}
                      value={form.firstName}
                      onChangeText={(value) => updateField("firstName", value)}
                    />
                    <PassportFormField
                      label={DATA_CONFIRMATION_MODAL_UI.LABEL_MIDDLE_NAME}
                      value={form.middleName}
                      onChangeText={(value) => updateField("middleName", value)}
                    />
                    <PassportFormField
                      label={DATA_CONFIRMATION_MODAL_UI.LABEL_BIRTH_DATE}
                      value={form.birthDate}
                      onChangeText={(value) =>
                        updateField("birthDate", maskPassportDateInput(value))
                      }
                      placeholder={DATA_CONFIRMATION_MODAL_UI.PLACEHOLDER_DATE}
                      keyboardType="number-pad"
                      maxLength={10}
                    />
                  </>
                ) : null}

                {step === PASSPORT_FORM_STEP_PASSPORT ? (
                  <>
                    <PassportFormField
                      label={DATA_CONFIRMATION_MODAL_UI.LABEL_SERIES}
                      value={form.series}
                      onChangeText={(value) =>
                        updateField("series", keepDigitsOnly(value).slice(0, 4))
                      }
                      keyboardType="number-pad"
                    />
                    <PassportFormField
                      label={DATA_CONFIRMATION_MODAL_UI.LABEL_NUMBER}
                      value={form.number}
                      onChangeText={(value) =>
                        updateField("number", keepDigitsOnly(value).slice(0, 6))
                      }
                      keyboardType="number-pad"
                    />
                    <PassportFormField
                      label={DATA_CONFIRMATION_MODAL_UI.LABEL_ISSUED_BY}
                      value={form.issuedBy}
                      onChangeText={(value) => updateField("issuedBy", value)}
                      multiline
                    />
                    <PassportFormField
                      label={DATA_CONFIRMATION_MODAL_UI.LABEL_ISSUED_AT}
                      value={form.issuedAt}
                      onChangeText={(value) =>
                        updateField("issuedAt", maskPassportDateInput(value))
                      }
                      placeholder={DATA_CONFIRMATION_MODAL_UI.PLACEHOLDER_DATE}
                      keyboardType="number-pad"
                      maxLength={10}
                    />
                    <PassportFormField
                      label={DATA_CONFIRMATION_MODAL_UI.LABEL_DEPARTMENT_CODE}
                      value={form.departmentCode}
                      onChangeText={(value) =>
                        updateField("departmentCode", maskPassportDepartmentCodeInput(value))
                      }
                      placeholder={DATA_CONFIRMATION_MODAL_UI.PLACEHOLDER_DEPARTMENT_CODE}
                      keyboardType="number-pad"
                      maxLength={7}
                    />
                  </>
                ) : null}

                {step === PASSPORT_FORM_STEP_SELFIE ? (
                  <View style={styles.selfieSection}>
                    <Text style={fieldStyles.fieldLabel}>
                      {DATA_CONFIRMATION_MODAL_UI.LABEL_PASSPORT_SELFIE}
                    </Text>
                    <Text style={styles.selfieHint}>
                      {DATA_CONFIRMATION_MODAL_UI.HINT_PASSPORT_SELFIE}
                    </Text>
                    <AppButton
                      label={IMAGE_UPLOAD_UI.UPLOAD_BUTTON}
                      variant="contrast"
                      onPress={() => void handlePickSelfie()}
                      disabled={isSubmitting}
                    />
                    {selfieFile ? <Text style={styles.fileName}>{selfieFile.name}</Text> : null}
                    {selfieFile ? (
                      <Image source={{ uri: selfieFile.uri }} style={styles.preview} />
                    ) : null}
                  </View>
                ) : null}

                {displayError ? <Text style={fieldStyles.error}>{displayError}</Text> : null}

                <View style={styles.stepActions}>
                  {step > PASSPORT_FORM_STEP_IDENTITY ? (
                    <View style={styles.stepActionFlex}>
                      <AppButton
                        label={DATA_CONFIRMATION_MODAL_UI.BACK}
                        variant="secondary"
                        onPress={handleBackStep}
                        disabled={isSubmitting}
                      />
                    </View>
                  ) : null}
                  <View style={styles.stepActionFlex}>
                    {step < PASSPORT_FORM_STEP_SELFIE ? (
                      <AppButton
                        label={DATA_CONFIRMATION_MODAL_UI.NEXT}
                        variant="contrast"
                        onPress={handleNextStep}
                        disabled={isSubmitting}
                      />
                    ) : (
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
                    )}
                  </View>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

type PassportFormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
  multiline?: boolean;
  maxLength?: number;
};

const PassportFormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  maxLength,
}: PassportFormFieldProps) => {
  const theme = useAppTheme();
  const fieldStyles = useFormFieldStyles();
  const styles = useDataConfirmationRequestModalStyles();

  return (
    <View style={fieldStyles.field}>
      <Text style={fieldStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.passportInput, multiline && fieldStyles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        autoCorrect={false}
      />
    </View>
  );
};
