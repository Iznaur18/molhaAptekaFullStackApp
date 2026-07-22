import { USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH } from "@molha/api-contract";
import { useEffect, useState } from "react";

import { usePatchUsersLoyaltyRaffleSettingsMutation } from "../../../entities/users-loyalty-raffle/model/usePatchUsersLoyaltyRaffleSettingsMutation.js";
import { useUsersLoyaltyRaffleSettingsQuery } from "../../../entities/users-loyalty-raffle/model/useUsersLoyaltyRaffleSettingsQuery.js";
import { USERS_LOYALTY_RAFFLE_ADMIN_UI } from "../../../shared/config/appUiCopy.js";

import "./UsersLoyaltyRaffleAdminPanel.css";

export function UsersLoyaltyRaffleAdminPanel() {
  const settingsQuery = useUsersLoyaltyRaffleSettingsQuery();
  const patchMutation = usePatchUsersLoyaltyRaffleSettingsMutation();
  const [description, setDescription] = useState("");
  const [goalText, setGoalText] = useState("");
  const [formError, setFormError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }
    setDescription(settingsQuery.data.description ?? "");
    setGoalText(String(settingsQuery.data.goal ?? ""));
  }, [settingsQuery.data]);

  if (settingsQuery.isPending && !settingsQuery.data) {
    return <p className="users-loyalty-raffle-admin__state">{USERS_LOYALTY_RAFFLE_ADMIN_UI.LOADING}</p>;
  }

  if (settingsQuery.isError && !settingsQuery.data) {
    return (
      <p className="users-loyalty-raffle-admin__state users-loyalty-raffle-admin__state_error" role="alert">
        {settingsQuery.error instanceof Error
          ? settingsQuery.error.message
          : USERS_LOYALTY_RAFFLE_ADMIN_UI.LOADING}
      </p>
    );
  }

  const handleSave = async () => {
    setFormError("");
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
      setFormError(error instanceof Error ? error.message : "Не удалось сохранить");
    }
  };

  return (
    <section className="users-loyalty-raffle-admin">
      <h3 className="users-loyalty-raffle-admin__title">{USERS_LOYALTY_RAFFLE_ADMIN_UI.TITLE}</h3>

      <label className="users-loyalty-raffle-admin__label" htmlFor="users-loyalty-raffle-description">
        {USERS_LOYALTY_RAFFLE_ADMIN_UI.DESCRIPTION_LABEL}
      </label>
      <textarea
        id="users-loyalty-raffle-description"
        className="users-loyalty-raffle-admin__textarea"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder={USERS_LOYALTY_RAFFLE_ADMIN_UI.DESCRIPTION_PLACEHOLDER}
        maxLength={USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH}
        rows={5}
      />

      <label className="users-loyalty-raffle-admin__label" htmlFor="users-loyalty-raffle-goal">
        {USERS_LOYALTY_RAFFLE_ADMIN_UI.GOAL_LABEL}
      </label>
      <input
        id="users-loyalty-raffle-goal"
        className="users-loyalty-raffle-admin__input"
        type="number"
        min={1}
        step={1}
        value={goalText}
        onChange={(event) => setGoalText(event.target.value)}
      />

      {formError ? (
        <p className="users-loyalty-raffle-admin__error" role="alert">
          {formError}
        </p>
      ) : null}
      {savedFlash ? (
        <p className="users-loyalty-raffle-admin__success">{USERS_LOYALTY_RAFFLE_ADMIN_UI.SAVED}</p>
      ) : null}

      <button
        type="button"
        className="users-loyalty-raffle-admin__save"
        disabled={patchMutation.isPending}
        onClick={() => {
          void handleSave();
        }}
      >
        {patchMutation.isPending
          ? USERS_LOYALTY_RAFFLE_ADMIN_UI.SAVING
          : USERS_LOYALTY_RAFFLE_ADMIN_UI.SAVE}
      </button>
    </section>
  );
}
