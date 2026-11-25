import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { RAFFLE_PARTICIPANTS_SHEET_UI } from "@/shared/config";
import { pluralizeRu } from "@/shared/lib/pluralizeRu";
import { formatIntegerGroupRu } from "@/shared/lib/rubPriceInput";
import { useRaffleParticipantsSheetStyles } from "@/shared/theme/raffleParticipantsSheetStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

import { useRaffleParticipantsQuery } from "../model/useRaffleParticipantsQuery";

const SKELETON_ROWS = 6;
/** Паритет web `@media (min-width: 641px) max-width: min(26rem, 100%)`. */
const SHEET_DESKTOP_BREAKPOINT_PX = 641;
const SHEET_DESKTOP_MAX_WIDTH_PX = 416;

const resolveSheetMaxWidth = (windowWidth: number): number => {
  if (windowWidth >= SHEET_DESKTOP_BREAKPOINT_PX) {
    return Math.min(SHEET_DESKTOP_MAX_WIDTH_PX, windowWidth);
  }
  return windowWidth;
};

type RaffleParticipantsSheetProps = {
  visible: boolean;
  raffleId: string;
  participantsCount: number;
  onClose: () => void;
};

type ParticipantRow = {
  userId: string;
  userName: string;
  userAvatarUrl: string;
  ticketCount: number;
};

/**
 * Окно «Участники» снизу вверх — паритет web `RaffleParticipantsSheet`.
 * Список грузится при открытии.
 */
export const RaffleParticipantsSheet = ({
  visible,
  raffleId,
  participantsCount,
  onClose,
}: RaffleParticipantsSheetProps) => {
  const styles = useRaffleParticipantsSheetStyles();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const sheetMaxWidth = resolveSheetMaxWidth(windowWidth);
  const router = useRouter();
  const participantsQuery = useRaffleParticipantsQuery({
    raffleId,
    enabled: visible,
  });

  const data = participantsQuery.data ?? null;
  const participants: ParticipantRow[] = data?.participants ?? [];
  const total = data?.total ?? participantsCount;

  const openProfile = (userId: string) => {
    onClose();
    router.push({ pathname: "/user/[id]", params: { id: userId } });
  };

  let body: ReactNode;
  if (participantsQuery.isPending) {
    const skeletonCount = Math.min(SKELETON_ROWS, Math.max(1, participantsCount));
    body = (
      <View
        accessibilityRole="summary"
        accessibilityLabel={RAFFLE_PARTICIPANTS_SHEET_UI.LOADING}
      >
        {Array.from({ length: skeletonCount }, (_, index) => (
          <View
            key={index}
            style={[styles.row, index === 0 && styles.rowFirst]}
            accessibilityElementsHidden
          >
            <View style={styles.skeletonRank} />
            <View style={styles.avatar} />
            <View style={styles.skeletonName} />
            <View style={styles.skeletonCount} />
          </View>
        ))}
        <ActivityIndicator style={{ marginTop: 12 }} />
      </View>
    );
  } else if (participantsQuery.isError) {
    body = (
      <View style={styles.state} accessibilityRole="alert">
        <Text style={styles.stateText}>
          {participantsQuery.error instanceof Error
            ? participantsQuery.error.message
            : RAFFLE_PARTICIPANTS_SHEET_UI.EMPTY}
        </Text>
        <AppButton
          label={RAFFLE_PARTICIPANTS_SHEET_UI.RETRY}
          variant="secondary"
          onPress={() => void participantsQuery.refetch()}
        />
      </View>
    );
  } else if (participants.length === 0) {
    body = (
      <View style={styles.state}>
        <Text style={styles.stateText}>{RAFFLE_PARTICIPANTS_SHEET_UI.EMPTY}</Text>
      </View>
    );
  } else {
    body = (
      <FlatList
        style={{ flex: 1 }}
        data={participants}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
        ListFooterComponent={
          total > participants.length ? (
            <Text style={styles.footnote}>
              {RAFFLE_PARTICIPANTS_SHEET_UI.SHOWN_OF_TOTAL(participants.length, total)}
            </Text>
          ) : null
        }
        renderItem={({ item, index }) => (
          <View style={[styles.row, index === 0 && styles.rowFirst]}>
            <Text style={styles.rank}>{index + 1}</Text>
            <ParticipantAvatar url={item.userAvatarUrl} />
            <Pressable
              style={{ flex: 1, minWidth: 0 }}
              accessibilityRole="button"
              accessibilityLabel={RAFFLE_PARTICIPANTS_SHEET_UI.OPEN_PROFILE_ARIA(
                item.userName,
              )}
              onPress={() => openProfile(item.userId)}
            >
              <Text style={styles.name} numberOfLines={1}>
                {item.userName}
              </Text>
            </Pressable>
            <Text style={styles.count}>
              {formatIntegerGroupRu(item.ticketCount)}{" "}
              {pluralizeRu(item.ticketCount, RAFFLE_PARTICIPANTS_SHEET_UI.ITEM_FORMS)}
            </Text>
          </View>
        )}
      />
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ModalSheetGradientBackdrop />
        <Pressable
          style={styles.dismiss}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={RAFFLE_PARTICIPANTS_SHEET_UI.CLOSE}
        />
        <View
          style={[styles.panel, { maxWidth: sheetMaxWidth }]}
          accessibilityViewIsModal
        >
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title} accessibilityRole="header">
                {RAFFLE_PARTICIPANTS_SHEET_UI.TITLE}
              </Text>
              <View style={styles.totalBadge}>
                <Text style={styles.totalText}>{formatIntegerGroupRu(total)}</Text>
              </View>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.close}>{RAFFLE_PARTICIPANTS_SHEET_UI.CLOSE}</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>{RAFFLE_PARTICIPANTS_SHEET_UI.HINT}</Text>
          <View style={styles.body}>{body}</View>
        </View>
      </View>
    </Modal>
  );
};

function ParticipantAvatar({ url }: { url: string }) {
  const styles = useRaffleParticipantsSheetStyles();
  const [failed, setFailed] = useState(false);
  const picked = pickUserProfilePhotoUrl({ userAvatarUrl: url });
  const src = !failed && picked ? picked : DEFAULT_USER_AVATAR_URL;
  return (
    <Image
      source={{ uri: src }}
      style={styles.avatar}
      contentFit="cover"
      onError={() => setFailed(true)}
    />
  );
}
