import { useId, useState } from "react";
import {
  SHIPPING_CARRIER_INFO_COVERAGE_MAX_LENGTH,
  SHIPPING_CARRIER_INFO_DESCRIPTION_MAX_LENGTH,
  SHIPPING_CARRIER_INFO_FIELDS,
  SHIPPING_CARRIER_INFO_PHONE_MAX_LENGTH,
  SHIPPING_CARRIER_INFO_WEBSITE_MAX_LENGTH,
  SHIPPING_CARRIER_INFO_WORK_HOURS_MAX_LENGTH,
  hasShippingCarrierInfo,
  shippingCarrierInfoBodySchema,
} from "@molha/api-contract";

import { useSaveShippingCarrierInfoMutation } from "../../../entities/shipping/model/shippingCarrierQueries.js";
import {
  SHIPPING_CARRIERS_ADMIN_UI,
  SHIPPING_CARRIER_INFO_UI,
} from "../../../shared/config/appUiCopy.js";

const MAX_LENGTH = {
  description: SHIPPING_CARRIER_INFO_DESCRIPTION_MAX_LENGTH,
  workHours: SHIPPING_CARRIER_INFO_WORK_HOURS_MAX_LENGTH,
  coverage: SHIPPING_CARRIER_INFO_COVERAGE_MAX_LENGTH,
  phone: SHIPPING_CARRIER_INFO_PHONE_MAX_LENGTH,
  website: SHIPPING_CARRIER_INFO_WEBSITE_MAX_LENGTH,
};

const INPUT_TYPE = { phone: "tel", website: "url" };

/** @param {Record<string, string>} row */
const pickFields = (row) =>
  Object.fromEntries(
    SHIPPING_CARRIER_INFO_FIELDS.map((field) => [field, String(row?.[field] ?? "")]),
  );

/**
 * Справка одной службы доставки: то, что покупатель и продавец увидят по «!».
 *
 * @param {{ row: Record<string, string> }} props
 */
export function ShippingCarrierInfoForm({ row }) {
  const formId = useId();
  const saveMutation = useSaveShippingCarrierInfoMutation();
  const [form, setForm] = useState(() => pickFields(row));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaved(false);
    const parsed = shippingCarrierInfoBodySchema.safeParse(form);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? SHIPPING_CARRIERS_ADMIN_UI.ERROR_GENERIC,
      );
      return;
    }
    setError("");
    try {
      await saveMutation.mutateAsync({ carrierId: row.carrierId, info: parsed.data });
      setForm(pickFields(parsed.data));
      setSaved(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : SHIPPING_CARRIERS_ADMIN_UI.ERROR_GENERIC,
      );
    }
  };

  return (
    <li className="shipping-carriers__card">
      <div className="shipping-carriers__row">
        <span className="shipping-carriers__name">{row.label}</span>
        <span
          className={[
            "shipping-carriers__state",
            hasShippingCarrierInfo(row) ? "shipping-carriers__state_on" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {hasShippingCarrierInfo(row)
            ? SHIPPING_CARRIERS_ADMIN_UI.INFO_FILLED
            : SHIPPING_CARRIERS_ADMIN_UI.INFO_EMPTY}
        </span>
      </div>

      <form className="shipping-carriers__info-form" onSubmit={handleSubmit}>
        {SHIPPING_CARRIER_INFO_FIELDS.map((field) => {
          const inputId = `${formId}-${field}`;
          const shared = {
            id: inputId,
            className: "shipping-carriers__input",
            value: form[field],
            maxLength: MAX_LENGTH[field],
            placeholder: SHIPPING_CARRIER_INFO_UI.FIELD_PLACEHOLDERS[field],
            onChange: (event) => {
              setSaved(false);
              setForm((prev) => ({ ...prev, [field]: event.target.value }));
            },
          };
          return (
            <label key={field} className="shipping-carriers__field" htmlFor={inputId}>
              <span className="shipping-carriers__field-label">
                {SHIPPING_CARRIER_INFO_UI.FIELD_LABELS[field]}
              </span>
              {field === "description" ? (
                <textarea {...shared} rows={3} />
              ) : (
                <input {...shared} type={INPUT_TYPE[field] ?? "text"} />
              )}
            </label>
          );
        })}

        <div className="shipping-carriers__info-actions">
          <button
            type="submit"
            className="shipping-carriers__toggle"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending
              ? SHIPPING_CARRIERS_ADMIN_UI.SAVING
              : SHIPPING_CARRIERS_ADMIN_UI.INFO_SAVE}
          </button>
          {saved ? (
            <span className="shipping-carriers__state shipping-carriers__state_on">
              {SHIPPING_CARRIERS_ADMIN_UI.INFO_SAVED}
            </span>
          ) : null}
        </div>

        {error ? (
          <p className="shipping-carriers__error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </li>
  );
}
