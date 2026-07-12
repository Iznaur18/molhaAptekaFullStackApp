import { ScrollView, Text, View } from "react-native";
import { useCallback, useState } from "react";

import { FAQ_ITEMS, FAQ_UPDATED_AT } from "@/features/faq/model/faqContent";
import { FaqAccordionItem } from "@/features/faq/ui/FaqAccordionItem";
import { LEGAL_CONTACT_EMAIL } from "@/features/legal/model/legalSharedConstants";
import { FAQ_UI } from "@/shared/config";
import { useFaqPageStyles } from "@/shared/theme/faqPageStyles";

export const FaqScreen = () => {
  const styles = useFaqPageStyles();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{FAQ_UI.TITLE}</Text>
      <Text style={styles.meta}>
        {FAQ_UI.UPDATED_PREFIX} {FAQ_UPDATED_AT}
      </Text>

      <View style={styles.list}>
        {FAQ_ITEMS.map((item) => (
          <FaqAccordionItem
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onToggle={() => handleToggle(item.id)}
          />
        ))}
      </View>

      <Text style={styles.contact}>
        {FAQ_UI.CONTACT_PREFIX} {LEGAL_CONTACT_EMAIL}
      </Text>
    </ScrollView>
  );
};
