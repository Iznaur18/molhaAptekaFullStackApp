import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import type { LegalSection } from "@/features/legal/model/legalSectionTypes";
import { LEGAL_UI } from "@/shared/config";
import { useLegalPageStyles } from "@/shared/theme/accountFeatureStyles";

export type LegalDocumentBodyProps = {
  title: string;
  updatedAt: string;
  operatorPlaceholder: string;
  sections: LegalSection[];
  contactEmail: string;
  webUrl?: string;
};

const handleOpenWebVersion = async (webUrl: string) => {
  try {
    await Linking.openURL(webUrl);
  } catch {
    // браузер недоступен
  }
};

export const LegalDocumentBody = ({
  title,
  updatedAt,
  operatorPlaceholder,
  sections,
  contactEmail,
  webUrl,
}: LegalDocumentBodyProps) => {
  const styles = useLegalPageStyles();

  return (
    <>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>
        {LEGAL_UI.UPDATED_PREFIX} {updatedAt}
      </Text>
      <Text style={styles.operator}>{operatorPlaceholder}</Text>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.paragraphs.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}

      <Text style={styles.contact}>
        {LEGAL_UI.CONTACT_PREFIX} {contactEmail}
      </Text>

      {webUrl ? (
        <Pressable style={styles.webLink} onPress={() => handleOpenWebVersion(webUrl)}>
          <Text style={styles.webLinkText}>{LEGAL_UI.OPEN_WEB}</Text>
        </Pressable>
      ) : null}
    </>
  );
};

export const LegalDocumentScreen = (props: LegalDocumentBodyProps) => {
  const styles = useLegalPageStyles();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LegalDocumentBody {...props} />
    </ScrollView>
  );
};
