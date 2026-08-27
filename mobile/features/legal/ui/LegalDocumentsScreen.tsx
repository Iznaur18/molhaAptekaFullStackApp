import { useCallback, useRef, useState } from "react";
import { ScrollView, Text } from "react-native";

import {
  LEGAL_DOCUMENT_PRESETS,
  type LegalDocumentKind,
} from "@/features/legal/model/legalDocumentPresets";
import { LegalDocumentBody } from "@/features/legal/ui/LegalDocumentScreen";
import { LegalDocumentTabBar } from "@/features/legal/ui/LegalDocumentTabBar";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useLegalPageStyles } from "@/shared/theme/accountFeatureStyles";
import { ScreenWithBack } from "@/shared/ui/ScreenWithBack";

type LegalDocumentsScreenProps = {
  initialKind?: LegalDocumentKind;
};

export const LegalDocumentsScreen = ({ initialKind = "terms" }: LegalDocumentsScreenProps) => {
  const scrollRef = useRef<ScrollView>(null);
  // Как web `.app-shell`: на планшете колонка ограничена и центрируется.
  const { centeredContentStyle } = useScreenLayout();
  const styles = useLegalPageStyles();
  const [activeKind, setActiveKind] = useState<LegalDocumentKind>(initialKind);
  const activeDocument = LEGAL_DOCUMENT_PRESETS[activeKind];

  const handleKindChange = useCallback((kind: LegalDocumentKind) => {
    setActiveKind(kind);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  return (
    <ScreenWithBack>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.container, centeredContentStyle]}
      >
        <Text style={styles.title}>{activeDocument.title}</Text>
        <LegalDocumentTabBar activeKind={activeKind} onKindChange={handleKindChange} />
        <LegalDocumentBody {...activeDocument} />
      </ScrollView>
    </ScreenWithBack>
  );
};
