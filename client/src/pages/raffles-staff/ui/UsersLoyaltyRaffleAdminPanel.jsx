import { USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH } from "@molha/api-contract";
import { useEffect, useState } from "react";

import { usePatchUsersLoyaltyRaffleSettingsMutation } from "../../../entities/users-loyalty-raffle/model/usePatchUsersLoyaltyRaffleSettingsMutation.js";
import { useResetUsersLoyaltyRaffleProgressMutation } from "../../../entities/users-loyalty-raffle/model/useResetUsersLoyaltyRaffleProgressMutation.js";
import { useUsersLoyaltyRaffleSettingsQuery } from "../../../entities/users-loyalty-raffle/model/useUsersLoyaltyRaffleSettingsQuery.js";
import { USERS_LOYALTY_RAFFLE_ADMIN_UI } from "../../../shared/config/appUiCopy.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";

import "./UsersLoyaltyRaffleAdminPanel.css";

export function UsersLoyaltyRaffleAdminPanel() {
  const settingsQuery = useUsersLoyaltyRaffleSettingsQuery();
  const patchMutation = usePatchUsersLoyaltyRaffleSettingsMutation();
  const resetMutation = useResetUsersLoyaltyRaffleProgressMutation();
  const [description, setDescription] = useState("");
  const [donationImageUrl, setDonationImageUrl] = useState("");
  const [goalText, setGoalText] = useState("");
  const [formError, setFormError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [resetFlash, setResetFlash] = useState(false);

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }
    setDescription(settingsQuery.data.description ?? "");
    setDonationImageUrl(settingsQuery.data.donationImageUrl ?? "");
    setGoalText(String(settingsQuery.data.goal ?? ""));
  }, [settingsQuery.data]);

  if (settingsQuery.isPending && !settingsQuery.data) {
    return (
      <p className="users-loyalty-raffle-admin__state">
        {USERS_LOYALTY_RAFFLE_ADMIN_UI.LOADING}
      </p>
    );
  }

  if (settingsQuery.isError && !settingsQuery.data) {
    return (
      <p
        className="users-loyalty-raffle-admin__state users-loyalty-raffle-admin__state_error"
        role="alert"
      >
        {settingsQuery.error instanceof Error
          ? settingsQuery.error.message
          : USERS_LOYALTY_RAFFLE_ADMIN_UI.LOADING}
      </p>
    );
  }

  const handleSave = async () => {
    setFormError("");
    setSavedFlash(false);
    setResetFlash(false);
    const goal = Math.floor(Number(goalText));
    if (!Number.isFinite(goal) || goal < 1) {
      setFormError("Укажите цель баллов (целое число ≥ 1)");
      return;
    }

    try {
      await patchMutation.mutateAsync({
        description: description
          .trim()
          .slice(0, USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH),
        donationImageUrl: donationImageUrl.trim(),
        goal,
      });
      setSavedFlash(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Не удалось сохранить");
    }
  };

  const handleResetProgress = async () => {
    setFormError("");
    setSavedFlash(false);
    setResetFlash(false);
    if (!window.confirm(USERS_LOYALTY_RAFFLE_ADMIN_UI.RESET_PROGRESS_CONFIRM)) {
      return;
    }
    try {
      await resetMutation.mutateAsync();
      setResetFlash(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : USERS_LOYALTY_RAFFLE_ADMIN_UI.RESET_PROGRESS_ERROR,
      );
    }
  };

  return (
    <section className="users-loyalty-raffle-admin">
      <h3 className="users-loyalty-raffle-admin__title">
        {USERS_LOYALTY_RAFFLE_ADMIN_UI.TITLE}
      </h3>

      <label
        className="users-loyalty-raffle-admin__label"
        htmlFor="users-loyalty-raffle-description"
      >
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

      <label className="users-loyalty-raffle-admin__label" htmlFor="users-loyalty-raffle-image">
        {USERS_LOYALTY_RAFFLE_ADMIN_UI.DONATION_IMAGE_LABEL}
      </label>
      <ImageUrlField
        id="users-loyalty-raffle-image"
        value={donationImageUrl}
        onChange={setDonationImageUrl}
        disabled={patchMutation.isPending || resetMutation.isPending}
      />

      <label
        className="users-loyalty-raffle-admin__label"
        htmlFor="users-loyalty-raffle-goal"
      >
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
        <p className="users-loyalty-raffle-admin__success" role="status">
          {USERS_LOYALTY_RAFFLE_ADMIN_UI.SAVED}
        </p>
      ) : null}
      {resetFlash ? (
        <p className="users-loyalty-raffle-admin__success" role="status">
          {USERS_LOYALTY_RAFFLE_ADMIN_UI.RESET_PROGRESS_DONE}
        </p>
      ) : null}

      <div className="users-loyalty-raffle-admin__actions">
        <button
          type="button"
          className="users-loyalty-raffle-admin__save"
          disabled={patchMutation.isPending || resetMutation.isPending}
          onClick={() => {
            void handleSave();
          }}
        >
          {patchMutation.isPending
            ? USERS_LOYALTY_RAFFLE_ADMIN_UI.SAVING
            : USERS_LOYALTY_RAFFLE_ADMIN_UI.SAVE}
        </button>
        <button
          type="button"
          className="users-loyalty-raffle-admin__reset"
          disabled={patchMutation.isPending || resetMutation.isPending}
          onClick={() => {
            void handleResetProgress();
          }}
        >
          {resetMutation.isPending
            ? USERS_LOYALTY_RAFFLE_ADMIN_UI.RESET_PROGRESS_PENDING
            : USERS_LOYALTY_RAFFLE_ADMIN_UI.RESET_PROGRESS}
        </button>
      </div>
    </section>
  );
}
