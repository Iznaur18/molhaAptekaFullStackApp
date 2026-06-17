import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { RAFFLE_FEATURED_BANNER_UI } from "@/shared/config";
import { useRaffleDescriptionModalStyles } from "@/shared/theme/raffleFeaturedStyles";

type RaffleDescriptionModalProps = {
  visible: boolean;
  title: string;
  description: string;
  onClose: () => void;
};

export const RaffleDescriptionModal = ({
  visible,
  title,
  description,
  onClose,
}: RaffleDescriptionModalProps) => {
  const styles = useRaffleDescriptionModalStyles();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{RAFFLE_FEATURED_BANNER_UI.DESCRIPTION_MODAL_TITLE}</Text>
            <Pressable
              style={styles.closeButton}
              accessibilityRole="button"
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>{RAFFLE_FEATURED_BANNER_UI.CLOSE}</Text>
            </Pressable>
          </View>
          <Text style={styles.raffleTitle}>{title}</Text>
          <ScrollView style={styles.textScroll}>
            <Text style={styles.text}>{description}</Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
