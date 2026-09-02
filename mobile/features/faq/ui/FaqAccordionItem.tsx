import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Linking from "expo-linking";
import { useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import type { FaqItem } from "@/features/faq/model/faqTypes";
import { FaqItemLinkAdminField } from "@/features/faq/ui/FaqItemLinkAdminField";
import { FAQ_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useFaqPageStyles } from "@/shared/theme/faqPageStyles";

type FaqAccordionItemProps = {
  item: FaqItem;
  expanded: boolean;
  href?: string | null;
  isAdmin?: boolean;
  onToggle: () => void;
};

const useOpenFaqHref = () => {
  const router = useRouter();

  return async (href: string) => {
    if (href.startsWith("/")) {
      router.push(href as Href);
      return;
    }

    await Linking.openURL(href);
  };
};

export const FaqAccordionItem = ({
  item,
  expanded,
  href,
  isAdmin = false,
  onToggle,
}: FaqAccordionItemProps) => {
  const styles = useFaqPageStyles();
  const { theme } = useAppThemeSettings();
  const openFaqHref = useOpenFaqHref();

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
      {expanded ? (
        <View style={styles.answerBlock}>
          <Text style={styles.answer}>{item.answer}</Text>
          {href ? (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={FAQ_UI.LINK_ARIA(href)}
              style={styles.linkButton}
              onPress={() => void openFaqHref(href)}
            >
              <Text style={styles.linkButtonText}>{FAQ_UI.LINK_OPEN}</Text>
            </Pressable>
          ) : null}
          {isAdmin ? <FaqItemLinkAdminField itemId={item.id} href={href} /> : null}
        </View>
      ) : null}
    </View>
  );
};
