import { useEffect, useState } from "react";

import {
  useMyCourierProfileQuery,
  useSubmitCourierApplicationMutation,
} from "../../../entities/courier/model/courierQueries.js";
import { COURIER_UI } from "../../../shared/config/appUiCopy.js";
import { CourierDocumentField } from "./CourierDocumentField.jsx";

import "./CourierApplicationPage.css";

const STATUS_LABEL = {
  none: COURIER_UI.STATUS_NONE,
  pending: COURIER_UI.STATUS_PENDING,
  approved: COURIER_UI.STATUS_APPROVED,
  rejected: COURIER_UI.STATUS_REJECTED,
};

/**
 * Заявка курьера живёт в обычном профиле: отдельного кабинета у курьера нет,
 * он остаётся тем же пользователем, просто подтверждённым.
 */
export function CourierApplicationPage() {
  const profileQuery = useMyCourierProfileQuery();
  const submitMutation = useSubmitCourierApplicationMutation();

  const [form, setForm] = useState({
    vehicleMake: "",
    vehicleColor: "",
    vehiclePlate: "",
    vehiclePhotoFrontUrl: "",
    vehiclePhotoRearUrl: "",
    driverLicensePhotoUrl: "",
    vehicleRegistrationPhotoUrl: "",
  });
  const [error, setError] = useState("");

  const profile = profileQuery.data;
  const status = profile?.moderationStatus ?? "none";
  const isPending = status === "pending";

  // Переподача после отказа начинается с прежних данных: чаще всего править
  // надо одно поле, а не вводить всё заново.
  useEffect(() => {
    if (!profile) return;
    setForm({
      vehicleMake: profile.vehicleMake ?? "",
      vehicleColor: profile.vehicleColor ?? "",
      vehiclePlate: profile.vehiclePlate ?? "",
      vehiclePhotoFrontUrl: profile.vehiclePhotoFrontUrl ?? "",
      vehiclePhotoRearUrl: profile.vehiclePhotoRearUrl ?? "",
      driverLicensePhotoUrl: profile.driverLicensePhotoUrl ?? "",
      vehicleRegistrationPhotoUrl: profile.vehicleRegistrationPhotoUrl ?? "",
    });
  }, [profile]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePhoto = (field) => (url) => {
    setForm((prev) => ({ ...prev, [field]: url }));
  };

  const DOCUMENT_FIELDS = [
    { field: "vehiclePhotoFrontUrl", label: COURIER_UI.FIELD_PHOTO_FRONT },
    { field: "vehiclePhotoRearUrl", label: COURIER_UI.FIELD_PHOTO_REAR },
    { field: "driverLicensePhotoUrl", label: COURIER_UI.FIELD_PHOTO_LICENSE },
    {
      field: "vehicleRegistrationPhotoUrl",
      label: COURIER_UI.FIELD_PHOTO_REGISTRATION,
    },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await submitMutation.mutateAsync(form);
    } catch (e) {
      setError(e instanceof Error ? e.message : COURIER_UI.ERROR_GENERIC);
    }
  };

  if (profileQuery.isPending) {
    return <p className="courier-page__loading">{COURIER_UI.LOADING}</p>;
  }

  if (profileQuery.isError) {
    return (
      <p className="courier-page__error" role="alert">
        {profileQuery.error instanceof Error
          ? profileQuery.error.message
          : COURIER_UI.ERROR_GENERIC}
      </p>
    );
  }

  const hasAllDocuments = DOCUMENT_FIELDS.every(({ field }) =>
    Boolean(form[field]),
  );
  const canSubmit =
    !isPending &&
    hasAllDocuments &&
    form.vehicleMake.trim().length >= 2 &&
    form.vehicleColor.trim().length >= 2 &&
    form.vehiclePlate.trim().length >= 5;

  return (
    <section className="courier-page">
      <header className="courier-page__header">
        <h2 className="courier-page__title">{COURIER_UI.TITLE}</h2>
        <span className={`courier-page__status courier-page__status--${status}`}>
          {STATUS_LABEL[status]}
        </span>
      </header>

      <p className="courier-page__intro">{COURIER_UI.INTRO}</p>

      {profile?.hasAddress === false ? (
        <p className="courier-page__warning" role="alert">
          {COURIER_UI.ADDRESS_REQUIRED}
        </p>
      ) : null}

      {status === "approved" ? (
        <p className="courier-page__approved">
          {COURIER_UI.APPROVED_HINT}
          {profile?.addressCity ? ` ${COURIER_UI.REGION(profile.addressCity)}` : ""}
        </p>
      ) : null}

      {status === "rejected" && profile?.moderationComment ? (
        <p className="courier-page__rejection" role="alert">
          {COURIER_UI.REJECTION_REASON}: {profile.moderationComment}
        </p>
      ) : null}

      <form className="courier-page__form" onSubmit={handleSubmit}>
        <label className="courier-page__field">
          <span>{COURIER_UI.FIELD_MAKE}</span>
          <input
            type="text"
            value={form.vehicleMake}
            onChange={handleChange("vehicleMake")}
            placeholder={COURIER_UI.PLACEHOLDER_MAKE}
            disabled={isPending || submitMutation.isPending}
            maxLength={60}
          />
        </label>

        <label className="courier-page__field">
          <span>{COURIER_UI.FIELD_COLOR}</span>
          <input
            type="text"
            value={form.vehicleColor}
            onChange={handleChange("vehicleColor")}
            placeholder={COURIER_UI.PLACEHOLDER_COLOR}
            disabled={isPending || submitMutation.isPending}
            maxLength={30}
          />
        </label>

        <label className="courier-page__field">
          <span>{COURIER_UI.FIELD_PLATE}</span>
          <input
            type="text"
            value={form.vehiclePlate}
            onChange={handleChange("vehiclePlate")}
            placeholder={COURIER_UI.PLACEHOLDER_PLATE}
            disabled={isPending || submitMutation.isPending}
            maxLength={15}
          />
        </label>

        <fieldset className="courier-page__docs">
          <legend className="courier-page__docs-heading">
            {COURIER_UI.DOCS_HEADING}
          </legend>
          <p className="courier-page__docs-hint">{COURIER_UI.DOCS_HINT}</p>

          <div className="courier-page__docs-grid">
            {DOCUMENT_FIELDS.map(({ field, label }) => (
              <CourierDocumentField
                key={field}
                label={label}
                value={form[field]}
                disabled={isPending || submitMutation.isPending}
                onChange={handlePhoto(field)}
                onError={setError}
              />
            ))}
          </div>

          {!hasAllDocuments && !isPending ? (
            <p className="courier-page__docs-required">
              {COURIER_UI.PHOTO_REQUIRED}
            </p>
          ) : null}
        </fieldset>

        {error ? (
          <p className="courier-page__error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="courier-page__submit"
          disabled={!canSubmit || submitMutation.isPending}
        >
          {submitMutation.isPending
            ? COURIER_UI.SUBMITTING
            : status === "rejected"
              ? COURIER_UI.RESUBMIT
              : COURIER_UI.SUBMIT}
        </button>

        {isPending ? (
          <p className="courier-page__hint">{COURIER_UI.PENDING_HINT}</p>
        ) : null}
      </form>

      <p className="courier-page__privacy">{COURIER_UI.PRIVACY_NOTE}</p>
    </section>
  );
}
