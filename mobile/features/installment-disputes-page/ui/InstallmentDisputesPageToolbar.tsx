import { Text, View } from "react-native";

import { INSTALLMENT_UI } from "@/shared/config";
import { useInstallmentDisputesPageStyles } from "@/shared/theme/installmentDisputesPageStyles";

type InstallmentDisputesPageToolbarProps = {
  disputesCount: number;
};

export const InstallmentDisputesPageToolbar = ({
  disputesCount,
}: InstallmentDisputesPageToolbarProps) => {
  const styles = useInstallmentDisputesPageStyles();

  return (
    <View style={styles.toolbar}>
      <View style={styles.toolbarHead}>
        <Text style={styles.toolbarHeading}>{INSTALLMENT_UI.DISPUTES_PAGE_TITLE}</Text>
        <Text style={styles.disputesCount}>{INSTALLMENT_UI.COUNT_DISPUTES(disputesCount)}</Text>
      </View>
    </View>
  );
};
