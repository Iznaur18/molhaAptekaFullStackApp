import { useState } from "react";

import {
  useStaffShippingCarriersQuery,
  useToggleShippingCarrierMutation,
} from "../../../entities/shipping/model/shippingCarrierQueries.js";
import { SHIPPING_CARRIERS_ADMIN_UI } from "../../../shared/config/appUiCopy.js";
import { ConfirmButton } from "../../../shared/ui/ConfirmButton/ConfirmButton.jsx";

import "./ShippingCarriersPage.css";

/**
 * Какие службы доставки предлагать продавцам и покупателям.
 *
 * Раньше это были константы в коде, и выключить службу при аварии можно было
 * только деплоем.
 */
export function ShippingCarriersPage() {
  const [rowError, setRowError] = useState(/** @type {Record<string, string>} */ ({}));
  const [pendingId, setPendingId] = useState(/** @type {string | null} */ (null));

  const carriersQuery = useStaffShippingCarriersQuery();
  const toggleMutation = useToggleShippingCarrierMutation();

  const carriers = carriersQuery.data ?? [];

  /** @param {Record<string, any>} row */
  const handleToggle = async (row) => {
    setPendingId(row.carrierId);
    setRowError((prev) => ({ ...prev, [row.carrierId]: "" }));
    try {
      await toggleMutation.mutateAsync({
        carrierId: row.carrierId,
        enabled: !row.enabled,
      });
    } catch (e) {
      setRowError((prev) => ({
        ...prev,
        [row.carrierId]:
          e instanceof Error ? e.message : SHIPPING_CARRIERS_ADMIN_UI.ERROR_GENERIC,
      }));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section className="shipping-carriers">
      <header className="shipping-carriers__header">
        <h2 className="shipping-carriers__title">
          {SHIPPING_CARRIERS_ADMIN_UI.TITLE}
        </h2>
        <p className="shipping-carriers__intro">{SHIPPING_CARRIERS_ADMIN_UI.INTRO}</p>
      </header>

      {carriersQuery.isPending ? (
        <p className="shipping-carriers__muted">{SHIPPING_CARRIERS_ADMIN_UI.LOADING}</p>
      ) : carriersQuery.isError ? (
        <p className="shipping-carriers__error" role="alert">
          {carriersQuery.error instanceof Error
            ? carriersQuery.error.message
            : SHIPPING_CARRIERS_ADMIN_UI.ERROR_GENERIC}
        </p>
      ) : carriers.length === 0 ? (
        <p className="shipping-carriers__muted">{SHIPPING_CARRIERS_ADMIN_UI.EMPTY}</p>
      ) : (
        <ul className="shipping-carriers__list" role="list">
          {carriers.map((row) => {
            const isRowPending = pendingId === row.carrierId;
            return (
              <li key={row.carrierId} className="shipping-carriers__card">
                <div className="shipping-carriers__row">
                  <span className="shipping-carriers__name">{row.label}</span>
                  <span
                    className={[
                      "shipping-carriers__state",
                      row.enabled ? "shipping-carriers__state_on" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {row.enabled
                      ? SHIPPING_CARRIERS_ADMIN_UI.STATE_ON
                      : SHIPPING_CARRIERS_ADMIN_UI.STATE_OFF}
                  </span>
                </div>

                <p className="shipping-carriers__regions">
                  {row.regions?.length
                    ? SHIPPING_CARRIERS_ADMIN_UI.REGIONS(row.regions)
                    : SHIPPING_CARRIERS_ADMIN_UI.REGIONS_ALL}
                </p>

                {/* Ненастроенную включать нечем: кнопка соврала бы. */}
                {row.configured ? (
                  <ConfirmButton
                    className="shipping-carriers__toggle"
                    label={
                      row.enabled
                        ? SHIPPING_CARRIERS_ADMIN_UI.ACTION_DISABLE
                        : SHIPPING_CARRIERS_ADMIN_UI.ACTION_ENABLE
                    }
                    pendingLabel={SHIPPING_CARRIERS_ADMIN_UI.SAVING}
                    isPending={isRowPending}
                    question={
                      row.enabled
                        ? `Выключить «${row.label}»? Продавцы перестанут её выбирать.`
                        : `Включить «${row.label}»?`
                    }
                    onConfirm={() => handleToggle(row)}
                    disabled={isRowPending}
                  />
                ) : (
                  <p className="shipping-carriers__muted">
                    {SHIPPING_CARRIERS_ADMIN_UI.NOT_CONFIGURED}
                  </p>
                )}

                {rowError[row.carrierId] ? (
                  <p className="shipping-carriers__error" role="alert">
                    {rowError[row.carrierId]}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
