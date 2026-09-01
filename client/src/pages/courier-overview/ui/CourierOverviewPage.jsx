import { useEffect, useState } from "react";

import {
  useAcceptCourierShipmentMutation,
  useCourierOverviewQuery,
  useMyCourierDeliveriesQuery,
} from "../../../entities/courier/model/courierQueries.js";
import { COURIER_OVERVIEW_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

import { CourierDeliveryCard } from "./CourierDeliveryCard.jsx";
import { CourierOrderItem } from "./CourierOrderItem.jsx";
import { useCatalogProductDetailsOpener } from "../../../entities/product/lib/useCatalogProductDetailsOpener.js";

import "./CourierOverviewPage.css";

const TABS = [
  { id: "free", label: COURIER_OVERVIEW_UI.TAB_FREE },
  { id: "mine", label: COURIER_OVERVIEW_UI.TAB_MINE },
];

/**
 * «Обзор» — свободные отправления в регионе курьера и его активные доставки.
 *
 * Геолокация необязательна: она влияет только на порядок списка. Доступ к
 * заказам даёт регион из профиля, иначе курьер без разрешения на геолокацию
 * не увидел бы ничего.
 */
/** @param {{ onUserClick?: (userId: string) => void }} props */
export function CourierOverviewPage({ onUserClick }) {
  const { openCatalogProductById } = useCatalogProductDetailsOpener();
  const [tab, setTab] = useState("free");
  const [coords, setCoords] = useState(
    /** @type {{ lat: number; lon: number } | null} */ (null),
  );
  const [error, setError] = useState("");

  const overviewQuery = useCourierOverviewQuery({
    enabled: tab === "free",
    coords,
  });
  const deliveriesQuery = useMyCourierDeliveriesQuery({ enabled: tab === "mine" });
  const acceptMutation = useAcceptCourierShipmentMutation();

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }),
      // Отказ в геолокации — не ошибка: список просто отсортируется от адреса.
      () => setCoords(null),
      { timeout: 5000, maximumAge: 300_000 },
    );
  }, []);

  const handleAccept = async (row) => {
    setError("");
    try {
      await acceptMutation.mutateAsync({
        orderId: row.orderId,
        sellerId: row.sellerId,
      });
      setTab("mine");
    } catch (e) {
      setError(e instanceof Error ? e.message : COURIER_OVERVIEW_UI.ERROR_GENERIC);
    }
  };

  const activeQuery = tab === "free" ? overviewQuery : deliveriesQuery;
  const rows =
    tab === "free"
      ? (overviewQuery.data?.shipments ?? [])
      : (deliveriesQuery.data?.deliveries ?? []);

  return (
    <section className="courier-overview">
      <header className="courier-overview__header">
        <h2 className="courier-overview__title">{COURIER_OVERVIEW_UI.TITLE}</h2>
        <div className="courier-overview__tabs" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className="courier-overview__tab"
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {tab === "free" && overviewQuery.data?.regionCode ? (
          <p className="courier-overview__region">
            {COURIER_OVERVIEW_UI.REGION(
              overviewQuery.data.regionCode,
              overviewQuery.data.radiusKm,
            )}
            {coords ? "" : ` ${COURIER_OVERVIEW_UI.NO_GEO_HINT}`}
          </p>
        ) : null}
      </header>

      {error ? (
        <p className="courier-overview__error" role="alert">
          {error}
        </p>
      ) : null}

      {activeQuery.isPending ? (
        <p className="courier-overview__muted">{COURIER_OVERVIEW_UI.LOADING}</p>
      ) : activeQuery.isError ? (
        <p className="courier-overview__error" role="alert">
          {activeQuery.error instanceof Error
            ? activeQuery.error.message
            : COURIER_OVERVIEW_UI.ERROR_GENERIC}
        </p>
      ) : rows.length === 0 ? (
        <p className="courier-overview__muted">
          {tab === "free" ? COURIER_OVERVIEW_UI.EMPTY_FREE : COURIER_OVERVIEW_UI.EMPTY_MINE}
        </p>
      ) : tab === "free" ? (
        <ul className="courier-overview__list" role="list">
          {rows.map((row) => (
            <li key={`${row.orderId}:${row.sellerId}`} className="courier-overview__card">
              <div className="courier-overview__row">
                <span className="courier-overview__fee">
                  {formatPriceRub(row.deliveryFeeRub)}
                </span>
                {row.distanceKm != null ? (
                  <span className="courier-overview__distance">
                    {COURIER_OVERVIEW_UI.DISTANCE(row.distanceKm)}
                  </span>
                ) : null}
              </div>

              <dl className="courier-overview__meta">
                <div>
                  <dt>{COURIER_OVERVIEW_UI.SELLER}</dt>
                  <dd>
                    {onUserClick && row.sellerId ? (
                      <button
                        type="button"
                        className="courier-overview__person"
                        onClick={() => onUserClick(String(row.sellerId))}
                      >
                        {row.sellerName || "—"}
                      </button>
                    ) : (
                      row.sellerName || "—"
                    )}
                  </dd>
                </div>
                {row.buyerName ? (
                  <div>
                    <dt>{COURIER_OVERVIEW_UI.BUYER}</dt>
                    <dd>
                      {onUserClick && row.buyerId ? (
                        <button
                          type="button"
                          className="courier-overview__person"
                          onClick={() => onUserClick(String(row.buyerId))}
                        >
                          {row.buyerName}
                        </button>
                      ) : (
                        row.buyerName
                      )}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt>{COURIER_OVERVIEW_UI.PICKUP}</dt>
                  <dd>{row.pickupAddress || "—"}</dd>
                </div>
                <div>
                  <dt>{COURIER_OVERVIEW_UI.DROPOFF}</dt>
                  <dd>{row.deliveryAreaHint || "—"}</dd>
                </div>
              </dl>

              <ul className="courier-overview__items" role="list">
                {row.items.map((item, index) => (
                  <CourierOrderItem
                    key={`${item.name}-${index}`}
                    item={item}
                    onProductClick={openCatalogProductById}
                  />
                ))}
              </ul>

              <button
                type="button"
                className="courier-overview__accept"
                onClick={() => handleAccept(row)}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending
                  ? COURIER_OVERVIEW_UI.SAVING
                  : COURIER_OVERVIEW_UI.ACCEPT}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="courier-overview__list" role="list">
          {rows.map((row) => (
            <CourierDeliveryCard
              key={`${row.orderId}:${row.sellerId}`}
              delivery={row}
              onUserClick={onUserClick}
              onProductClick={openCatalogProductById}
              onError={setError}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
