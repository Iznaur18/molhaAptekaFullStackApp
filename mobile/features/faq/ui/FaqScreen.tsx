import { ScrollView, Text, View } from "react-native";
import { useCallback, useMemo, useState } from "react";

import { useFaqItemLinksQuery } from "@/entities/faq-item-link/model/useFaqItemLinksQuery";
import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { FAQ_SECTIONS, FAQ_UPDATED_AT } from "@/features/faq/model/faqContent";
import { FaqAccordionItem } from "@/features/faq/ui/FaqAccordionItem";
import { LEGAL_CONTACT_EMAIL } from "@/features/legal/model/legalSharedConstants";
import { FAQ_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useFaqPageStyles } from "@/shared/theme/faqPageStyles";

export const FaqScreen = () => {
  const styles = useFaqPageStyles();
  const { centeredContentStyle } = useScreenLayout();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { isAdmin } = useUserAccess();
  const linksQuery = useFaqItemLinksQuery();

  const linksByItemId = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of linksQuery.data ?? []) {
      if (row.href) {
        map.set(row.itemId, row.href);
      }
    }
    return map;
  }, [linksQuery.data]);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  return (
    <ScrollView contentContainerStyle={[styles.container, centeredContentStyle]}>
      <Text style={styles.title}>{FAQ_UI.TITLE}</Text>
      <Text style={styles.meta}>
        {FAQ_UI.UPDATED_PREFIX} {FAQ_UPDATED_AT}
      </Text>

      <View style={styles.sections}>
        {FAQ_SECTIONS.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.list}>
              {section.items.map((item) => (
                <FaqAccordionItem
                  key={item.id}
                  item={item}
                  expanded={expandedId === item.id}
                  href={linksByItemId.get(item.id) ?? null}
                  isAdmin={isAdmin}
                  onToggle={() => handleToggle(item.id)}
                />
              ))}
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.contact}>
        {FAQ_UI.CONTACT_PREFIX} {LEGAL_CONTACT_EMAIL}
      </Text>
    </ScrollView>
  );
};
