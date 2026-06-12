import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { buildPatchUserProfileBody } from "@/entities/user/lib/buildPatchUserProfileBody";
import {
  mapUserToEditProfileForm,
  type EditProfileFormState,
} from "@/entities/user/lib/mapUserToEditProfileForm";
import { limitRuPhoneInput } from "@/entities/user/lib/ruPhone";
import { validateEditProfileForm } from "@/entities/user/lib/validateEditProfileForm";
import { usePatchUserProfileMutation } from "@/entities/user/model/usePatchUserProfileMutation";
import { ProfileAvatarUpload } from "@/features/image-upload/ui/ProfileAvatarUpload";
import { EDIT_PROFILE_UI } from "@/shared/config";

type EditProfileFormProps = {
  user: Record<string, unknown> & { _id: string; email?: string };
  onSaved?: () => void;
};

export const EditProfileForm = ({ user, onSaved }: EditProfileFormProps) => {
  const initialForm = useMemo(() => mapUserToEditProfileForm(user), [user]);
  const [baselineForm, setBaselineForm] = useState(initialForm);
  const [form, setForm] = useState<EditProfileFormState>(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const patchMutation = usePatchUserProfileMutation();

  const updateField = <K extends keyof EditProfileFormState>(
    key: K,
    value: EditProfileFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async () => {
    const validationError = validateEditProfileForm(form);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const body = buildPatchUserProfileBody(form, baselineForm);
    if (Object.keys(body).length === 0) {
      setErrorMessage(EDIT_PROFILE_UI.NOTHING_TO_SAVE);
      return;
    }

    setErrorMessage("");
    try {
      const updatedUser = await patchMutation.mutateAsync({ userId: user._id, body });
      const nextForm = mapUserToEditProfileForm(updatedUser);
      setBaselineForm(nextForm);
      setForm(nextForm);
      setSuccessMessage(EDIT_PROFILE_UI.SAVED);
      onSaved?.();
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(error instanceof Error ? error.message : EDIT_PROFILE_UI.SAVE_ERROR);
    }
  };

  const isSubmitting = patchMutation.isPending;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <ProfileAvatarUpload
        avatarUrl={form.userAvatarUrl}
        disabled={isSubmitting}
        onAvatarUrlChange={(url) => updateField("userAvatarUrl", url)}
        onError={setErrorMessage}
      />

      <Text style={styles.label}>{EDIT_PROFILE_UI.LABEL_EMAIL}</Text>
      <TextInput
        style={[styles.input, styles.inputReadOnly]}
        value={user.email ?? ""}
        editable={false}
      />

      <Text style={styles.label}>{EDIT_PROFILE_UI.LABEL_USERNAME}</Text>
      <Text style={styles.hint}>{EDIT_PROFILE_UI.USERNAME_HINT}</Text>
      <TextInput
        style={styles.input}
        value={form.userName}
        onChangeText={(value) => updateField("userName", value)}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>{EDIT_PROFILE_UI.LABEL_PHONE}</Text>
      <TextInput
        style={styles.input}
        value={form.userPhoneNumber}
        onChangeText={(value) => updateField("userPhoneNumber", limitRuPhoneInput(value))}
        keyboardType="phone-pad"
        editable={!isSubmitting}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{EDIT_PROFILE_UI.LABEL_NOTIFICATIONS}</Text>
        <Switch
          value={form.notificationsEnabled}
          onValueChange={(value) => updateField("notificationsEnabled", value)}
          disabled={isSubmitting}
        />
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      <Pressable
        style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{EDIT_PROFILE_UI.SUBMIT}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    color: "#888",
  },
  input: {
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#fff",
  },
  inputReadOnly: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  switchRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    flex: 1,
    fontSize: 15,
    color: "#222",
    marginRight: 12,
  },
  error: {
    marginTop: 16,
    fontSize: 14,
    color: "#c62828",
  },
  success: {
    marginTop: 16,
    fontSize: 14,
    color: "#2e7d32",
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
