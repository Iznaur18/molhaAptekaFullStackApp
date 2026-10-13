import { useMemo } from "react";
import { Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  SELLER_DELIVERY_DISTANCE_SOURCE_ESTIMATE,
  normalizeSellerDeliveryTariff,
} from "@molha/api-contract";
import { quoteCartSellerDelivery, type CartSellerDelivery } from "@izibuy/shared-lib";

import type { RuDeliveryAddressValue } from "@/entities/address/model/types";
import { fetchSellerDeliveryQuote } from "@/entities/cart/api/sellerDeliveryQuote";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useCheckoutSellerDeliveryCostStyles } from "@/shared/theme/formChromeStyles";

type CheckoutSellerDeliveryCostProps = {
  /** Чей тариф и на какую сумму товаров. */
  sellerDelivery: CartSellerDelivery;
  /** Товары, которые везут: по ним сервер находит точку отправления. */
  productIds: readonly string[];
  address: RuDeliveryAddressValue;
  /** Адрес прошёл проверку формы — можно спрашивать расстояние. */
  isAddressValid: boolean;
};

/**
 * Стоимость доставки по тарифу продавца — паритет с web
 * `CheckoutSellerDeliveryCost.jsx`.
 *
 * Расстояние по дорогам приходит котировкой с сервера, сумму собирает та же
 * функция контракта, что и сервер при создании заказа: покупатель видит
 * ровно то, что потом окажется в заказе.
 */
export const CheckoutSellerDeliveryCost = ({
  sellerDelivery,
  productIds,
  address,
  isAddressValid,
}: CheckoutSellerDeliveryCostProps) => {
  const styles = useCheckoutSellerDeliveryCostStyles();
  const normalized = normalizeSellerDeliveryTariff(sellerDelivery.tariff);
  // Расстояние влияет на сумму, только когда продавец берёт за километр.
  const needsDistance = normalized.perKmRub > 0;

  const quoteAddress = useMemo(
    () => ({
      line: address.line.trim(),
      flat: address.flat.trim(),
      lat: address.geo?.lat ?? null,
      lon: address.geo?.lon ?? null,
      isValid: isAddressValid,
    }),
    [address.line, address.flat, address.geo?.lat, address.geo?.lon, isAddressValid],
  );
  // Не дёргаем сервер на каждую букву в поле «подъезд, этаж, кв».
  const debouncedAddress = useDebouncedValue(quoteAddress, 500);
  const productIdsKey = useMemo(() => [...productIds].sort().join(","), [productIds]);

  const quoteQuery = useQuery({
    queryKey: [
      "seller-delivery-quote",
      productIdsKey,
      debouncedAddress.line,
      debouncedAddress.flat,
      debouncedAddress.lat,
      debouncedAddress.lon,
    ],
    queryFn: () =>
      fetchSellerDeliveryQuote({
        productIds: productIdsKey.split(","),
        deliveryAddress: debouncedAddress.line,
        deliveryAddressFlat: debouncedAddress.flat,
        deliveryAddressGeo:
          debouncedAddress.lat != null && debouncedAddress.lon != null
            ? { lat: debouncedAddress.lat, lon: debouncedAddress.lon }
            : null,
      }),
    enabled: needsDistance && productIdsKey.length > 0 && debouncedAddress.isValid,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const entry = (quoteQuery.data?.sellers ?? []).find(
    (row) => String(row.sellerId) === String(sellerDelivery.sellerId),
  );
  const km = Number(entry?.distanceKm);
  const distanceKm =
    needsDistance && isAddressValid && entry && Number.isFinite(km) ? km : null;
  const quote = quoteCartSellerDelivery({
    tariff: sellerDelivery.tariff,
    distanceKm,
    goodsTotalRub: sellerDelivery.goodsTotalRub,
  });

  if (!quote) {
    return null;
  }

  const { feeRub, isFree, isEstimate, goodsTotalRub, payableRub } = quote;
  const isLoading =
    isAddressValid && (quoteQuery.isFetching || quoteAddress !== debouncedAddress);
  const isCalculating = needsDistance && isEstimate && isLoading;
  const errorMessage =
    needsDistance && isEstimate && isAddressValid && quoteQuery.error instanceof Error
      ? quoteQuery.error.message
      : "";
  const billableKm = distanceKm == null ? null : Math.ceil(distanceKm);

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={styles.legend}>{CHECKOUT_FORM_UI.SELLER_DELIVERY_LEGEND}</Text>
        <Text style={styles.value}>
          {isFree
            ? CHECKOUT_FORM_UI.SELLER_DELIVERY_FREE
            : isEstimate
              ? CHECKOUT_FORM_UI.SELLER_DELIVERY_FROM(formatPriceRub(feeRub))
              : formatPriceRub(feeRub)}
        </Text>
      </View>

      {isCalculating ? (
        <Text style={styles.hint}>{CHECKOUT_FORM_UI.SELLER_DELIVERY_CALCULATING}</Text>
      ) : null}

      {errorMessage ? (
        <Text style={[styles.hint, styles.hintError]} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}

      {isEstimate && !isCalculating && !errorMessage ? (
        <Text style={styles.hint}>{CHECKOUT_FORM_UI.SELLER_DELIVERY_NEED_ADDRESS}</Text>
      ) : null}

      {!isFree && normalized.freeFromRub > 0 ? (
        <Text style={styles.hint}>
          {CHECKOUT_FORM_UI.SELLER_DELIVERY_FREE_FROM(
            formatPriceRub(normalized.freeFromRub),
          )}
        </Text>
      ) : null}

      {goodsTotalRub > 0 ? (
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{CHECKOUT_FORM_UI.TOTAL_GOODS}</Text>
            <Text style={styles.totalValue}>{formatPriceRub(goodsTotalRub)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{CHECKOUT_FORM_UI.TOTAL_DELIVERY}</Text>
            <Text style={styles.totalValue}>
              {isFree ? CHECKOUT_FORM_UI.SELLER_DELIVERY_FREE : formatPriceRub(feeRub)}
            </Text>
          </View>
          {!isFree && billableKm != null ? (
            <Text style={styles.hint}>
              {entry?.distanceSource === SELLER_DELIVERY_DISTANCE_SOURCE_ESTIMATE
                ? CHECKOUT_FORM_UI.SELLER_DELIVERY_DISTANCE_ESTIMATE(billableKm)
                : CHECKOUT_FORM_UI.SELLER_DELIVERY_DISTANCE(billableKm)}
            </Text>
          ) : null}
          <View style={[styles.totalRow, styles.totalRowSum]}>
            <Text style={styles.totalSumLabel}>{CHECKOUT_FORM_UI.TOTAL_TO_PAY}</Text>
            <Text style={styles.totalSumValue}>
              {formatPriceRub(payableRub)}
              {isEstimate ? " …" : ""}
            </Text>
          </View>
        </View>
      ) : null}

      {!isFree && billableKm != null ? (
        <Text style={styles.attribution}>
          {CHECKOUT_FORM_UI.SELLER_DELIVERY_MAP_ATTRIBUTION}
        </Text>
      ) : null}
    </View>
  );
};
