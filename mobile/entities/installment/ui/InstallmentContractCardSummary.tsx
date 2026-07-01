import { Text, View } from "react-native";

import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { INSTALLMENT_CONTRACT_STATUS_COMPLETED } from "@/entities/installment/model/constants";
import { INSTALLMENT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useInstallmentContractCardChromeStyles } from "@/shared/theme/installmentContractCardChromeStyles";

type InstallmentContractCardSummaryProps = {
  contract: InstallmentContract;
  remainingRub: number;
  remainingDays: number;
  paidPercent: number;
};

export const InstallmentContractCardSummary = ({
  contract,
  remainingRub,
  remainingDays,
  paidPercent,
}: InstallmentContractCardSummaryProps) => {
  const styles = useInstallmentContractCardChromeStyles();
  const isCompleted = contract.status === INSTALLMENT_CONTRACT_STATUS_COMPLETED;

  return (
    <View style={styles.summary} accessibilityLabel={INSTALLMENT_UI.CONTRACT_PAID}>
      <View style={styles.summaryTile}>
        <Text style={styles.summaryLabel}>{INSTALLMENT_UI.CONTRACT_PLAN}</Text>
        <Text style={styles.summaryValue}>
          {contract.monthsCount} мес × {formatPriceRub(contract.monthlyPaymentRub)}
        </Text>
      </View>
      <View style={styles.summaryTile}>
        <Text style={styles.summaryLabel}>{INSTALLMENT_UI.CONTRACT_PAID}</Text>
        <Text style={styles.summaryValue}>
          {formatPriceRub(contract.paidAmountRub)}
          <Text style={styles.summaryMuted}> / {formatPriceRub(contract.totalAmountRub)}</Text>
        </Text>
        <Text style={styles.summaryFoot}>{paidPercent}%</Text>
      </View>
      {!isCompleted ? (
        <View style={styles.summaryTile}>
          <Text style={styles.summaryLabel}>{INSTALLMENT_UI.CONTRACT_REMAINING}</Text>
          <Text style={styles.summaryValue}>{formatPriceRub(remainingRub)}</Text>
          <Text style={styles.summaryFoot}>{INSTALLMENT_UI.CONTRACT_DAYS_LEFT(remainingDays)}</Text>
        </View>
      ) : null}
    </View>
  );
};
