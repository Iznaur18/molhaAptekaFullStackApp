import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import type { OneCSettings } from "@/entities/onec/api/onecApi";
import { ONEC_INTEGRATION_PAGE_UI as UI } from "@/shared/config";
import { copyTextToClipboard } from "@/shared/lib/copyTextToClipboard";
import { useServicesProfilePageStyles } from "@/shared/theme/servicesProfilePageStyles";
import { AppButton } from "@/shared/ui/AppButton";

type OneCExchangeAccessCardProps = {
  settings: OneCSettings | undefined;
  issuedPassword: string;
  busy: boolean;
  priceTypeIds: string[];
  warehouseIds: string[];
  isGenerating: boolean;
  onGenerate: () => void;
  onTogglePriceType: (id: string) => void;
  onToggleWarehouse: (id: string) => void;
};

const CopyableValue = ({ value, label }: { value: string; label: string }) => {
  const styles = useServicesProfilePageStyles();
  const [copied, setCopied] = useState(false);

  return (
    <View style={styles.copyRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.copyValue} selectable>
        {value || "—"}
      </Text>
      {value ? (
        <AppButton
          label={copied ? UI.COPIED : UI.COPY}
          variant="secondary"
          onPress={() => {
            void copyTextToClipboard(value)
              .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              })
              .catch(() => setCopied(false));
          }}
        />
      ) : null}
    </View>
  );
};

export const OneCExchangeAccessCard = ({
  settings,
  issuedPassword,
  busy,
  priceTypeIds,
  warehouseIds,
  isGenerating,
  onGenerate,
  onTogglePriceType,
  onToggleWarehouse,
}: OneCExchangeAccessCardProps) => {
  const styles = useServicesProfilePageStyles();
  const exchange = settings?.exchange ?? {};
  const knownPriceTypes = exchange.knownPriceTypes ?? [];
  const knownWarehouses = exchange.knownWarehouses ?? [];

  return (
    <View style={styles.block}>
      <Text style={styles.subtitle}>{UI.ACCESS_TITLE}</Text>
      <Text style={styles.hint}>{UI.ACCESS_HINT}</Text>

      <CopyableValue label={UI.LABEL_ENDPOINT} value={exchange.endpointUrl ?? ""} />

      {exchange.login ? (
        <CopyableValue label={UI.LABEL_LOGIN} value={exchange.login} />
      ) : (
        <Text style={styles.muted}>{UI.NO_CREDENTIALS}</Text>
      )}

      {issuedPassword ? (
        <>
          <CopyableValue label={UI.LABEL_PASSWORD} value={issuedPassword} />
          <Text style={styles.warn}>{UI.PASSWORD_ONCE}</Text>
        </>
      ) : null}

      <AppButton
        label={
          isGenerating
            ? UI.GENERATE_PENDING
            : exchange.hasPassword
              ? UI.REGENERATE_CREDENTIALS
              : UI.GENERATE_CREDENTIALS
        }
        variant="secondary"
        disabled={busy}
        onPress={onGenerate}
      />

      <Text style={styles.subtitle}>{UI.FILTERS_TITLE}</Text>
      <Text style={styles.hint}>{UI.FILTERS_HINT}</Text>

      <Text style={styles.fieldLabel}>{UI.PRICE_TYPES_LABEL}</Text>
      {knownPriceTypes.length === 0 ? (
        <Text style={styles.muted}>{UI.PRICE_TYPES_EMPTY}</Text>
      ) : (
        knownPriceTypes.map((row) => {
          const checked = priceTypeIds.includes(row.externalId);
          return (
            <Pressable
              key={row.externalId}
              accessibilityRole="checkbox"
              accessibilityState={{ checked, disabled: busy }}
              disabled={busy}
              onPress={() => onTogglePriceType(row.externalId)}
              style={styles.checkRow}
            >
              <Text style={styles.checkLabel}>
                {checked ? "☑ " : "☐ "}
                {row.name || row.externalId}
              </Text>
            </Pressable>
          );
        })
      )}

      <Text style={styles.fieldLabel}>{UI.WAREHOUSES_LABEL}</Text>
      {knownWarehouses.length === 0 ? (
        <Text style={styles.muted}>{UI.WAREHOUSES_EMPTY}</Text>
      ) : (
        knownWarehouses.map((row) => {
          const checked = warehouseIds.includes(row.externalId);
          return (
            <Pressable
              key={row.externalId}
              accessibilityRole="checkbox"
              accessibilityState={{ checked, disabled: busy }}
              disabled={busy}
              onPress={() => onToggleWarehouse(row.externalId)}
              style={styles.checkRow}
            >
              <Text style={styles.checkLabel}>
                {checked ? "☑ " : "☐ "}
                {row.name || row.externalId}
              </Text>
            </Pressable>
          );
        })
      )}
    </View>
  );
};
