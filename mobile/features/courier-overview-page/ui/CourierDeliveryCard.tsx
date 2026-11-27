import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import type { CourierDelivery } from "@/entities/courier/api/courierApi";
import {
  useCompleteCourierDeliveryMutation,
  useConfirmCourierHandoverMutation,
  useDeclineCourierShipmentMutation,
  useMarkCourierArrivedMutation,
  useStartCourierDeliveryMutation,
} from "@/entities/courier/model/useCourierQueries";
import { ORDER_STATUS_LABEL_RU } from "@/entities/order/model/constants";
import { COURIER_OVERVIEW_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useServicesProfilePageStyles } from "@/shared/theme/servicesProfilePageStyles";
import { AppButton } from "@/shared/ui/AppButton";

type CourierDeliveryCardProps = {
  delivery: CourierDelivery;
  onError: (message: string) => void;
  onUserPress?: (userId: string) => void;
};

export const CourierDeliveryCard = ({
  delivery,
  onError,
  onUserPress,
}: CourierDeliveryCardProps) => {
  const styles = useServicesProfilePageStyles();
  const [code, setCode] = useState("");
  const handoverMutation = useConfirmCourierHandoverMutation();
  const startMutation = useStartCourierDeliveryMutation();
  const arrivedMutation = useMarkCourierArrivedMutation();
  const completeMutation = useCompleteCourierDeliveryMutation();
  const declineMutation = useDeclineCourierShipmentMutation();

  const ids = { orderId: delivery.orderId, sellerId: delivery.sellerId };
  const isBusy =
    handoverMutation.isPending ||
    startMutation.isPending ||
    arrivedMutation.isPending ||
    completeMutation.isPending ||
    declineMutation.isPending;

  const guard = async (run: () => Promise<unknown>) => {
    onError("");
    try {
      await run();
      setCode("");
    } catch (error) {
      onError(
        error instanceof Error ? error.message : COURIER_OVERVIEW_UI.ERROR_GENERIC,
      );
    }
  };

  const needsCode =
    delivery.status === "courier_assigned" || delivery.status === "delivered";
  const codeReady = /^\d{4}$/.test(code.trim());
  const showCardOnDeliveryPayment =
    delivery.paymentMethod === "cardOnDelivery" &&
    (delivery.status === "in_delivery" || delivery.status === "delivered");
  const paymentConfirmed = delivery.paymentConfirmed === true;

  const renderAction = () => {
    switch (delivery.status) {
      case "courier_assigned":
        return (
          <AppButton
            label={COURIER_OVERVIEW_UI.STEP_TAKE}
            variant="primary"
            disabled={isBusy || !codeReady}
            onPress={() =>
              void guard(() => handoverMutation.mutateAsync({ ...ids, code }))
            }
          />
        );
      case "courier_holding":
        return (
          <AppButton
            label={COURIER_OVERVIEW_UI.STEP_GO}
            variant="primary"
            disabled={isBusy}
            onPress={() => void guard(() => startMutation.mutateAsync(ids))}
          />
        );
      case "in_delivery":
        return (
          <AppButton
            label={COURIER_OVERVIEW_UI.STEP_ARRIVED}
            variant="primary"
            disabled={isBusy}
            onPress={() => void guard(() => arrivedMutation.mutateAsync(ids))}
          />
        );
      case "delivered":
        return (
          <AppButton
            label={COURIER_OVERVIEW_UI.STEP_HANDED}
            variant="primary"
            disabled={isBusy || !codeReady}
            onPress={() =>
              void guard(() => completeMutation.mutateAsync({ ...ids, code }))
            }
          />
        );
      default:
        return null;
    }
  };

  const person = (name: string | undefined, userId: string | undefined) => {
    const label = String(name ?? "").trim() || "—";
    if (!onUserPress || !userId) {
      return <Text style={styles.metaValue}>{label}</Text>;
    }
    return (
      <Pressable onPress={() => onUserPress(String(userId))}>
        <Text style={[styles.metaValue, { textDecorationLine: "underline" }]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.badgeText}>
          {ORDER_STATUS_LABEL_RU[
            delivery.status as keyof typeof ORDER_STATUS_LABEL_RU
          ] ?? delivery.status}
        </Text>
        <Text style={styles.fee}>{formatPriceRub(delivery.deliveryFeeRub ?? 0)}</Text>
      </View>

      <Text style={styles.metaLabel}>{COURIER_OVERVIEW_UI.SELLER}</Text>
      {person(delivery.sellerName, delivery.sellerId)}
      {delivery.buyerName ? (
        <>
          <Text style={styles.metaLabel}>{COURIER_OVERVIEW_UI.BUYER}</Text>
          {person(delivery.buyerName, delivery.buyerId)}
        </>
      ) : null}

      <Text style={styles.metaLabel}>{COURIER_OVERVIEW_UI.PICKUP}</Text>
      <Text style={styles.metaValue}>
        {delivery.pickupAddress || "—"}
        {delivery.sellerPhone ? ` · ${delivery.sellerPhone}` : ""}
      </Text>
      <Text style={styles.metaLabel}>{COURIER_OVERVIEW_UI.DROPOFF}</Text>
      <Text style={styles.metaValue}>
        {delivery.deliveryAddress || "—"}
        {delivery.buyerPhone ? ` · ${delivery.buyerPhone}` : ""}
      </Text>

      {!delivery.contactsUnlocked ? (
        <Text style={styles.hint}>{COURIER_OVERVIEW_UI.CONTACTS_LOCKED}</Text>
      ) : null}

      {showCardOnDeliveryPayment ? (
        <View style={[styles.paymentBox, paymentConfirmed && styles.paymentDone]}>
          <Text style={styles.channelTitle}>
            {paymentConfirmed
              ? COURIER_OVERVIEW_UI.PAYMENT_RECEIVED
              : COURIER_OVERVIEW_UI.PAYMENT_AWAITING}
          </Text>
          <Text style={styles.hint}>
            {paymentConfirmed
              ? COURIER_OVERVIEW_UI.PAYMENT_RECEIVED_HINT
              : COURIER_OVERVIEW_UI.PAYMENT_AWAITING_HINT}
          </Text>
        </View>
      ) : null}

      {(delivery.items ?? []).map((item, index) => (
        <Text key={`${item.name}-${index}`} style={styles.hint}>
          {item.name}
          {item.quantity ? ` × ${item.quantity}` : ""}
        </Text>
      ))}

      {needsCode ? (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>
            {delivery.status === "courier_assigned"
              ? COURIER_OVERVIEW_UI.CODE_FROM_SELLER
              : COURIER_OVERVIEW_UI.CODE_FROM_BUYER}
          </Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            placeholder="0000"
            editable={!isBusy}
            maxLength={4}
          />
        </View>
      ) : null}

      {renderAction()}

      {delivery.status === "courier_assigned" ? (
        <AppButton
          label={
            declineMutation.isPending
              ? COURIER_OVERVIEW_UI.SAVING
              : COURIER_OVERVIEW_UI.DECLINE
          }
          variant="secondary"
          disabled={isBusy}
          onPress={() =>
            Alert.alert(
              COURIER_OVERVIEW_UI.DECLINE,
              COURIER_OVERVIEW_UI.DECLINE_CONFIRM,
              [
                { text: "Отмена", style: "cancel" },
                {
                  text: COURIER_OVERVIEW_UI.DECLINE,
                  style: "destructive",
                  onPress: () => void guard(() => declineMutation.mutateAsync(ids)),
                },
              ],
            )
          }
        />
      ) : null}
    </View>
  );
};
