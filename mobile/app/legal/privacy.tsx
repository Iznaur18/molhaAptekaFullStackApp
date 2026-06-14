import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import {
  PRIVACY_POLICY_CONTACT_EMAIL,
  PRIVACY_POLICY_OPERATOR_PLACEHOLDER,
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_UPDATED_AT,
} from "@/features/legal/model/privacyPolicyContent";
import { LEGAL_UI, PRIVACY_POLICY_URL } from "@/shared/config";
import { useLegalPageStyles } from "@/shared/theme/accountFeatureStyles";

const handleOpenWebVersion = async () => {
  if (!PRIVACY_POLICY_URL) {
    return;
  }
  try {
    await Linking.openURL(PRIVACY_POLICY_URL);
  } catch {
    // браузер недоступен
  }
};

export default function PrivacyPolicyScreen() {
  const styles = useLegalPageStyles();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{LEGAL_UI.PRIVACY_TITLE}</Text>
      <Text style={styles.meta}>
        {LEGAL_UI.PRIVACY_UPDATED_PREFIX} {PRIVACY_POLICY_UPDATED_AT}
      </Text>
      <Text style={styles.operator}>{PRIVACY_POLICY_OPERATOR_PLACEHOLDER}</Text>

      {PRIVACY_POLICY_SECTIONS.map((section) => (
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
        {LEGAL_UI.PRIVACY_CONTACT_PREFIX} {PRIVACY_POLICY_CONTACT_EMAIL}
      </Text>

      {PRIVACY_POLICY_URL ? (
        <Pressable style={styles.webLink} onPress={handleOpenWebVersion}>
          <Text style={styles.webLinkText}>{LEGAL_UI.PRIVACY_OPEN_WEB}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
