import { Pressable, Text, View } from "react-native";

import { resolveInstallmentStatusFilterChipActiveColors } from "@/entities/installment/lib/resolveInstallmentStatusFilterChipColors";
import { INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS } from "@/entities/installment/model/constants";
import { INSTALLMENT_UI } from "@/shared/config";
import { useInstallmentPaymentsPageStyles } from "@/shared/theme/installmentPaymentsPageStyles";

type InstallmentPaymentsPageToolbarProps = {
  title: string;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  contractsCount: number;
};

export const InstallmentPaymentsPageToolbar = ({
  title,
  statusFilter,
  onStatusFilterChange,
  contractsCount,
}: InstallmentPaymentsPageToolbarProps) => {
  const styles = useInstallmentPaymentsPageStyles();

  return (
    <View style={styles.toolbar}>
      <View style={styles.toolbarHead}>
        <Text style={styles.toolbarHeading}>{title}</Text>
        <Text style={styles.contractsCount}>{INSTALLMENT_UI.COUNT_CONTRACTS(contractsCount)}</Text>
      </View>

      <View
        style={styles.statusChips}
        accessibilityRole="tablist"
        accessibilityLabel={INSTALLMENT_UI.CONTRACT_STATUS_FILTER_LABEL}
      >
        {INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS.map((option) => {
          const isActive = statusFilter === option.value;
          const activeColors = isActive
            ? resolveInstallmentStatusFilterChipActiveColors(option.value)
            : null;
          const label = INSTALLMENT_UI[option.labelKey];

          return (
            <Pressable
              key={option.value || "all"}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.statusChip,
                activeColors
                  ? {
                      backgroundColor: activeColors.backgroundColor,
                      borderColor: activeColors.borderColor,
                    }
                  : null,
              ]}
              onPress={() => onStatusFilterChange(option.value)}
            >
              <Text style={[styles.statusChipText, isActive && styles.statusChipTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
