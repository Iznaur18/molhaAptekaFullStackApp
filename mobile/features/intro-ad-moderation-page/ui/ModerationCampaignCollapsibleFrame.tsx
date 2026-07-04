import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { INTRO_AD_MODERATION_PAGE_UI } from "@/shared/config";
import { useIntroAdModerationPageStyles } from "@/shared/theme/introAdModerationPageStyles";

type ModerationCampaignCollapsibleFrameProps = {
  title: string;
  collapsedPreview?: string | null;
  createdLabel?: string | null;
  needsAttention: boolean;
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: () => void;
  children: ReactNode;
};

export const ModerationCampaignCollapsibleFrame = ({
  title,
  collapsedPreview = null,
  createdLabel = null,
  needsAttention,
  collapsible = false,
  expanded = true,
  onExpandedChange,
  children,
}: ModerationCampaignCollapsibleFrameProps) => {
  const styles = useIntroAdModerationPageStyles();
  const isExpanded = !collapsible || expanded;

  return (
    <View style={[needsAttention ? styles.cardAttention : undefined, collapsible ? { gap: 8 } : undefined]}>
      {collapsible ? (
        <Pressable
          style={[
            styles.collapsedToggle,
            needsAttention ? styles.collapsedToggleAttention : null,
          ]}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          onPress={onExpandedChange}
        >
          <View style={styles.collapsedMain}>
            <Text style={styles.collapsedTitle} numberOfLines={2}>
              {title}
            </Text>
            {collapsedPreview && !isExpanded ? (
              <Text style={styles.collapsedPreview}>{collapsedPreview}</Text>
            ) : null}
          </View>
          <View style={styles.collapsedMeta}>
            {createdLabel ? <Text style={styles.collapsedCreated}>{createdLabel}</Text> : null}
            <Text style={styles.collapsedChevron}>{isExpanded ? "▾" : "▸"}</Text>
            <Text style={styles.collapsedExpandLabel}>
              {INTRO_AD_MODERATION_PAGE_UI.EXPAND_TOGGLE(isExpanded)}
            </Text>
          </View>
        </Pressable>
      ) : null}
      {isExpanded ? children : null}
    </View>
  );
};
