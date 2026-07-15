import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useCreateRafflePageStyles } from "@/shared/theme/createRafflePageStyles";

type CreateRaffleFormSectionProps = {
  title: string;
  children: ReactNode;
  hideTitle?: boolean;
};

export const CreateRaffleFormSection = ({
  title,
  children,
  hideTitle = false,
}: CreateRaffleFormSectionProps) => {
  const styles = useCreateRafflePageStyles();

  return (
    <View style={styles.section}>
      {hideTitle ? null : <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
};
