import { Pressable, ScrollView, View } from "react-native";

import {
  LEGAL_DOCUMENT_TABS,
  type LegalDocumentKind,
} from "@/features/legal/model/legalDocumentPresets";
import { useLegalPageStyles } from "@/shared/theme/accountFeatureStyles";
import { AppText } from "@/shared/ui/AppText";

type LegalDocumentTabBarProps = {
  activeKind: LegalDocumentKind;
  onKindChange: (kind: LegalDocumentKind) => void;
};

export const LegalDocumentTabBar = ({ activeKind, onKindChange }: LegalDocumentTabBarProps) => {
  const styles = useLegalPageStyles();

  return (
    <View style={styles.documentTabBarRoot}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.documentTabBarScrollContent}
      >
        {LEGAL_DOCUMENT_TABS.map((tab) => {
          const isActive = tab.id === activeKind;

          return (
            <Pressable
              key={tab.id}
              style={[styles.documentTab, isActive && styles.documentTabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => onKindChange(tab.id)}
            >
              <AppText style={[styles.documentTabText, isActive && styles.documentTabTextActive]}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
