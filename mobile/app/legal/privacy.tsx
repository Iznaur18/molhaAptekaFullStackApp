import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  PRIVACY_POLICY_CONTACT_EMAIL,
  PRIVACY_POLICY_OPERATOR_PLACEHOLDER,
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_UPDATED_AT,
} from "@/features/legal/model/privacyPolicyContent";
import { LEGAL_UI, PRIVACY_POLICY_URL } from "@/shared/config";

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

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  meta: {
    marginTop: 8,
    fontSize: 13,
    color: "#666",
  },
  operator: {
    marginTop: 12,
    fontSize: 14,
    color: "#c62828",
    fontStyle: "italic",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
    marginBottom: 8,
  },
  contact: {
    marginTop: 24,
    fontSize: 15,
    color: "#333",
  },
  webLink: {
    marginTop: 16,
    alignSelf: "flex-start",
  },
  webLinkText: {
    fontSize: 15,
    color: "#1565c0",
    fontWeight: "600",
  },
});
