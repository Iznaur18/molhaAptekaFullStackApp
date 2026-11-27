import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import type { YandexDeliveryDropoff } from "@/entities/yandex-delivery/api/yandexDeliveryCredentialsApi";
import {
  useSaveYandexDropoffMutation,
  useYandexDropoffPointsMutation,
} from "@/entities/yandex-delivery/model/useYandexDeliveryConnection";
import { YANDEX_DELIVERY_CONNECTION_UI as UI } from "@/shared/config";
import { useDeliveryPaymentPageStyles } from "@/shared/theme/deliveryPaymentPageStyles";
import { AppButton } from "@/shared/ui/AppButton";

type YandexDropoffPickerProps = {
  dropoff: YandexDeliveryDropoff;
};

export const YandexDropoffPicker = ({ dropoff }: YandexDropoffPickerProps) => {
  const styles = useDeliveryPaymentPageStyles();
  const [city, setCity] = useState("");
  const [stationId, setStationId] = useState("");
  const pointsMutation = useYandexDropoffPointsMutation();
  const saveMutation = useSaveYandexDropoffMutation();
  const points = pointsMutation.data ?? [];
  const error = pointsMutation.error ?? saveMutation.error;

  const find = () => {
    if (city.trim().length >= 2) {
      setStationId("");
      pointsMutation.mutate(city.trim());
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.legend}>{UI.DROPOFF_TITLE}</Text>
      <Text style={styles.blockHint}>{UI.DROPOFF_HINT}</Text>
      {dropoff ? (
        <Text style={styles.blockHint}>
          {UI.DROPOFF_CURRENT}: {dropoff.address || dropoff.name}
        </Text>
      ) : (
        <Text style={styles.error} accessibilityRole="text">
          {UI.DROPOFF_MISSING}
        </Text>
      )}

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{UI.DROPOFF_CITY_LABEL}</Text>
        <TextInput
          style={styles.input}
          value={city}
          placeholder={UI.DROPOFF_CITY_PLACEHOLDER}
          onChangeText={setCity}
          autoCapitalize="words"
          editable={!pointsMutation.isPending}
        />
      </View>

      <AppButton
        label={pointsMutation.isPending ? UI.DROPOFF_FIND_PENDING : UI.DROPOFF_FIND}
        variant="secondary"
        disabled={pointsMutation.isPending || city.trim().length < 2}
        onPress={find}
      />

      {pointsMutation.isSuccess && points.length === 0 ? (
        <Text style={styles.blockHint}>{UI.DROPOFF_EMPTY}</Text>
      ) : null}

      {points.length > 0 ? (
        <View style={styles.selectRow}>
          <Text style={styles.fieldLabel}>{UI.DROPOFF_POINT_LABEL}</Text>
          {points.map((point) => {
            const selected = stationId === point.id;
            return (
              <Pressable
                key={point.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => setStationId(point.id)}
                style={[styles.selectOption, selected && styles.selectOptionOn]}
              >
                <Text style={styles.selectOptionText}>
                  {point.address || point.name || point.id}
                </Text>
              </Pressable>
            );
          })}
          <AppButton
            label={saveMutation.isPending ? UI.DROPOFF_SAVE_PENDING : UI.DROPOFF_SAVE}
            variant="primary"
            disabled={!stationId || saveMutation.isPending}
            onPress={() => saveMutation.mutate(stationId)}
          />
        </View>
      ) : null}

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error.message}
        </Text>
      ) : null}
    </View>
  );
};
