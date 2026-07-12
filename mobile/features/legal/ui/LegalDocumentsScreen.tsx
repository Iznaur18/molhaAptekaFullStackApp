import { useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";

import {
  LEGAL_DOCUMENT_PRESETS,
  type LegalDocumentKind,
} from "@/features/legal/model/legalDocumentPresets";
import { LegalDocumentBody } from "@/features/legal/ui/LegalDocumentScreen";
import { LegalDocumentTabBar } from "@/features/legal/ui/LegalDocumentTabBar";
import { useLegalPageStyles } from "@/shared/theme/accountFeatureStyles";

type LegalDocumentsScreenProps = {
  initialKind?: LegalDocumentKind;
};

export const LegalDocumentsScreen = ({ initialKind = "terms" }: LegalDocumentsScreenProps) => {
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const styles = useLegalPageStyles();
  const [activeKind, setActiveKind] = useState<LegalDocumentKind>(initialKind);
  const activeDocument = LEGAL_DOCUMENT_PRESETS[activeKind];

  useLayoutEffect(() => {
    navigation.setOptions({ title: activeDocument.title });
  }, [activeDocument.title, navigation]);

  const handleKindChange = useCallback((kind: LegalDocumentKind) => {
    setActiveKind(kind);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
      <LegalDocumentTabBar activeKind={activeKind} onKindChange={handleKindChange} />
      <LegalDocumentBody {...activeDocument} />
    </ScrollView>
  );
};
