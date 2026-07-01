import { Text, View } from "react-native";

import { INSTALLMENT_UI } from "@/shared/config";
import { useInstallmentModerationPageStyles } from "@/shared/theme/installmentModerationPageStyles";

type InstallmentModerationPageToolbarProps = {
  programsCount: number;
};

export const InstallmentModerationPageToolbar = ({
  programsCount,
}: InstallmentModerationPageToolbarProps) => {
  const styles = useInstallmentModerationPageStyles();

  return (
    <View style={styles.toolbar}>
      <View style={styles.toolbarHead}>
        <Text style={styles.toolbarHeading}>{INSTALLMENT_UI.MODERATION_PAGE_TITLE}</Text>
        <Text style={styles.programsCount}>{INSTALLMENT_UI.COUNT_PROGRAMS(programsCount)}</Text>
      </View>
    </View>
  );
};
