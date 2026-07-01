import { Pressable, Text, View } from "react-native";

import type { InstallmentCounterparty } from "@/entities/installment/api/installmentApi";
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
      {counterparty.userPhoneNumber ? (
        <Text style={styles.counterpartyDetail}>{counterparty.userPhoneNumber}</Text>
      ) : null}
      {counterparty.email ? (
        <Text style={styles.counterpartyDetail}>{counterparty.email}</Text>
      ) : null}
    </View>
  );
};
