import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useCreateRafflePageStyles } from "@/shared/theme/createRafflePageStyles";

type CreateRaffleFormSectionProps = {
  title: string;
  children: ReactNode;
};

export const CreateRaffleFormSection = ({ title, children }: CreateRaffleFormSectionProps) => {
  const styles = useCreateRafflePageStyles();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
};
