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
    <View style={styles.counterparty}>
      <Text style={styles.counterpartyLabel}>{label}</Text>
      {canLink ? (
        <Pressable onPress={() => onUserClick(String(counterparty._id))}>
          <Text style={styles.counterpartyName}>{displayName}</Text>
        </Pressable>
      ) : (
        <Text style={[styles.counterpartyName, styles.counterpartyNameStatic]}>{displayName}</Text>
      )}
      {phoneHref ? (
        <Pressable onPress={() => openTelHref(phoneHref)}>
          <Text style={[styles.counterpartyDetail, styles.counterpartyPhoneLink]}>
            {phoneDisplay}
          </Text>
        </Pressable>
      ) : (
        <Text style={styles.counterpartyDetail}>{phoneDisplay}</Text>
      )}
      {counterparty.email ? (
        <Text style={styles.counterpartyDetail}>{counterparty.email}</Text>
      ) : null}
    </View>
  );
};
