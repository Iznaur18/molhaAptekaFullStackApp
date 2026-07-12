import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import {
  REGISTRATION_PERSONAL_DATA_CONSENT_OPERATOR,
  REGISTRATION_PERSONAL_DATA_CONSENT_PURPOSES,
  REGISTRATION_PERSONAL_DATA_CONSENT_SUMMARY,
  REGISTRATION_PERSONAL_DATA_CONSENT_WITHDRAWAL,
} from "@/features/legal/model/registrationConsentContent";
import { AUTH_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useLoginScreenStyles } from "@/shared/theme/formChromeStyles";

type RegisterLegalConsentFieldsProps = {
  termsAccepted: boolean;
  personalDataConsentAccepted: boolean;
  disabled?: boolean;
  onTermsAcceptedChange: (value: boolean) => void;
  onPersonalDataConsentAcceptedChange: (value: boolean) => void;
};

type ConsentCheckboxProps = {
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  children: ReactNode;
};

const ConsentCheckbox = ({ checked, disabled = false, onToggle, children }: ConsentCheckboxProps) => {
  const styles = useLoginScreenStyles();
  const { theme } = useAppThemeSettings();

  return (
    <Pressable
      style={styles.consentRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={onToggle}
    >
      <MaterialIcons
        name={checked ? "check-box" : "check-box-outline-blank"}
        size={22}
        color={checked ? theme.colors.action : theme.colors.textMuted}
      />
      <View style={styles.consentTextWrap}>{children}</View>
    </Pressable>
  );
};

export const RegisterLegalConsentFields = ({
  termsAccepted,
  personalDataConsentAccepted,
  disabled = false,
  onTermsAcceptedChange,
  onPersonalDataConsentAcceptedChange,
}: RegisterLegalConsentFieldsProps) => {
  const router = useRouter();
  const styles = useLoginScreenStyles();

  const openLegalRoute = (pathname: "/legal/terms" | "/legal/privacy" | "/legal/listing") => {
    router.push(pathname);
  };

  const handleLegalLinkPress = (
    pathname: "/legal/terms" | "/legal/privacy" | "/legal/listing",
  ) => {
    openLegalRoute(pathname);
  };

  return (
    <View style={styles.consentBlock}>
      <ConsentCheckbox
        checked={termsAccepted}
        disabled={disabled}
        onToggle={() => onTermsAcceptedChange(!termsAccepted)}
      >
        <Text style={styles.consentText}>
          {AUTH_UI.REGISTER_TERMS_CONSENT_PREFIX}
          <Text
            style={styles.consentLink}
            onPress={(event) => {
              event.stopPropagation();
              handleLegalLinkPress("/legal/terms");
            }}
          >
            {AUTH_UI.REGISTER_TERMS_LINK}
          </Text>
          {AUTH_UI.REGISTER_TERMS_CONSENT_AND}
          <Text
            style={styles.consentLink}
            onPress={(event) => {
              event.stopPropagation();
              handleLegalLinkPress("/legal/listing");
            }}
          >
            {AUTH_UI.REGISTER_LISTING_LINK}
          </Text>
        </Text>
      </ConsentCheckbox>

      <ConsentCheckbox
        checked={personalDataConsentAccepted}
        disabled={disabled}
        onToggle={() => onPersonalDataConsentAcceptedChange(!personalDataConsentAccepted)}
      >
        <Text style={styles.consentText}>
          {AUTH_UI.REGISTER_PRIVACY_CONSENT_PREFIX}
          <Text
            style={styles.consentLink}
            onPress={(event) => {
              event.stopPropagation();
              handleLegalLinkPress("/legal/privacy");
            }}
          >
            {AUTH_UI.REGISTER_PRIVACY_CONSENT_LINK}
          </Text>
          {AUTH_UI.REGISTER_PRIVACY_CONSENT_SUFFIX}
          <Text
            style={styles.consentLink}
            onPress={(event) => {
              event.stopPropagation();
              handleLegalLinkPress("/legal/privacy");
            }}
          >
            {AUTH_UI.REGISTER_PRIVACY_LINK}
          </Text>
        </Text>
        <Text style={styles.consentSummary}>{REGISTRATION_PERSONAL_DATA_CONSENT_SUMMARY}</Text>
        <Text style={styles.consentSummary}>{REGISTRATION_PERSONAL_DATA_CONSENT_PURPOSES}</Text>
        <Text style={styles.consentSummary}>{REGISTRATION_PERSONAL_DATA_CONSENT_OPERATOR}</Text>
        <Text style={styles.consentSummary}>{REGISTRATION_PERSONAL_DATA_CONSENT_WITHDRAWAL}</Text>
      </ConsentCheckbox>
    </View>
  );
};
