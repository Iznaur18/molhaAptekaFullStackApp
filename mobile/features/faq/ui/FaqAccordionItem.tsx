import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";

import type { FaqItem } from "@/features/faq/model/faqTypes";
import { FAQ_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useFaqPageStyles } from "@/shared/theme/faqPageStyles";

type FaqAccordionItemProps = {
  item: FaqItem;
  expanded: boolean;
  onToggle: () => void;
};

export const FaqAccordionItem = ({ item, expanded, onToggle }: FaqAccordionItemProps) => {
  const styles = useFaqPageStyles();
  const { theme } = useAppThemeSettings();

  return (
    <View style={[styles.item, expanded ? styles.itemExpanded : null]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={FAQ_UI.QUESTION_ARIA(item.question)}
        onPress={onToggle}
        style={styles.questionRow}
      >
        <Text style={styles.questionText}>{item.question}</Text>
        <MaterialIcons
          name={expanded ? "expand-less" : "expand-more"}
          size={22}
          color={theme.colors.textMuted}
        />
      </Pressable>
      {expanded ? <Text style={styles.answer}>{item.answer}</Text> : null}
    </View>
  );
};
