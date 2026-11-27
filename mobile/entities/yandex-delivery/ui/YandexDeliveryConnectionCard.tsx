import { useState } from "react";
import { Linking, Pressable, Text, TextInput, View } from "react-native";

import {
  useMyYandexDeliveryConnectionQuery,
  useRemoveYandexDeliveryConnectionMutation,
  useSaveYandexDeliveryConnectionMutation,
  useToggleYandexDeliveryConnectionMutation,
} from "@/entities/yandex-delivery/model/useYandexDeliveryConnection";
import { YandexDropoffPicker } from "@/entities/yandex-delivery/ui/YandexDropoffPicker";
import { YANDEX_DELIVERY_CONNECTION_UI as UI } from "@/shared/config";
import { useDeliveryPaymentPageStyles } from "@/shared/theme/deliveryPaymentPageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const YandexDeliveryConnectionCard = () => {
  const styles = useDeliveryPaymentPageStyles();
  const connectionQuery = useMyYandexDeliveryConnectionQuery();
  const saveMutation = useSaveYandexDeliveryConnectionMutation();
  const removeMutation = useRemoveYandexDeliveryConnectionMutation();
  const toggleMutation = useToggleYandexDeliveryConnectionMutation();

  const [token, setToken] = useState("");
  const [environment, setEnvironment] = useState<"prod" | "test">("prod");

  if (connectionQuery.isPending) {
    return <ScreenLoadingState message={UI.SUBMIT_PENDING} />;
  }

  const connection = connectionQuery.data;
  const isConnected = connection?.connected === true;
  const isOffered = isConnected && connection?.enabled !== false;
  const error =
    saveMutation.error ??
    removeMutation.error ??
    toggleMutation.error ??
    connectionQuery.error;

  return (
    <View style={styles.block} accessibilityLabel={UI.TITLE}>
      <View style={styles.carrierHeader}>
        <Text style={styles.carrierTitle}>{UI.TITLE}</Text>
        <View style={[styles.carrierStatus, isConnected && styles.carrierStatusOn]}>
          <Text style={styles.carrierStatusText}>
            {isConnected ? UI.CONNECTED : UI.NOT_CONNECTED}
          </Text>
        </View>
      </View>

      <Text style={styles.blockHint}>{UI.SUBTITLE}</Text>

      {isConnected ? (
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{
            checked: isOffered,
            disabled: toggleMutation.isPending,
          }}
          disabled={toggleMutation.isPending}
          onPress={() => toggleMutation.mutate(!isOffered)}
          style={[styles.method, isOffered && styles.methodOn]}
        >
          <View style={styles.methodCopy}>
            <Text style={styles.methodTitle}>{UI.TOGGLE_LABEL}</Text>
            <Text style={styles.methodHint}>
              {isOffered ? UI.TOGGLE_ON_HINT : UI.TOGGLE_OFF_HINT}
            </Text>
          </View>
        </Pressable>
      ) : null}

      {isConnected ? (
        <View style={styles.facts}>
          <View style={styles.factRow}>
            <Text style={styles.factLabel}>{UI.TOKEN_MASKED_LABEL}</Text>
            <Text style={styles.factValue}>{connection?.tokenMasked}</Text>
          </View>
          <View style={styles.factRow}>
            <Text style={styles.factLabel}>{UI.ENVIRONMENT_LABEL}</Text>
            <Text style={styles.factValue}>
              {connection?.environment === "test"
                ? UI.ENVIRONMENT_TEST
                : UI.ENVIRONMENT_PROD}
            </Text>
          </View>
          {connection?.validatedAt ? (
            <View style={styles.factRow}>
              <Text style={styles.factLabel}>{UI.CHECKED_AT}</Text>
              <Text style={styles.factValue}>
                {new Date(connection.validatedAt).toLocaleString("ru-RU")}
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.howToList}>
          {UI.HOW_TO_STEPS.map((step) => (
            <Text key={step} style={styles.howToItem}>
              • {step}
            </Text>
          ))}
        </View>
      )}

      {isConnected ? (
        <YandexDropoffPicker dropoff={connection?.dropoff ?? null} />
      ) : null}

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{UI.TOKEN_LABEL}</Text>
        <TextInput
          style={styles.input}
          value={token}
          onChangeText={setToken}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!saveMutation.isPending}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{UI.ENVIRONMENT_LABEL}</Text>
        <View style={styles.tariffModes}>
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: environment === "prod" }}
            onPress={() => setEnvironment("prod")}
            style={[styles.tariffMode, environment === "prod" && styles.tariffModeOn]}
          >
            <Text
              style={[
                styles.tariffModeText,
                environment === "prod" && styles.tariffModeTextOn,
              ]}
              numberOfLines={2}
            >
              {UI.ENVIRONMENT_PROD}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: environment === "test" }}
            onPress={() => setEnvironment("test")}
            style={[styles.tariffMode, environment === "test" && styles.tariffModeOn]}
          >
            <Text
              style={[
                styles.tariffModeText,
                environment === "test" && styles.tariffModeTextOn,
              ]}
              numberOfLines={2}
            >
              {UI.ENVIRONMENT_TEST}
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.blockHint}>
        {isConnected ? UI.REPLACE_HINT : UI.SECURE_HINT}{" "}
        <Text style={styles.link} onPress={() => void Linking.openURL(UI.HOW_TO_LINK)}>
          {UI.HOW_TO_LINK_LABEL}
        </Text>
      </Text>

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error.message}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <AppButton
          label={saveMutation.isPending ? UI.SUBMIT_PENDING : UI.SUBMIT}
          variant="primary"
          disabled={saveMutation.isPending || !token.trim()}
          onPress={() =>
            saveMutation.mutate(
              { token: token.trim(), environment },
              { onSuccess: () => setToken("") },
            )
          }
        />
        {isConnected ? (
          <AppButton
            label={removeMutation.isPending ? UI.DISCONNECT_PENDING : UI.DISCONNECT}
            variant="secondary"
            disabled={removeMutation.isPending}
            onPress={() => removeMutation.mutate()}
          />
        ) : null}
      </View>
    </View>
  );
};
