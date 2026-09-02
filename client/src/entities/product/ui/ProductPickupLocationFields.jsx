import { useEffect, useMemo, useRef, useState } from "react";
import {
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
  SHIPPING_PROVIDER_LABEL_RU,
  SHIPPING_PROVIDERS,
} from "@molha/api-contract";

import { AddressDeliveryFields } from "../../address/ui/AddressDeliveryFields.jsx";
import {
  createPickupLocationFromSaved,
  ensureSingleDefaultProductPickupLocation,
  findCustomPickupLocations,
  hasValidPickupGeo,
  isSavedAddressInPickupLocations,
  areProductPickupLocationListsEqual,
  pickupAddressValueFromLocation,
  pruneProductPickupLocationsToSelection,
  PRODUCT_PICKUP_LOCATIONS_MAX,
  removePickupLocationByAddressLine,
  resolvePickupGeoForSavedAddress,
  savedAddressPickupLine,
  selectedProfileAddressIdsFromLocations,
} from "../lib/productPickupLocationsForm.js";
import { PRODUCT_PICKUP_UI } from "../../../shared/config/appUiCopy.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";
import { USER_SAVED_ADDRESSES_UI } from "../../../shared/config/appUiCopy.js";

import "../../address/ui/SavedAddressPicker.css";
import "./ProductPickupLocationFields.css";
import "./create-product-sections/CreateProductSections.css";
import {
  PRODUCT_DELIVERY_CARRIER_GITORG,
  PRODUCT_DELIVERY_CARRIER_LABEL_RU,
  PRODUCT_DELIVERY_CARRIER_LOBO,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  buildLegacyDeliveryFlags,
  productShipsToBuyer,
  listDeliveryCarriersForRegion,
  resolveProductDeliveryCarrier,
} from "@molha/api-contract";

const EMPTY_INLINE_ADDRESS = {
  line: "",
  flat: "",
  fiasId: "",
  geo: null,
  regionCode: null,
  selectedFromSuggest: false,
};

/**
 * @param {Array<{ id?: string }>} profileAddresses
 * @param {Set<string>} selectedProfileIds
 */
function buildSelectedProfileIdSet(profileAddresses, selectedProfileIds) {
  return new Set(
    profileAddresses
      .map((item) => String(item.id ?? ""))
      .filter((id) => id && selectedProfileIds.has(id)),
  );
}

/**
 * @param {{
 *   locations: import('../lib/productPickupLocationsForm.js').ProductPickupLocationFormValue[];
 *   pickupEnabled?: boolean;
 *   deliveryEnabled: boolean;
 *   courierDeliveryEnabled?: boolean;
 *   disabled?: boolean;
 *   savedAddresses?: Array<{
 *     id: string;
 *     label?: string;
 *     line: string;
 *     flat?: string;
 *     geo?: { lat: number; lon: number } | null;
 *     isDefault?: boolean;
 *   }>;
 *   onChange: (next: {
 *     productPickupLocations: import('../lib/productPickupLocationsForm.js').ProductPickupLocationFormValue[];
 *     productPickupEnabled: boolean;
 *     productDeliveryEnabled: boolean;
 *     productRegionCode?: string | null;
 *   }) => void;
 * }} props
 */
