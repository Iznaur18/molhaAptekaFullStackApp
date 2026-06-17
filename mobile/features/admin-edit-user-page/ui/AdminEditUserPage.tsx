import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView, Switch, Text, TextInput, View } from "react-native";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { limitRuPhoneInput } from "@/entities/user/lib/ruPhone";
import { AdminPremiumStaffControl } from "@/entities/user/ui/AdminPremiumStaffControl";
import { AdminUserRolePicker } from "@/entities/user/ui/AdminUserRolePicker";
import { useAdminEditUserForm } from "@/features/admin-edit-user-page/model/useAdminEditUserForm";
import { ProfileAvatarUpload } from "@/features/image-upload/ui/ProfileAvatarUpload";
import { ADMIN_EDIT_USER_UI, EDIT_PROFILE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useFormFieldStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const AdminEditUserPage = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const styles = useFormFieldStyles();
  const params = useLocalSearchParams<{ id?: string }>();
  const userId = String(params.id ?? "").trim();

  const sessionQuery = useAuthSessionQuery();
  const currentUserId =
    sessionQuery.data?.user?._id != null ? String(sessionQuery.data.user._id) : null;

  const {
    canAccess,
    profileQuery,
    user,
    form,
    updateField,
    handleSubmit,
    errorMessage,
    successMessage,
    reportError,
    isSubmitting,
    staffCanEditPremium,
    isAdmin,
  } = useAdminEditUserForm({ userId, currentUserId });

  useLayoutEffect(() => {
    navigation.setOptions({ title: ADMIN_EDIT_USER_UI.TITLE });
  }, [navigation]);

  if (!userId) {
    return <ScreenErrorState message={EDIT_PROFILE_UI.SAVE_ERROR} />;
  }

  if (profileQuery.isPending || !canAccess) {
    return <ScreenLoadingState message={EDIT_PROFILE_UI.TITLE} />;
  }

  if (profileQuery.isError || !user || !form) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(profileQuery.error, EDIT_PROFILE_UI.SAVE_ERROR)}
        onRetry={() => profileQuery.refetch()}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
      <ProfileAvatarUpload
        avatarUrl={form.userAvatarUrl}
        disabled={isSubmitting}
        onAvatarUrlChange={(url) => updateField("userAvatarUrl", url)}
        onError={reportError}
      />

      <Text style={[styles.labelStrong, { marginTop: 16 }]}>{EDIT_PROFILE_UI.LABEL_EMAIL}</Text>
      <TextInput
        style={[styles.input, styles.inputReadOnly]}
        value={typeof user.email === "string" ? user.email : ""}
        editable={false}
      />

      <Text style={[styles.labelStrong, { marginTop: 16 }]}>{EDIT_PROFILE_UI.LABEL_USERNAME}</Text>
      <Text style={styles.hint}>{EDIT_PROFILE_UI.USERNAME_HINT}</Text>
      <TextInput
        style={styles.input}
        value={form.userName}
        onChangeText={(value) => updateField("userName", value)}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
        placeholderTextColor={theme.colors.textMuted}
      />

      <Text style={[styles.labelStrong, { marginTop: 16 }]}>{EDIT_PROFILE_UI.LABEL_PHONE}</Text>
      <TextInput
        style={styles.input}
        value={form.userPhoneNumber}
        onChangeText={(value) => updateField("userPhoneNumber", limitRuPhoneInput(value))}
        keyboardType="phone-pad"
        editable={!isSubmitting}
        placeholderTextColor={theme.colors.textMuted}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{EDIT_PROFILE_UI.LABEL_NOTIFICATIONS}</Text>
        <Switch
          value={form.notificationsEnabled}
          onValueChange={(value) => updateField("notificationsEnabled", value)}
          disabled={isSubmitting}
        />
      </View>

      <Text style={[styles.labelStrong, { marginTop: 16 }]}>
        {ADMIN_EDIT_USER_UI.LABEL_LOYALTY_POINTS}
      </Text>
      <TextInput
        style={styles.input}
        value={form.userLoyaltyPoints}
        onChangeText={(value) => updateField("userLoyaltyPoints", value.replace(/\D/g, ""))}
        keyboardType="number-pad"
        editable={!isSubmitting}
        placeholderTextColor={theme.colors.textMuted}
      />

      <Text style={[styles.labelStrong, { marginTop: 16 }]}>{ADMIN_EDIT_USER_UI.SECTION_ADMIN}</Text>

      {isAdmin ? (
        <>
          <Text style={styles.label}>{ADMIN_EDIT_USER_UI.LABEL_ROLE}</Text>
          <AdminUserRolePicker
            value={form.userRole}
            onChange={(role) => updateField("userRole", role)}
            disabled={isSubmitting}
          />

          <Text style={[styles.labelStrong, { marginTop: 16 }]}>
            {ADMIN_EDIT_USER_UI.LABEL_DISCOUNT}
          </Text>
          <TextInput
            style={styles.input}
            value={form.userDiscountPercent}
            onChangeText={(value) => updateField("userDiscountPercent", value.replace(/\D/g, ""))}
            keyboardType="number-pad"
            maxLength={3}
            editable={!isSubmitting}
            placeholderTextColor={theme.colors.textMuted}
          />
        </>
      ) : null}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{ADMIN_EDIT_USER_UI.LABEL_USER_DATA_CONFIRMED}</Text>
        <Switch
          value={form.isUserDataConfirmed}
          onValueChange={(value) => updateField("isUserDataConfirmed", value)}
          disabled={isSubmitting}
        />
      </View>

      {staffCanEditPremium ? (
        <AdminPremiumStaffControl
          user={user as Record<string, unknown> & { _id: string }}
          premiumExpiresAt={form.premiumExpiresAt}
          onPremiumExpiresAtChange={(value) => updateField("premiumExpiresAt", value)}
          disabled={isSubmitting}
        />
      ) : null}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{ADMIN_EDIT_USER_UI.LABEL_ACCOUNT_ACTIVE}</Text>
        <Switch
          value={form.isActiveUser}
          onValueChange={(value) => updateField("isActiveUser", value)}
          disabled={isSubmitting}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{ADMIN_EDIT_USER_UI.LABEL_BLOCKED}</Text>
        <Switch
          value={form.isBlockedUser}
          onValueChange={(value) => updateField("isBlockedUser", value)}
          disabled={isSubmitting}
        />
      </View>

      <Text style={[styles.labelStrong, { marginTop: 16 }]}>Заметки</Text>
      <TextInput
        style={[styles.input, { minHeight: 96, textAlignVertical: "top" }]}
        value={form.notesAboutUser}
        onChangeText={(value) => updateField("notesAboutUser", value)}
        multiline
        editable={!isSubmitting}
        placeholderTextColor={theme.colors.textMuted}
      />

      {errorMessage ? <Text style={[styles.error, { marginTop: 16 }]}>{errorMessage}</Text> : null}
      {successMessage ? (
        <Text style={[styles.success, { marginTop: 16 }]}>{successMessage}</Text>
      ) : null}

      <AppButton
        label={EDIT_PROFILE_UI.SUBMIT}
        variant="contrast"
        onPress={() => void handleSubmit()}
        disabled={isSubmitting}
        style={styles.submitSpacer}
      />
    </ScrollView>
  );
};
