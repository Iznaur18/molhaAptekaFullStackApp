import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { ACCOUNT_REQUIREMENT_MODAL_UI } from "@/shared/config";
import { useRegisterBlockingOverlay } from "@/shared/lib/useBlockingOverlayOccupancy";
import { useAccountRequirementModalStyles } from "@/shared/theme/modalChromeStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

export type AccountRequirement = "premium" | "data-confirmation";

type AccountRequirementModalProps = {
  visible: boolean;
  onClose: () => void;
  requirement: AccountRequirement;
  actionLabel?: string;
};

const REQUIREMENT_ROUTES: Record<AccountRequirement, string> = {
  premium: "/hub/premium",
  "data-confirmation": "/hub/data-confirmation",
};

const REQUIREMENT_META: Record<
  AccountRequirement,
  { icon: keyof typeof MaterialIcons.glyphMap; tone: "premium" | "confirm" }
> = {
  premium: { icon: "workspace-premium", tone: "premium" },
  "data-confirmation": { icon: "verified-user", tone: "confirm" },
};

export const AccountRequirementModal = ({
  visible,
  onClose,
  requirement,
  actionLabel,
}: AccountRequirementModalProps) => {
  const router = useRouter();
  const styles = useAccountRequirementModalStyles();
  useRegisterBlockingOverlay(visible);
  const meta = REQUIREMENT_META[requirement];
  const copy = ACCOUNT_REQUIREMENT_MODAL_UI[requirement];

  const handleCta = () => {
    onClose();
    router.push(REQUIREMENT_ROUTES[requirement] as never);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ModalSheetGradientBackdrop />
        <View style={styles.card} accessibilityRole="alert" accessibilityLabel={ACCOUNT_REQUIREMENT_MODAL_UI.ARIA_DIALOG}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.badge,
                meta.tone === "premium" ? styles.badgePremium : styles.badgeConfirm,
              ]}
            >
              <MaterialIcons
                name={meta.icon}
                size={28}
                style={meta.tone === "premium" ? styles.badgeIconPremium : styles.badgeIconConfirm}
              />
            </View>

            <Text style={styles.title}>{copy.TITLE}</Text>
            <Text style={styles.intro}>{ACCOUNT_REQUIREMENT_MODAL_UI.INTRO(actionLabel)}</Text>
            <Text style={styles.description}>{copy.DESCRIPTION}</Text>

            <Text style={styles.benefitsTitle}>{ACCOUNT_REQUIREMENT_MODAL_UI.BENEFITS_TITLE}</Text>
            <View style={styles.benefits}>
              {copy.BENEFITS.map((benefit) => (
                <View key={benefit} style={styles.benefitRow}>
                  <MaterialIcons name="check" size={18} style={styles.benefitIcon} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              style={meta.tone === "premium" ? styles.ctaPremium : styles.ctaConfirm}
              onPress={handleCta}
            >
              <Text style={styles.ctaText}>{copy.CTA}</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{ACCOUNT_REQUIREMENT_MODAL_UI.CLOSE}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
