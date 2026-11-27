import { useState } from "react";
import { Linking, Pressable, Text, TextInput, View } from "react-native";

import {
  useMyCdekConnectionQuery,
  useRemoveCdekConnectionMutation,
  useSaveCdekConnectionMutation,
  useToggleCdekConnectionMutation,
} from "@/entities/cdek/model/useCdekConnection";
import { CDEK_CONNECTION_UI } from "@/shared/config";
import { useDeliveryPaymentPageStyles } from "@/shared/theme/deliveryPaymentPageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const CdekConnectionCard = () => {
  const styles = useDeliveryPaymentPageStyles();
  const connectionQuery = useMyCdekConnectionQuery();
  const saveMutation = useSaveCdekConnectionMutation();
  const removeMutation = useRemoveCdekConnectionMutation();
  const toggleMutation = useToggleCdekConnectionMutation();

  const [account, setAccount] = useState("");
  const [secure, setSecure] = useState("");
  const [environment, setEnvironment] = useState<"prod" | "test">("test");

  if (connectionQuery.isPending) {
    return <ScreenLoadingState message={CDEK_CONNECTION_UI.SUBMIT_PENDING} />;
  }

  const connection = connectionQuery.data;
  const isConnected = connection?.connected === true;
  const isOffered = isConnected && connection?.enabled !== false;
  const error =
    saveMutation.error ??
    removeMutation.error ??
    toggleMutation.error ??
    connectionQuery.error;

  const handleSubmit = () => {
    saveMutation.mutate(
      { account: account.trim(), secure: secure.trim(), environment },
      {
        onSuccess: () => {
          setAccount("");
          setSecure("");
        },
      },
    );
  };

  return (
    <View style={styles.block} accessibilityLabel={CDEK_CONNECTION_UI.TITLE}>
      <View style={styles.carrierHeader}>
        <Text style={styles.carrierTitle}>{CDEK_CONNECTION_UI.TITLE}</Text>
        <View style={[styles.carrierStatus, isConnected && styles.carrierStatusOn]}>
          <Text style={styles.carrierStatusText}>
            {isConnected
              ? CDEK_CONNECTION_UI.CONNECTED
              : CDEK_CONNECTION_UI.NOT_CONNECTED}
          </Text>
        </View>
      </View>

      <Text style={styles.blockHint}>{CDEK_CONNECTION_UI.SUBTITLE}</Text>

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
            <Text style={styles.methodTitle}>{CDEK_CONNECTION_UI.TOGGLE_LABEL}</Text>
            <Text style={styles.methodHint}>
              {isOffered
                ? CDEK_CONNECTION_UI.TOGGLE_ON_HINT
                : CDEK_CONNECTION_UI.TOGGLE_OFF_HINT}
            </Text>
          </View>
        </Pressable>
      ) : null}

      {isConnected ? (
        <View style={styles.facts}>
          <View style={styles.factRow}>
            <Text style={styles.factLabel}>{CDEK_CONNECTION_UI.ACCOUNT_LABEL}</Text>
            <Text style={styles.factValue}>{connection?.accountMasked}</Text>
          </View>
          <View style={styles.factRow}>
            <Text style={styles.factLabel}>{CDEK_CONNECTION_UI.ENVIRONMENT_LABEL}</Text>
            <Text style={styles.factValue}>
              {connection?.environment === "test"
                ? CDEK_CONNECTION_UI.ENVIRONMENT_TEST
                : CDEK_CONNECTION_UI.ENVIRONMENT_PROD}
            </Text>
          </View>
          {connection?.validatedAt ? (
            <View style={styles.factRow}>
              <Text style={styles.factLabel}>{CDEK_CONNECTION_UI.CHECKED_AT}</Text>
              <Text style={styles.factValue}>
                {new Date(connection.validatedAt).toLocaleString("ru-RU")}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{CDEK_CONNECTION_UI.ACCOUNT_LABEL}</Text>
        <TextInput
          style={styles.input}
          value={account}
          onChangeText={setAccount}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!saveMutation.isPending}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{CDEK_CONNECTION_UI.SECURE_LABEL}</Text>
        <TextInput
          style={styles.input}
          value={secure}
          onChangeText={setSecure}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!saveMutation.isPending}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{CDEK_CONNECTION_UI.ENVIRONMENT_LABEL}</Text>
        <View style={styles.tariffModes}>
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
              {CDEK_CONNECTION_UI.ENVIRONMENT_TEST}
            </Text>
          </Pressable>
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
              {CDEK_CONNECTION_UI.ENVIRONMENT_PROD}
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.blockHint}>{CDEK_CONNECTION_UI.SECURE_HINT}</Text>
      <Text style={styles.blockHint}>
        {CDEK_CONNECTION_UI.HOW_TO}{" "}
        <Text
          style={styles.link}
          onPress={() => void Linking.openURL(CDEK_CONNECTION_UI.HOW_TO_LINK)}
        >
          lk.cdek.ru
        </Text>
      </Text>

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error.message}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <AppButton
          label={
            saveMutation.isPending
              ? CDEK_CONNECTION_UI.SUBMIT_PENDING
              : CDEK_CONNECTION_UI.SUBMIT
          }
          variant="primary"
          disabled={saveMutation.isPending || !account.trim() || !secure.trim()}
          onPress={handleSubmit}
        />
        {isConnected ? (
          <AppButton
            label={
              removeMutation.isPending
                ? CDEK_CONNECTION_UI.DISCONNECT_PENDING
                : CDEK_CONNECTION_UI.DISCONNECT
            }
            variant="secondary"
            disabled={removeMutation.isPending}
            onPress={() => removeMutation.mutate()}
          />
        ) : null}
      </View>
    </View>
  );
};
