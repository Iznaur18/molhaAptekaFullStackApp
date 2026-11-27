import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import {
  useDeleteOneCSettingsMutation,
  useOneCLogsQuery,
  useOneCSettingsQuery,
  usePostOneCExchangeCredentialsMutation,
  usePostOneCSyncMutation,
  usePostOneCTestMutation,
  usePutOneCSettingsMutation,
} from "@/entities/onec/model/useOneCQueries";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { OneCCategoryMappingTable } from "@/features/onec-integration-page/ui/OneCCategoryMappingTable";
import { OneCExchangeAccessCard } from "@/features/onec-integration-page/ui/OneCExchangeAccessCard";
import { OneCImportJobsList } from "@/features/onec-integration-page/ui/OneCImportJobsList";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountScrollBody } from "@/features/profile-tab/ui/ProfileAccountScrollBody";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import {
  AUTH_UI,
  MY_PROFILE_PAGE_UI,
  ONEC_INTEGRATION_PAGE_UI as UI,
} from "@/shared/config";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useServicesProfilePageStyles } from "@/shared/theme/servicesProfilePageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const CHANNEL_COMMERCEML = "commerceml";
const CHANNEL_PULL = "pull";

const toggleIn = (list: string[], value: string) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

export const OneCIntegrationPage = () => {
  const router = useRouter();
  const styles = useServicesProfilePageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
  const isAuthorized = useIsAuthorized();

  const settingsQuery = useOneCSettingsQuery(isAuthorized);
  const logsQuery = useOneCLogsQuery(isAuthorized);
  const saveMutation = usePutOneCSettingsMutation();
  const credentialsMutation = usePostOneCExchangeCredentialsMutation();
  const testMutation = usePostOneCTestMutation();
  const syncMutation = usePostOneCSyncMutation();
  const disconnectMutation = useDeleteOneCSettingsMutation();

  const [channel, setChannel] = useState(CHANNEL_COMMERCEML);
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [priceTypeIds, setPriceTypeIds] = useState<string[]>([]);
  const [warehouseIds, setWarehouseIds] = useState<string[]>([]);
  const [issuedPassword, setIssuedPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  useEffect(() => {
    if (!settingsQuery.data) return;
    setBaseUrl(settingsQuery.data.baseUrl || "");
    setEnabled(settingsQuery.data.enabled === true);
    setChannel(String(settingsQuery.data.channel || CHANNEL_PULL));
    setPriceTypeIds(settingsQuery.data.exchange?.priceTypeIds ?? []);
    setWarehouseIds(settingsQuery.data.exchange?.warehouseIds ?? []);
  }, [settingsQuery.data]);

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>{UI.AUTH_REQUIRED}</Text>
        <AppButton
          label={AUTH_UI.LOGIN_BUTTON}
          variant="primary"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    );
  }

  if (settingsQuery.isPending) {
    return <ScreenLoadingState message={UI.LOADING} />;
  }

  if (settingsQuery.isError) {
    return (
      <ScreenErrorState
        message={settingsQuery.error.message}
        onRetry={() => void settingsQuery.refetch()}
      />
    );
  }

  const settings = settingsQuery.data;
  const isCommerceMl = channel === CHANNEL_COMMERCEML;
  const busy =
    saveMutation.isPending ||
    testMutation.isPending ||
    syncMutation.isPending ||
    credentialsMutation.isPending ||
    disconnectMutation.isPending;

  const runSave = () => {
    saveMutation.mutate(
      {
        enabled,
        channel,
        ...(isCommerceMl
          ? { priceTypeIds, warehouseIds }
          : { baseUrl, ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}) }),
      },
      {
        onSuccess: (result) => {
          setApiKey("");
          setFeedback(String(result.message || "Сохранено"));
          setError("");
        },
        onError: (err) => {
          setError(err.message);
          setFeedback("");
        },
      },
    );
  };

  return (
    <>
      <ProfileAccountScrollBody
        style={[styles.container, scrollEnabled ? centeredContentStyle : null]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          !isDrawerLayout ? styles.contentInAccountShell : null,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        accessibilityLabel={UI.TITLE}
      >
        <View style={styles.root}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_ONEC_INTEGRATION}
            onPress={() => setNavSheetVisible(true)}
          />

          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {UI.TITLE}
            </Text>
            <Text style={styles.lead}>{UI.LEAD}</Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.subtitle}>{UI.CHANNEL_TITLE}</Text>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: isCommerceMl, disabled: busy }}
              disabled={busy}
              onPress={() => setChannel(CHANNEL_COMMERCEML)}
              style={[styles.channel, isCommerceMl && styles.channelOn]}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.channelTitle}>{UI.CHANNEL_COMMERCEML}</Text>
                <Text style={styles.hint}>{UI.CHANNEL_COMMERCEML_HINT}</Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: !isCommerceMl, disabled: busy }}
              disabled={busy}
              onPress={() => setChannel(CHANNEL_PULL)}
              style={[styles.channel, !isCommerceMl && styles.channelOn]}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.channelTitle}>{UI.CHANNEL_PULL}</Text>
                <Text style={styles.hint}>{UI.CHANNEL_PULL_HINT}</Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: enabled, disabled: busy }}
              disabled={busy}
              onPress={() => setEnabled((value) => !value)}
              style={styles.checkRow}
            >
              <Text style={styles.checkLabel}>
                {enabled ? "☑ " : "☐ "}
                {UI.LABEL_ENABLED}
              </Text>
            </Pressable>
          </View>

          {isCommerceMl ? (
            <OneCExchangeAccessCard
              settings={settings}
              issuedPassword={issuedPassword}
              busy={busy}
              priceTypeIds={priceTypeIds}
              warehouseIds={warehouseIds}
              isGenerating={credentialsMutation.isPending}
              onGenerate={() =>
                credentialsMutation.mutate(undefined, {
                  onSuccess: (result) => {
                    setIssuedPassword(result.credentials?.password ?? "");
                    setFeedback(String(result.message || "Доступы выданы"));
                    setError("");
                  },
                  onError: (err) => {
                    setError(err.message);
                    setFeedback("");
                  },
                })
              }
              onTogglePriceType={(id) => setPriceTypeIds((list) => toggleIn(list, id))}
              onToggleWarehouse={(id) => setWarehouseIds((list) => toggleIn(list, id))}
            />
          ) : (
            <View style={styles.block}>
              <Text style={styles.hint}>{UI.MOCK_HINT}</Text>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{UI.LABEL_BASE_URL}</Text>
                <TextInput
                  style={styles.input}
                  value={baseUrl}
                  onChangeText={setBaseUrl}
                  placeholder={UI.PLACEHOLDER_BASE_URL}
                  editable={!busy}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{UI.LABEL_API_KEY}</Text>
                <TextInput
                  style={styles.input}
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder={UI.PLACEHOLDER_API_KEY}
                  secureTextEntry
                  editable={!busy}
                  autoCapitalize="none"
                />
                {settings?.hasApiKey ? (
                  <Text style={styles.hint}>
                    {UI.HINT_API_KEY_SET} {settings.apiKeyMasked}. {UI.HINT_LEAVE_KEY}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          {settings ? (
            <Text
              style={[
                styles.status,
                settings.lastSyncStatus === "success" && styles.statusOk,
                settings.lastSyncStatus === "error" && styles.statusErr,
              ]}
            >
              {settings.lastSyncStatus === "success"
                ? UI.STATUS_SUCCESS
                : settings.lastSyncStatus === "error"
                  ? UI.STATUS_ERROR
                  : UI.STATUS_IDLE}
              {settings.lastSyncAt
                ? ` · ${new Date(settings.lastSyncAt).toLocaleString("ru-RU")}`
                : ""}
              {settings.lastSyncError ? ` — ${settings.lastSyncError}` : ""}
            </Text>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {feedback ? <Text style={styles.ok}>{feedback}</Text> : null}

          <View style={styles.actions}>
            <AppButton
              label={saveMutation.isPending ? UI.SAVE_PENDING : UI.SAVE}
              variant="primary"
              disabled={busy}
              onPress={runSave}
            />
            {!isCommerceMl ? (
              <>
                <AppButton
                  label={testMutation.isPending ? UI.TEST_PENDING : UI.TEST}
                  variant="secondary"
                  disabled={busy}
                  onPress={() =>
                    testMutation.mutate(undefined, {
                      onSuccess: (result) => {
                        setFeedback(String(result.message || "OK"));
                        setError("");
                      },
                      onError: (err) => {
                        setError(err.message);
                        setFeedback("");
                      },
                    })
                  }
                />
                <AppButton
                  label={syncMutation.isPending ? UI.SYNC_PENDING : UI.SYNC}
                  variant="secondary"
                  disabled={busy}
                  onPress={() =>
                    syncMutation.mutate(undefined, {
                      onSuccess: (result) => {
                        setFeedback(String(result.message || "Обмен выполнен"));
                        setError("");
                      },
                      onError: (err) => {
                        setError(err.message);
                        setFeedback("");
                      },
                    })
                  }
                />
              </>
            ) : null}
            <AppButton
              label={UI.DISCONNECT}
              variant="secondary"
              disabled={busy}
              onPress={() =>
                Alert.alert(UI.DISCONNECT, UI.DISCONNECT_CONFIRM, [
                  { text: "Отмена", style: "cancel" },
                  {
                    text: UI.DISCONNECT,
                    style: "destructive",
                    onPress: () =>
                      disconnectMutation.mutate(undefined, {
                        onSuccess: (result) => {
                          setBaseUrl("");
                          setApiKey("");
                          setEnabled(false);
                          setFeedback(String(result.message || "Отключено"));
                          setError("");
                        },
                        onError: (err) => {
                          setError(err.message);
                          setFeedback("");
                        },
                      }),
                  },
                ])
              }
            />
          </View>

          {isCommerceMl ? (
            <>
              <View style={styles.block}>
                <Text style={styles.subtitle}>{UI.MAPPING_TITLE}</Text>
                <OneCCategoryMappingTable
                  onError={(message) => {
                    setError(message);
                    setFeedback("");
                  }}
                  onSuccess={(message) => {
                    setFeedback(message);
                    setError("");
                  }}
                />
              </View>
              <View style={styles.block}>
                <Text style={styles.subtitle}>{UI.IMPORTS_TITLE}</Text>
                <Text style={styles.hint}>{UI.IMPORT_HOLD_HINT}</Text>
                <OneCImportJobsList />
              </View>
            </>
          ) : null}

          <View style={styles.block}>
            <Text style={styles.subtitle}>{UI.LOGS_TITLE}</Text>
            {logsQuery.isPending ? (
              <Text style={styles.muted}>{UI.LOADING}</Text>
            ) : !(logsQuery.data?.length ?? 0) ? (
              <Text style={styles.muted}>{UI.LOGS_EMPTY}</Text>
            ) : (
              logsQuery.data?.map((log) => (
                <View key={log._id} style={styles.logItem}>
                  <Text style={styles.badgeText}>{log.status}</Text>
                  <Text style={styles.metaValue}>{log.direction}</Text>
                  <Text style={styles.hint}>{log.message}</Text>
                  <Text style={styles.hint}>
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString("ru-RU")
                      : ""}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ProfileAccountScrollBody>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="onec-integration"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/me")}
      />
    </>
  );
};
