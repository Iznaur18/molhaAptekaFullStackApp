import { USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH } from "@molha/api-contract";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

import {
  usePatchUsersLoyaltyRaffleSettingsMutation,
  useUsersLoyaltyRaffleSettingsQuery,
} from "@/entities/users-loyalty-raffle/model/useUsersLoyaltyRaffleSettings";
import { USERS_LOYALTY_RAFFLE_ADMIN_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useUsersLoyaltyRaffleAdminStyles } from "@/shared/theme/usersLoyaltyRaffleAdminStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const UsersLoyaltyRaffleAdminPanel = () => {
  const styles = useUsersLoyaltyRaffleAdminStyles();
  const settingsQuery = useUsersLoyaltyRaffleSettingsQuery();
  const patchMutation = usePatchUsersLoyaltyRaffleSettingsMutation();
  const [description, setDescription] = useState("");
  const [goalText, setGoalText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }
    setDescription(settingsQuery.data.description);
    setGoalText(String(settingsQuery.data.goal));
  }, [settingsQuery.data]);

  if (settingsQuery.isPending && settingsQuery.data == null) {
    return <ScreenLoadingState message={USERS_LOYALTY_RAFFLE_ADMIN_UI.LOADING} />;
  }

  if (settingsQuery.isError && settingsQuery.data == null) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          settingsQuery.error,
          USERS_LOYALTY_RAFFLE_ADMIN_UI.LOADING,
        )}
        onRetry={() => settingsQuery.refetch()}
      />
    );
  }

  const handleSave = async () => {
    setFormError(null);
    setSavedFlash(false);
    const goal = Math.floor(Number(goalText));
    if (!Number.isFinite(goal) || goal < 1) {
      setFormError("Укажите цель баллов (целое число ≥ 1)");
      return;
    }

    try {
      await patchMutation.mutateAsync({
        description: description.trim().slice(0, USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH),
        goal,
      });
      setSavedFlash(true);
    } catch (error) {
      setFormError(formatApiErrorMessage(error, "Не удалось сохранить"));
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{USERS_LOYALTY_RAFFLE_ADMIN_UI.TITLE}</Text>

      <Text style={styles.label}>{USERS_LOYALTY_RAFFLE_ADMIN_UI.DESCRIPTION_LABEL}</Text>
      <TextInput
        style={styles.textarea}
        value={description}
        onChangeText={setDescription}
        placeholder={USERS_LOYALTY_RAFFLE_ADMIN_UI.DESCRIPTION_PLACEHOLDER}
        multiline
        maxLength={USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH}
        textAlignVertical="top"
      />

      <Text style={styles.label}>{USERS_LOYALTY_RAFFLE_ADMIN_UI.GOAL_LABEL}</Text>
      <TextInput
        style={styles.input}
        value={goalText}
        onChangeText={setGoalText}
        keyboardType="number-pad"
      />

      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      {savedFlash ? <Text style={styles.success}>{USERS_LOYALTY_RAFFLE_ADMIN_UI.SAVED}</Text> : null}

      <AppButton
        label={
          patchMutation.isPending
            ? USERS_LOYALTY_RAFFLE_ADMIN_UI.SAVING
            : USERS_LOYALTY_RAFFLE_ADMIN_UI.SAVE
        }
        variant="primary"
        disabled={patchMutation.isPending}
        onPress={() => {
          void handleSave();
        }}
      />
    </View>
  );
};
