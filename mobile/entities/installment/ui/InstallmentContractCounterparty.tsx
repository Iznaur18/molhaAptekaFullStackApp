import { Linking, Pressable, Text, View } from "react-native";

import type { InstallmentCounterparty } from "@/entities/installment/api/installmentApi";
import {
  formatRuPhoneDisplayOrEmpty,
  toRuPhoneTelHref,
} from "@/entities/user/lib/ruPhone";
import { useInstallmentContractCardChromeStyles } from "@/shared/theme/installmentContractCardChromeStyles";

const EM_DASH = "—";

type InstallmentContractCounterpartyProps = {
  label: string;
  counterparty?: InstallmentCounterparty | null;
  onUserClick?: (userId: string) => void;
  compact?: boolean;
};

const formatDisplayName = (counterparty?: InstallmentCounterparty | null) => {
  if (!counterparty) {
    return EM_DASH;
  }
  return counterparty.userName?.trim() || counterparty.email || EM_DASH;
};

const openTelHref = (href: string) => {
  void Linking.openURL(href).catch(() => undefined);
};

export const InstallmentContractCounterparty = ({
  label,
  counterparty,
  onUserClick,
  compact = false,
}: InstallmentContractCounterpartyProps) => {
  const styles = useInstallmentContractCardChromeStyles();

  if (!counterparty?._id) {
    return null;
  }

  const displayName = formatDisplayName(counterparty);
  const canLink = typeof onUserClick === "function";
  const phoneDisplay = formatRuPhoneDisplayOrEmpty(counterparty.userPhoneNumber);
  const phoneHref = toRuPhoneTelHref(counterparty.userPhoneNumber);

  return (
    <View style={[styles.counterparty, compact ? styles.counterpartyCompact : null]}>
      <Text
        style={[
          styles.counterpartyLabel,
          compact ? styles.counterpartyLabelCompact : null,
        ]}
      >
        {label}
      </Text>
      {canLink ? (
        <Pressable onPress={() => onUserClick(String(counterparty._id))}>
          <Text
            style={[
              styles.counterpartyName,
              compact ? styles.counterpartyNameCompact : null,
            ]}
          >
            {displayName}
          </Text>
        </Pressable>
      ) : (
        <Text
          style={[
            styles.counterpartyName,
            styles.counterpartyNameStatic,
            compact ? styles.counterpartyNameCompact : null,
          ]}
        >
          {displayName}
        </Text>
      )}
      {/* web Mobile.css ≤640: `.detail { display: none }` */}
      {!compact && phoneHref ? (
        <Pressable onPress={() => openTelHref(phoneHref)}>
          <Text style={[styles.counterpartyDetail, styles.counterpartyPhoneLink]}>
            {phoneDisplay}
          </Text>
        </Pressable>
      ) : null}
      {!compact && !phoneHref && phoneDisplay !== EM_DASH ? (
        <Text style={styles.counterpartyDetail}>{phoneDisplay}</Text>
      ) : null}
      {!compact && counterparty.email ? (
        <Text style={styles.counterpartyDetail}>{counterparty.email}</Text>
      ) : null}
    </View>
  );
};
