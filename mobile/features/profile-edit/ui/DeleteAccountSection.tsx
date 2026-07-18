import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { useDeleteAccountMutation } from "@/entities/user/model/useDeleteAccountMutation";
import { DELETE_ACCOUNT_UI } from "@/shared/config";
import { useEditProfileFormStyles } from "@/shared/theme/editProfileFormStyles";
import { AppButton } from "@/shared/ui/AppButton";

type DeleteAccountSectionProps = {
  userId: string;
};

/**
 * Самоудаление аккаунта прямо в приложении — требование App Store 5.1.1(v)
 * и Google Play. Состав удаляемых и сохраняемых данных раскрыт до нажатия,
 * подтверждение раскрывается по месту (как подтверждение выхода).
 */
export const DeleteAccountSection = ({ userId }: DeleteAccountSectionProps) => {
  const router = useRouter();
  const styles = useEditProfileFormStyles();
  const deleteAccountMutation = useDeleteAccountMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isPending = deleteAccountMutation.isPending;

  const handleDelete = async () => {
    try {
      await deleteAccountMutation.mutateAsync(userId);
      setConfirmOpen(false);
      router.replace("/");
    } catch {
      // сообщение рендерится ниже из deleteAccountMutation.error
    }
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionAccent, styles.dangerAccent]} />
        <Text style={[styles.sectionTitle, styles.dangerTitle]}>
          {DELETE_ACCOUNT_UI.SECTION}
        </Text>
      </View>

      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.dangerText}>{DELETE_ACCOUNT_UI.INTRO}</Text>

        <View style={styles.dangerGroup}>
          <Text style={styles.dangerListTitle}>{DELETE_ACCOUNT_UI.REMOVED_TITLE}</Text>
          {DELETE_ACCOUNT_UI.REMOVED_ITEMS.map((item) => (
            <Text key={item} style={styles.dangerListItem}>
              {`•  ${item}`}
            </Text>
          ))}
        </View>

        <View style={styles.dangerGroup}>
          <Text style={styles.dangerListTitle}>{DELETE_ACCOUNT_UI.KEPT_TITLE}</Text>
          {DELETE_ACCOUNT_UI.KEPT_ITEMS.map((item) => (
            <Text key={item} style={styles.dangerListItem}>
              {`•  ${item}`}
            </Text>
          ))}
        </View>

        {deleteAccountMutation.isError ? (
          <Text style={[styles.feedback, styles.feedbackError]}>
            {deleteAccountMutation.error instanceof Error
              ? deleteAccountMutation.error.message
              : DELETE_ACCOUNT_UI.FALLBACK_ERROR}
          </Text>
        ) : null}

        {!confirmOpen ? (
          <AppButton
            label={DELETE_ACCOUNT_UI.BUTTON}
            variant="danger"
            onPress={() => setConfirmOpen(true)}
            disabled={isPending}
          />
        ) : (
          <>
            <Text style={styles.dangerListTitle}>
              {DELETE_ACCOUNT_UI.CONFIRM_QUESTION}
            </Text>
            <View style={styles.dangerActions}>
              <View style={styles.dangerActionItem}>
                <AppButton
                  label={DELETE_ACCOUNT_UI.CONFIRM_YES}
                  variant="danger"
                  onPress={() => void handleDelete()}
                  disabled={isPending}
                />
              </View>
              <View style={styles.dangerActionItem}>
                <AppButton
                  label={DELETE_ACCOUNT_UI.CONFIRM_CANCEL}
                  variant="secondary"
                  onPress={() => setConfirmOpen(false)}
                  disabled={isPending}
                />
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};