export function ProductPickupLocationFields({
  locations = [],
  pickupEnabled = true,
  deliveryEnabled,
  courierDeliveryEnabled = false,
  productDeliveryCarrier = "",
  productRegionCode = "",
  sellerRegionCode = "",
  disabled = false,
  savedAddresses = [],
  onChange,
}) {
  const list = useMemo(
    () => (Array.isArray(locations) ? locations : []),
    [locations],
  );

  const profileAddresses = useMemo(
    () => (Array.isArray(savedAddresses) ? savedAddresses : []),
    [savedAddresses],
  );

  const [selectedProfileIds, setSelectedProfileIds] = useState(() =>
    new Set(selectedProfileAddressIdsFromLocations(profileAddresses, list)),
  );
  const [confirmedCustomLocationIds, setConfirmedCustomLocationIds] = useState(
    () => new Set(),
  );
  const [customModeActive, setCustomModeActive] = useState(false);
  const [inlineAddressDraft, setInlineAddressDraft] = useState(EMPTY_INLINE_ADDRESS);

  const listRef = useRef(list);
  listRef.current = list;

  const multiSelectEnabled = pickupEnabled || courierDeliveryEnabled;
  const maxLocations = multiSelectEnabled ? PRODUCT_PICKUP_LOCATIONS_MAX : 1;
  const canAddMoreLocations = list.length < maxLocations;
  const showAddressSection = pickupEnabled || deliveryEnabled || courierDeliveryEnabled;

  const customLocations = useMemo(
    () => findCustomPickupLocations(list, profileAddresses),
    [list, profileAddresses],
  );

  const selectedProfileIdsRef = useRef(selectedProfileIds);
  selectedProfileIdsRef.current = selectedProfileIds;

  const confirmedCustomLocationIdsRef = useRef(confirmedCustomLocationIds);
  confirmedCustomLocationIdsRef.current = confirmedCustomLocationIds;

  const emit = (patch) => {
    onChange({
      productPickupLocations: list,
      productPickupEnabled: pickupEnabled,
      productDeliveryEnabled: deliveryEnabled,
      productCourierDeliveryEnabled: courierDeliveryEnabled,
      ...patch,
    });
  };

  /**
   * @param {ProductPickupLocationFormValue[]} nextList
   * @param {string | null} [regionCode]
   * @param {Set<string>} [profileIdsForPrune]
   * @param {Set<string>} [customIdsForPrune]
   */
  const commitLocations = (
    nextList,
    regionCode = null,
    profileIdsForPrune = selectedProfileIdsRef.current,
    customIdsForPrune = confirmedCustomLocationIdsRef.current,
  ) => {
    const pruned = pruneProductPickupLocationsToSelection(
      nextList,
      profileAddresses,
      profileIdsForPrune,
      customIdsForPrune,
    );
    emit({
      productPickupLocations: ensureSingleDefaultProductPickupLocation(pruned),
      ...(regionCode ? { productRegionCode: regionCode } : {}),
    });
  };

  const didInitialPruneRef = useRef(false);

  useEffect(() => {
    if (disabled || didInitialPruneRef.current) {
      return;
    }
    didInitialPruneRef.current = true;

    const initialSelected = new Set(
      selectedProfileAddressIdsFromLocations(profileAddresses, list),
    );
    setSelectedProfileIds(initialSelected);

    const pruned = pruneProductPickupLocationsToSelection(
      list,
      profileAddresses,
      initialSelected,
      confirmedCustomLocationIdsRef.current,
    );
    if (!areProductPickupLocationListsEqual(list, pruned)) {
      commitLocations(pruned, null, initialSelected);
    }
  }, [disabled, profileAddresses, list]);

  useEffect(() => {
    const latestCustom = customLocations[customLocations.length - 1] ?? null;
    if (latestCustom && customModeActive) {
      setInlineAddressDraft(pickupAddressValueFromLocation(latestCustom));
    }
  }, [customLocations, customModeActive]);

  const showInlineAddressField = customModeActive;

  /**
   * @param {ProductPickupLocationFormValue[]} baseList
   */
  const normalizeForSingleSelect = (baseList) => {
    if (multiSelectEnabled || baseList.length <= 1) {
      return baseList;
    }
    return baseList.slice(-1);
  };

  /**
   * @param {ProductPickupLocationFormValue[]} baseList
   */
  const withoutProfileLocations = (baseList) =>
    baseList.filter(
      (item) =>
        !profileAddresses.some((profileItem) =>
          isSavedAddressInPickupLocations(profileItem, [item]),
        ),
    );

  const withoutCustomLocations = (baseList) =>
    baseList.filter(
      (item) =>
        !customLocations.some(
          (custom) =>
            String(custom.address ?? "").trim().toLowerCase() ===
            String(item.address ?? "").trim().toLowerCase(),
        ),
    );

  const closeCustomMode = () => {
    setCustomModeActive(false);
    setInlineAddressDraft(EMPTY_INLINE_ADDRESS);
    const nextList = withoutCustomLocations(list);
    const nextCustomIds = new Set(
      [...confirmedCustomLocationIdsRef.current].filter((id) =>
        nextList.some((item) => String(item.id ?? "") === id),
      ),
    );
    setConfirmedCustomLocationIds(nextCustomIds);
    commitLocations(nextList, null, selectedProfileIdsRef.current, nextCustomIds);
  };

  /**
   * @param {(typeof profileAddresses)[number]} saved
   */
  const enrichSavedAddressGeo = (saved) => {
    const addressKey = savedAddressPickupLine(saved).toLowerCase();
    const currentLocation = listRef.current.find(
      (item) => String(item?.address ?? "").trim().toLowerCase() === addressKey,
    );
    if (
      currentLocation &&
      hasValidPickupGeo({ lat: currentLocation.lat, lon: currentLocation.lon })
    ) {
      return;
    }

    void resolvePickupGeoForSavedAddress(saved).then((geo) => {
      if (!geo) {
        return;
      }

      const currentList = listRef.current;
      const hasTarget = currentList.some(
        (item) => String(item?.address ?? "").trim().toLowerCase() === addressKey,
      );
      if (!hasTarget) {
        return;
      }

      commitLocations(
        ensureSingleDefaultProductPickupLocation(
          currentList.map((item) =>
            String(item?.address ?? "").trim().toLowerCase() === addressKey
              ? { ...item, lat: geo.lat, lon: geo.lon }
              : item,
          ),
        ),
      );
    });
  };

  useEffect(() => {
    profileAddresses.forEach((saved) => {
      if (!isSavedAddressInPickupLocations(saved, list)) {
        return;
      }
      const line = savedAddressPickupLine(saved).toLowerCase();
      const location = list.find(
        (item) => String(item?.address ?? "").trim().toLowerCase() === line,
      );
      if (!location || hasValidPickupGeo({ lat: location.lat, lon: location.lon })) {
        return;
      }
      enrichSavedAddressGeo(saved);
    });
  }, [list, profileAddresses]);

  /**
   * @param {typeof EMPTY_INLINE_ADDRESS} next
   */
  const tryCommitCustomAddress = (next) => {
    const line = String(next.line ?? "").trim();
    if (!line || !hasValidPickupGeo(next.geo)) {
      return;
    }

    const baseList = [
      ...list.filter(
        (item) =>
          !customLocations.some(
            (custom) =>
              String(custom.address ?? "").trim().toLowerCase() ===
              String(item.address ?? "").trim().toLowerCase(),
          ),
      ),
    ];

    const nextList = normalizeForSingleSelect([
      ...baseList,
      {
        ...createPickupLocationFromSaved({ line, geo: next.geo }),
        address: line,
        isDefault: baseList.length === 0,
        selectedFromSuggest: next.selectedFromSuggest === true,
      },
    ]);

    if (nextList.length > maxLocations) {
      return;
    }

    const customLocation = nextList[nextList.length - 1];
    const nextCustomIds = new Set(confirmedCustomLocationIdsRef.current);
    if (customLocation?.id) {
      nextCustomIds.add(String(customLocation.id));
    }
    setConfirmedCustomLocationIds(nextCustomIds);

    commitLocations(
      nextList,
      next.regionCode ?? null,
      selectedProfileIdsRef.current,
      nextCustomIds,
    );
    setInlineAddressDraft(next);
  };

  /**
   * @param {(typeof profileAddresses)[number]} saved
   */
  const toggleSavedAddress = (saved) => {
    if (disabled) {
      return;
    }

    const savedId = String(saved.id ?? "");
    const isSelected = selectedProfileIds.has(savedId);

    setCustomModeActive(false);
    setInlineAddressDraft(EMPTY_INLINE_ADDRESS);

    if (isSelected) {
      const nextSelectedIds = new Set(selectedProfileIds);
      nextSelectedIds.delete(savedId);
      setSelectedProfileIds(nextSelectedIds);
      commitLocations(
        removePickupLocationByAddressLine(list, savedAddressPickupLine(saved)),
        null,
        nextSelectedIds,
      );
      return;
    }

    if (multiSelectEnabled && !canAddMoreLocations) {
      return;
    }

    if (isSavedAddressInPickupLocations(saved, list)) {
      return;
    }

    // Pickup: multi-select profile addresses. Delivery-only warehouse: single profile point.
    const baseList = multiSelectEnabled ? list : withoutProfileLocations(list);
    const nextSelectedIds = multiSelectEnabled
      ? new Set(selectedProfileIds).add(savedId)
      : new Set([savedId]);
    setSelectedProfileIds(nextSelectedIds);

    commitLocations(
      normalizeForSingleSelect([
        ...baseList,
        {
          ...createPickupLocationFromSaved(saved),
          isDefault: baseList.length === 0,
        },
      ]),
      null,
      nextSelectedIds,
    );

    enrichSavedAddressGeo(saved);
  };

  const startCustomMode = () => {
    if (disabled) {
      return;
    }

    if (customModeActive) {
      closeCustomMode();
      return;
    }

    setCustomModeActive(true);

    if (!multiSelectEnabled) {
      setSelectedProfileIds(new Set());
      commitLocations(customLocations);
      setInlineAddressDraft(
        customLocations[0]
          ? pickupAddressValueFromLocation(customLocations[0])
          : EMPTY_INLINE_ADDRESS,
      );
    } else if (customLocations[0]) {
      setInlineAddressDraft(pickupAddressValueFromLocation(customLocations[0]));
    } else {
      setInlineAddressDraft(EMPTY_INLINE_ADDRESS);
    }
  };

  /**
   * @param {typeof EMPTY_INLINE_ADDRESS} next
   */
  const handleInlineAddressChange = (next) => {
    setInlineAddressDraft(next);
    tryCommitCustomAddress(next);
  };

  const deliverySelectable = PRODUCT_DELIVERY_FULFILLMENT_ENABLED && !disabled;
  const selectedProfileIdSet = buildSelectedProfileIdSet(profileAddresses, selectedProfileIds);

  // Едет ли товар до покупателя — вопрос к перевозчику, а не к двум старым
  // флагам: у товара с ЛОБО оба false, и раздел доставки пропадал целиком.
  const shipsToBuyer = productShipsToBuyer({
    productDeliveryCarrier,
    productDeliveryEnabled: deliveryEnabled,
    productCourierDeliveryEnabled: courierDeliveryEnabled,
  });

  const togglePickup = () => {
    if (disabled) {
      return;
    }
    if (pickupEnabled && !shipsToBuyer) {
      return;
    }
    emit({ productPickupEnabled: !pickupEnabled });
  };

  /**
   * Доставка целиком: включаем — сразу с рабочей службой, выключаем — гасим
   * обе. Служба выбирается ниже, отдельным вопросом.
   */
  const toggleDeliveryMode = () => {
    if (disabled) {
      return;
    }
    if (shipsToBuyer && !pickupEnabled) {
      return;
    }
    emit(
      shipsToBuyer
        ? { productDeliveryEnabled: false, productCourierDeliveryEnabled: false }
        : { productDeliveryEnabled: false, productCourierDeliveryEnabled: true },
    );
  };

  /** @param {"seller" | "courier"} carrier */
  const chooseCarrier = (carrier) => {
    if (disabled) {
      return;
    }
    // Службы взаимоисключающи: непонятно, кому предлагать отправление.
    // Флаги пишем производными — их читает существующий код.
    emit({
      productDeliveryCarrier: carrier,
      ...buildLegacyDeliveryFlags(carrier),
    });
  };

  // Локальные службы предлагаем только там, где они возят. Регион берём с
  // товара: ЛОБО приедет именно на точку отправления, а не туда, где
  // прописан продавец.
  const carrierRegionCode = productRegionCode || sellerRegionCode;
  const availableCarriers = listDeliveryCarriersForRegion(carrierRegionCode);
  const currentCarrier =
    resolveProductDeliveryCarrier({
      productDeliveryCarrier,
      productDeliveryEnabled: deliveryEnabled,
      productCourierDeliveryEnabled: courierDeliveryEnabled,
    }) ?? "";

  return (
    <div className="product-pickup-location-fields">
      {showAddressSection && profileAddresses.length > 0 ? (
        <div className="saved-address-picker">
          <span className="saved-address-picker__label">
            {PRODUCT_PICKUP_UI.SAVED_ADDRESSES_LABEL}
          </span>
          <div
            className="saved-address-picker__list"
            role="group"
            aria-label={PRODUCT_PICKUP_UI.SAVED_ADDRESSES_LABEL}
          >
            {profileAddresses.map((item) => {
              const selected = selectedProfileIdSet.has(String(item.id ?? ""));
              return (
                <button
                  key={item.id}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  className={[
                    "saved-address-picker__option",
                    "saved-address-picker__option_with-checkbox",
                    selected ? "saved-address-picker__option_active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={
                    disabled ||
                    (!selected && !canAddMoreLocations && multiSelectEnabled)
                  }
                  onClick={() => toggleSavedAddress(item)}
                >
                  <input
                    type="checkbox"
                    className="saved-address-picker__option-checkbox"
                    checked={selected}
                    readOnly
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <span className="saved-address-picker__option-body">
                    {item.label ? (
                      <span className="saved-address-picker__option-label">{item.label}</span>
                    ) : null}
                    <span className="saved-address-picker__option-line">
                      {USER_SAVED_ADDRESSES_UI.FORMAT_LINE(item.line, item.flat ?? "")}
                    </span>
                    {item.isDefault ? (
                      <span className="saved-address-picker__option-badge">
                        {USER_SAVED_ADDRESSES_UI.LABEL_DEFAULT}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              role="checkbox"
              aria-checked={customModeActive}
              className={[
                "saved-address-picker__option",
                "saved-address-picker__option_with-checkbox",
                "product-pickup-location-fields__saved-option_custom",
                customModeActive ? "saved-address-picker__option_active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={disabled}
              onClick={startCustomMode}
            >
              <input
                type="checkbox"
                className="saved-address-picker__option-checkbox"
                checked={customModeActive}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
              />
              <span className="saved-address-picker__option-body">
                <span className="saved-address-picker__option-line">
                  {PRODUCT_PICKUP_UI.SAVED_ADDRESS_OTHER}
                </span>
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {showInlineAddressField ? (
        <AddressDeliveryFields
          value={inlineAddressDraft}
          onChange={handleInlineAddressChange}
          disabled={disabled}
          hideMapOpenButton
          showMap
          lineOpensMap
          lineInputClassName="create-product-section__input"
          labels={{
            line: pickupEnabled
              ? PRODUCT_PICKUP_UI.ADDRESS_LABEL
              : PRODUCT_PICKUP_UI.ADDRESS_LABEL_WAREHOUSE,
          }}
          rootId="create-product-pickup-inline-map"
        />
      ) : null}

      {!profileAddresses.length && canAddMoreLocations ? (
        <button
          type="button"
          className="product-pickup-location-fields__add"
          disabled={disabled}
          onClick={startCustomMode}
        >
          {PRODUCT_PICKUP_UI.ADD_LOCATION}
        </button>
      ) : null}

      <p className="product-pickup-location-fields__legend">
        <FormFieldLabel>{PRODUCT_PICKUP_UI.FULFILLMENT_LEGEND}</FormFieldLabel>
      </p>

      <div
        className="product-pickup-location-fields__methods"
        role="group"
        aria-label={PRODUCT_PICKUP_UI.FULFILLMENT_LEGEND}
      >
        <label
          className={[
            "product-pickup-location-fields__check",
            pickupEnabled ? "product-pickup-location-fields__check_on" : "",
            disabled ? "product-pickup-location-fields__check_disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            type="checkbox"
            className="product-pickup-location-fields__checkbox"
            checked={pickupEnabled}
            disabled={disabled || (pickupEnabled && !shipsToBuyer)}
            onChange={togglePickup}
          />
          <span className="product-pickup-location-fields__check-label">
            {PRODUCT_PICKUP_UI.FULFILLMENT_PICKUP}
          </span>
        </label>

        <label
          className={[
            "product-pickup-location-fields__check",
            shipsToBuyer ? "product-pickup-location-fields__check_on" : "",
            disabled ? "product-pickup-location-fields__check_disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            type="checkbox"
            className="product-pickup-location-fields__checkbox"
            checked={shipsToBuyer}
            disabled={disabled || (shipsToBuyer && !pickupEnabled)}
            onChange={toggleDeliveryMode}
          />
          <span className="product-pickup-location-fields__check-label">
            {PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY_ANY}
          </span>
        </label>

      </div>

      {shipsToBuyer ? (
        <>
      <p className="product-pickup-location-fields__sublegend">
        {PRODUCT_PICKUP_UI.CARRIERS_LEGEND}
      </p>
      <div
        className="product-pickup-location-fields__methods product-pickup-location-fields__methods_carriers"
        role="radiogroup"
        aria-label={PRODUCT_PICKUP_UI.CARRIERS_LEGEND}
      >
        <label
          className={[
            "product-pickup-location-fields__check",
            courierDeliveryEnabled
              ? "product-pickup-location-fields__check_on"
              : "",
            disabled ? "product-pickup-location-fields__check_disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            type="radio"
            name="product-delivery-carrier"
            className="product-pickup-location-fields__checkbox"
            checked={currentCarrier === PRODUCT_DELIVERY_CARRIER_GITORG}
            disabled={disabled}
            onChange={() => chooseCarrier(PRODUCT_DELIVERY_CARRIER_GITORG)}
          />
          <span className="product-pickup-location-fields__check-label">
            {PRODUCT_PICKUP_UI.FULFILLMENT_COURIER}
          </span>
        </label>

        <label
          className={[
            "product-pickup-location-fields__check",
            deliveryEnabled ? "product-pickup-location-fields__check_on" : "",
            !PRODUCT_DELIVERY_FULFILLMENT_ENABLED
              ? "product-pickup-location-fields__check_soon"
              : "",
            !deliverySelectable ? "product-pickup-location-fields__check_disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            type="radio"
            name="product-delivery-carrier"
            className="product-pickup-location-fields__checkbox"
            checked={currentCarrier === PRODUCT_DELIVERY_CARRIER_SELLER}
            disabled={!deliverySelectable}
            onChange={() => chooseCarrier(PRODUCT_DELIVERY_CARRIER_SELLER)}
          />
          <span className="product-pickup-location-fields__check-label">
            {PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY}
            {!PRODUCT_DELIVERY_FULFILLMENT_ENABLED
              ? PRODUCT_PICKUP_UI.SOON_BADGE
              : null}
          </span>
        </label>

        {availableCarriers.includes(PRODUCT_DELIVERY_CARRIER_LOBO) ? (
          <label
            className={[
              "product-pickup-location-fields__check",
              currentCarrier === PRODUCT_DELIVERY_CARRIER_LOBO
                ? "product-pickup-location-fields__check_on"
                : "",
              disabled ? "product-pickup-location-fields__check_disabled" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="radio"
              name="product-delivery-carrier"
              className="product-pickup-location-fields__checkbox"
              checked={currentCarrier === PRODUCT_DELIVERY_CARRIER_LOBO}
              disabled={disabled}
              onChange={() => chooseCarrier(PRODUCT_DELIVERY_CARRIER_LOBO)}
            />
            <span className="product-pickup-location-fields__check-label">
              {PRODUCT_DELIVERY_CARRIER_LABEL_RU[PRODUCT_DELIVERY_CARRIER_LOBO]}
            </span>
          </label>
        ) : null}

        {SHIPPING_PROVIDERS.filter(
          (providerId) => providerId !== PRODUCT_DELIVERY_CARRIER_LOBO,
        ).map((providerId) => (
          <label
            key={providerId}
            className="product-pickup-location-fields__check product-pickup-location-fields__check_soon product-pickup-location-fields__check_disabled"
          >
            <input
              type="checkbox"
              className="product-pickup-location-fields__checkbox"
              checked={false}
              disabled
              readOnly
            />
            <span className="product-pickup-location-fields__check-label">
              {SHIPPING_PROVIDER_LABEL_RU[providerId] ?? providerId}
              {PRODUCT_PICKUP_UI.SOON_BADGE}
            </span>
          </label>
        ))}
      </div>
      <p className="product-pickup-location-fields__hint">
        {PRODUCT_PICKUP_UI.CARRIERS_HINT}
      </p>
        </>
      ) : null}

      <p className="product-pickup-location-fields__hint">
        {multiSelectEnabled
          ? PRODUCT_PICKUP_UI.PICKUP_MULTI_HINT
          : PRODUCT_PICKUP_UI.METHODS_REQUIRED_HINT}
      </p>
    </div>
  );
}
